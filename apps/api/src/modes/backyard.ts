import { Participant, Passage } from '@prisma/client';
import { RaceModeCalculator, RaceModeConfig, ParticipantResult } from './base';

/**
 * Backyard mode: Last person standing format
 * Each yard (loop) must be completed within a time limit
 */
export class BackyardModeCalculator implements RaceModeCalculator {
  calculateResults(
    participants: Participant[],
    passages: Passage[],
    config: RaceModeConfig
  ): ParticipantResult[] {
    const results: ParticipantResult[] = [];
    const yardDistance = config.settings?.yardDistance || 6706; // meters
    const yardTimeLimit = config.settings?.yardTimeLimit || 3600000; // 1 hour in ms

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

      let completedYards = 0;
      let lastYardStart = participantPassages[0].timestamp;

      for (let i = 1; i < participantPassages.length; i++) {
        const yardTime = participantPassages[i].timestamp.getTime() - lastYardStart.getTime();
        
        if (yardTime <= yardTimeLimit) {
          completedYards++;
          lastYardStart = participantPassages[i].timestamp;
        } else {
          break; // Failed to complete within time limit
        }
      }

      const lastPassage = participantPassages[participantPassages.length - 1].timestamp;
      const totalDistance = completedYards * yardDistance;

      results.push({
        participantId: participant.id,
        participant,
        laps: completedYards,
        distance: totalDistance,
        status: 'FINISHED',
        lastPassage,
        passages: participantPassages,
      });
    }

    // Sort by completed yards (descending)
    results.sort((a, b) => (b.laps || 0) - (a.laps || 0));

    // Assign positions
    let position = 1;
    for (const result of results) {
      if (result.status === 'FINISHED' && (result.laps || 0) > 0) {
        result.position = position++;
      }
    }

    return results;
  }

  validatePassage(passage: Passage, config: RaceModeConfig): boolean {
    return true;
  }
}
