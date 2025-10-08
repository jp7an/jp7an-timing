import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculatePace } from '@/lib/time-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const raceId = searchParams.get('raceId')
    
    if (!raceId) {
      return NextResponse.json(
        { error: 'Race ID is required' },
        { status: 400 }
      )
    }
    
    const race = await prisma.race.findUnique({
      where: { id: raceId }
    })
    
    if (!race || race.raceType !== 'NORMAL') {
      return NextResponse.json(
        { error: 'Invalid race' },
        { status: 400 }
      )
    }
    
    const results = await prisma.chipReading.findMany({
      where: {
        raceId,
        isFinish: true
      },
      include: {
        participant: {
          include: {
            class: true
          }
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    })
    
    const liveResults = []
    
    for (const reading of results) {
      const startReading = await prisma.chipReading.findFirst({
        where: {
          raceId,
          participantId: reading.participantId,
          isStart: true
        }
      })
      
      const gunTime = race.gunStartTime 
        ? reading.timestamp.getTime() - race.gunStartTime.getTime()
        : null
        
      const chipTime = startReading
        ? reading.timestamp.getTime() - startReading.timestamp.getTime()
        : null
      
      const distance = reading.participant.class?.distance || 0
      const pace = chipTime ? calculatePace(chipTime, distance) : null
      
      liveResults.push({
        participantId: reading.participant.id,
        bibNumber: reading.participant.bibNumber,
        firstName: reading.participant.firstName,
        lastName: reading.participant.lastName,
        club: reading.participant.club,
        place: 0, // Will be set after sorting
        gunTime,
        chipTime,
        pace,
        distance,
        status: reading.participant.status
      })
    }
    
    // Sort by gun time
    liveResults.sort((a, b) => (a.gunTime || 0) - (b.gunTime || 0))
    
    // Add placements
    liveResults.forEach((result, index) => {
      result.place = index + 1
    })
    
    return NextResponse.json(liveResults)
  } catch (error) {
    console.error('Error fetching live results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live results' },
      { status: 500 }
    )
  }
}
