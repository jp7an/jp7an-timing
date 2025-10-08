import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { raceId, chipEpc, timestamp, antennaId, rssi } = body
    
    // Find participant by chip EPC
    const participant = await prisma.participant.findUnique({
      where: { chipEpc }
    })
    
    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found for this chip' },
        { status: 404 }
      )
    }
    
    // Get race details
    const race = await prisma.race.findUnique({
      where: { id: raceId }
    })
    
    if (!race) {
      return NextResponse.json(
        { error: 'Race not found' },
        { status: 404 }
      )
    }
    
    // Get existing readings for this participant in this race
    const existingReadings = await prisma.chipReading.findMany({
      where: {
        raceId,
        participantId: participant.id
      },
      orderBy: {
        timestamp: 'asc'
      }
    })
    
    const readingTime = new Date(timestamp)
    
    // Determine if this is a start or finish reading
    let isStart = false
    let isFinish = false
    let lapNumber = null
    
    if (existingReadings.length === 0) {
      // First reading is always start
      isStart = true
      lapNumber = 0
    } else {
      // Subsequent readings depend on race type
      if (race.raceType === 'NORMAL') {
        const firstReading = existingReadings[0]
        const timeSinceStart = readingTime.getTime() - firstReading.timestamp.getTime()
        const minTimeMs = (race.startToFinishMinTime || 5) * 60 * 1000
        
        if (timeSinceStart >= minTimeMs) {
          isFinish = true
        }
      } else if (race.raceType === 'LAP' || race.raceType === 'BACKYARD' || race.raceType === 'TIME') {
        // Each reading after the first is a lap completion
        lapNumber = existingReadings.length
      }
    }
    
    // Create the reading
    const reading = await prisma.chipReading.create({
      data: {
        raceId,
        participantId: participant.id,
        chipEpc,
        timestamp: readingTime,
        antennaId,
        rssi,
        lapNumber,
        isStart,
        isFinish
      }
    })
    
    // Update participant status
    if (isStart && participant.status === 'CHECKED_IN') {
      await prisma.participant.update({
        where: { id: participant.id },
        data: { status: 'STARTED' }
      })
    } else if (isFinish && participant.status === 'STARTED') {
      await prisma.participant.update({
        where: { id: participant.id },
        data: { status: 'FINISHED' }
      })
    }
    
    return NextResponse.json(reading, { status: 201 })
  } catch (error) {
    console.error('Error processing chip reading:', error)
    return NextResponse.json(
      { error: 'Failed to process chip reading' },
      { status: 500 }
    )
  }
}
