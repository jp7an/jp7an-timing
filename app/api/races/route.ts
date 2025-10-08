import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    const where = eventId ? { eventId } : {}
    
    const races = await prisma.race.findMany({
      where,
      include: {
        event: true,
        classes: true,
        _count: {
          select: {
            readings: true,
            results: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    
    return NextResponse.json(races)
  } catch (error) {
    console.error('Error fetching races:', error)
    return NextResponse.json(
      { error: 'Failed to fetch races' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const race = await prisma.race.create({
      data: {
        eventId: body.eventId,
        name: body.name,
        raceType: body.raceType,
        startTime: body.startTime ? new Date(body.startTime) : null,
        gunStartTime: body.gunStartTime ? new Date(body.gunStartTime) : null,
        chipTimeRequired: body.chipTimeRequired ?? false,
        startToFinishMinTime: body.startToFinishMinTime ?? (body.raceType === 'NORMAL' ? 5 : null),
        lapDistance: body.lapDistance,
        numberOfLaps: body.numberOfLaps,
        raceDurationMinutes: body.raceDurationMinutes,
        backyardLapDistance: body.backyardLapDistance,
        backyardLapTimeMinutes: body.backyardLapTimeMinutes
      }
    })
    
    return NextResponse.json(race, { status: 201 })
  } catch (error) {
    console.error('Error creating race:', error)
    return NextResponse.json(
      { error: 'Failed to create race' },
      { status: 500 }
    )
  }
}
