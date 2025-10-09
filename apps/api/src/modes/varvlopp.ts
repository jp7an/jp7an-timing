import { Participant, Passage } from '@prisma/client';
import { RaceModeCalculator, RaceModeConfig, ParticipantResult } from './base';

/**
 * Varvlopp mode: Fixed number of laps, winner is fastest
 */
export class VarvloppModeCalculator implements RaceModeCalculator {
  calculateResults(
    participants: Participant[],
    passages: Passage[],
    config: RaceModeConfig
  ): ParticipantResult[] {
    const results: ParticipantResult[] = [];
    const settings = config.settings as { totalLaps?: number } | null;
    const totalLaps = settings?.totalLaps || 10;

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
          passages: [],
        });
        continue;
      }

      const completedLaps = participantPassages.length - 1; // First passage is start
      const lastPassage = participantPassages[participantPassages.length - 1].timestamp;
      
      let status: ParticipantResult['status'] = 'RUNNING';
      let time: number | undefined;

      if (completedLaps >= totalLaps) {
        status = 'FINISHED';
        const startTime = participantPassages[0].timestamp;
        const finishTime = participantPassages[totalLaps].timestamp;
        time = finishTime.getTime() - startTime.getTime();
      }

      results.push({
        participantId: participant.id,
        participant,
        laps: completedLaps,
        time,
        status,
        lastPassage,
        passages: participantPassages,
      });
    }

    // Sort by status and time
    results.sort((a, b) => {
      if (a.status === 'FINISHED' && b.status === 'FINISHED') {
        return (a.time || 0) - (b.time || 0);
      }
      if (a.status === 'FINISHED') return -1;
      if (b.status === 'FINISHED') return 1;
      return (b.laps || 0) - (a.laps || 0);
    });

    // Assign positions
    let position = 1;
    for (const result of results) {
      if (result.status === 'FINISHED') {
        result.position = position++;
      }
    }

    return results;
  }

  validatePassage(_passage: Passage, _config: RaceModeConfig): boolean {
    return true;
  }
}
