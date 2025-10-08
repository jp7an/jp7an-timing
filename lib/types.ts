/**
 * Type definitions for the timing system
 */

export type RaceType = 'NORMAL' | 'BACKYARD' | 'LAP' | 'TIME'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type PaymentStatus = 'PENDING' | 'PAID' | 'CONFIRMED'
export type ParticipantStatus = 
  | 'REGISTERED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'STARTED'
  | 'FINISHED'
  | 'DNF'
  | 'DNS'

export interface LiveResultRow {
  participantId: string
  bibNumber: number | null
  firstName: string
  lastName: string
  club: string | null
  place: number | null
  gunTime: number | null
  chipTime: number | null
  pace: number | null
  laps: number | null
  totalDistance: number | null
  lastLapTime: number | null
  averageLapTime: number | null
  estimatedFinishDistance: number | null
  status: ParticipantStatus
}

export interface LapTime {
  lapNumber: number
  time: number // milliseconds
  timestamp: Date
}

export interface ChipReadingData {
  chipEpc: string
  timestamp: Date
  antennaId?: number
  rssi?: number
}

export interface RegistrationData {
  firstName: string
  lastName: string
  gender: Gender
  dateOfBirth: Date
  email: string
  club?: string
  nationality: string
  classId?: string
}
