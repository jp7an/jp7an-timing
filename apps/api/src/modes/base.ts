import { Participant, Passage } from '@prisma/client';

export interface RaceModeConfig {
  mode: string;
  settings: any;
}

export interface ParticipantResult {
  participantId: string;
  participant: Participant;
  position?: number;
  time?: number; // in milliseconds
  laps?: number;
  distance?: number; // in meters
  status: 'RUNNING' | 'FINISHED' | 'DNF' | 'DNS' | 'DQ';
  lastPassage?: Date;
  passages: Passage[];
}

export interface RaceModeCalculator {
  calculateResults(
    participants: Participant[],
    passages: Passage[],
    config: RaceModeConfig
  ): ParticipantResult[];
  
  validatePassage(passage: Passage, config: RaceModeConfig): boolean;
}
