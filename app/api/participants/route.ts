import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateRegistrationNumber(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  return `${timestamp}${random}`.toUpperCase()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status')
    
    const where: Record<string, unknown> = {}
    if (eventId) where.eventId = eventId
    if (status) where.status = status
    
    const participants = await prisma.participant.findMany({
      where,
      include: {
        event: true,
        class: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(participants)
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const registrationNumber = generateRegistrationNumber()
    
    const participant = await prisma.participant.create({
      data: {
        eventId: body.eventId,
        classId: body.classId,
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender,
        dateOfBirth: new Date(body.dateOfBirth),
        email: body.email,
        club: body.club,
        nationality: body.nationality || 'SE',
        registrationNumber,
        paymentStatus: 'PENDING',
        status: 'REGISTERED'
      }
    })
    
    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    console.error('Error creating participant:', error)
    return NextResponse.json(
      { error: 'Failed to create participant' },
      { status: 500 }
    )
  }
}
