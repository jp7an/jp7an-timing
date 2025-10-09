import { Participant, Passage } from '@prisma/client';
import { RaceModeCalculator, RaceModeConfig, ParticipantResult } from './base';

/**
 * Normal mode: Traditional race with start and finish times
 */
export class NormalModeCalculator implements RaceModeCalculator {
  calculateResults(
    participants: Participant[],
    passages: Passage[],
    _config: RaceModeConfig
  ): ParticipantResult[] {
    const results: ParticipantResult[] = [];

    for (const participant of participants) {
      const participantPassages = passages
        .filter((p) => p.participantId === participant.id)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      if (participantPassages.length === 0) {
        results.push({
          participantId: participant.id,
          participant,
          status: 'DNS',
          passages: [],
        });
        continue;
      }

      const startTime = participantPassages[0].timestamp;
      const finishPassage = participantPassages[participantPassages.length - 1];
      const finishTime = finishPassage.timestamp;

      const time = finishTime.getTime() - startTime.getTime();

      results.push({
        participantId: participant.id,
        participant,
        time,
        status: 'FINISHED',
        lastPassage: finishTime,
        passages: participantPassages,
      });
    }

    // Sort by time (ascending)
    results.sort((a, b) => {
      if (a.status === 'FINISHED' && b.status === 'FINISHED') {
        return (a.time || 0) - (b.time || 0);
      }
      if (a.status === 'FINISHED') return -1;
      if (b.status === 'FINISHED') return 1;
      return 0;
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
    return true; // Basic validation
  }
}
