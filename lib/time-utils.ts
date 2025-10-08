/**
 * Utility functions for time calculations and formatting
 */

/**
 * Format milliseconds to HH:MM:SS format
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Calculate pace in min/km from time (ms) and distance (meters)
 */
export function calculatePace(timeMs: number, distanceMeters: number): number {
  if (distanceMeters === 0) return 0
  const distanceKm = distanceMeters / 1000
  const timeMinutes = timeMs / 60000
  return timeMinutes / distanceKm
}

/**
 * Format pace as MM:SS/km
 */
export function formatPace(paceMinPerKm: number): string {
  const minutes = Math.floor(paceMinPerKm)
  const seconds = Math.floor((paceMinPerKm - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Calculate speed in km/h from time (ms) and distance (meters)
 */
export function calculateSpeed(timeMs: number, distanceMeters: number): number {
  if (timeMs === 0) return 0
  const distanceKm = distanceMeters / 1000
  const timeHours = timeMs / 3600000
  return distanceKm / timeHours
}

/**
 * Calculate estimated finish distance based on current pace
 */
export function estimateFinishDistance(
  currentLaps: number,
  lapDistance: number,
  elapsedTimeMs: number,
  totalRaceTimeMs: number
): number {
  if (elapsedTimeMs === 0) return currentLaps * lapDistance
  
  const currentDistance = currentLaps * lapDistance
  const remainingTimeMs = totalRaceTimeMs - elapsedTimeMs
  const averageSpeed = calculateSpeed(elapsedTimeMs, currentDistance)
  const remainingDistanceMeters = (averageSpeed * (remainingTimeMs / 3600000)) * 1000
  
  return currentDistance + remainingDistanceMeters
}
