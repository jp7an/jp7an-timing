import { Participant, Passage } from '@prisma/client';
import { RaceModeCalculator, RaceModeConfig, ParticipantResult } from './base';

/**
 * Tidslopp mode: Fixed time limit, winner covers most distance
 */
export class TidsloppModeCalculator implements RaceModeCalculator {
  calculateResults(
    participants: Participant[],
    passages: Passage[],
    config: RaceModeConfig
  ): ParticipantResult[] {
    const results: ParticipantResult[] = [];
    const timeLimit = config.settings?.timeLimit || 3600000; // 1 hour in ms
    const lapDistance = config.settings?.lapDistance || 400; // meters

    for (const participant of participants) {
      const participantPassages = passages
        .filter((p) => p.participantId === participant.id)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      if (participantPassages.length === 0) {
        results.push({
          participantId: participant.id,
          participant,
          status: 'DNS',
          laps: 0,
          distance: 0,
          passages: [],
        });
        continue;
      }

      const startTime = participantPassages[0].timestamp;
      const endTime = new Date(startTime.getTime() + timeLimit);

      // Count laps completed within time limit
      let completedLaps = 0;
      let lastValidPassage = participantPassages[0];

      for (let i = 1; i < participantPassages.length; i++) {
        if (participantPassages[i].timestamp <= endTime) {
          completedLaps++;
          lastValidPassage = participantPassages[i];
        } else {
          break;
        }
      }

      const totalDistance = completedLaps * lapDistance;

      results.push({
        participantId: participant.id,
        participant,
        laps: completedLaps,
        distance: totalDistance,
        status: 'FINISHED',
        lastPassage: lastValidPassage.timestamp,
        passages: participantPassages,
      });
    }

    // Sort by distance (descending)
    results.sort((a, b) => (b.distance || 0) - (a.distance || 0));

    // Assign positions
    let position = 1;
    for (const result of results) {
      if (result.status === 'FINISHED' && (result.distance || 0) > 0) {
        result.position = position++;
      }
    }

    return results;
  }

  validatePassage(passage: Passage, config: RaceModeConfig): boolean {
    return true;
  }
}
