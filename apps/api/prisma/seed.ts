import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a sample event
  const event = await prisma.event.create({
    data: {
      name: 'Test Race 2024',
      slug: 'test-race-2024',
      description: 'En testrace för att prova systemet',
      mode: 'NORMAL',
      date: new Date('2024-12-31'),
      location: 'Stockholm',
      isActive: true,
    },
  });

  console.log(`Created event: ${event.name}`);

  // Create classes
  const classM = await prisma.class.create({
    data: {
      eventId: event.id,
      name: 'Herrar',
      gender: 'MALE',
    },
  });

  const classF = await prisma.class.create({
    data: {
      eventId: event.id,
      name: 'Damer',
      gender: 'FEMALE',
    },
  });

  console.log(`Created classes: ${classM.name}, ${classF.name}`);

  // Create sample participants
  const participants = [];
  
  for (let i = 1; i <= 5; i++) {
    const participant = await prisma.participant.create({
      data: {
        eventId: event.id,
        classId: i % 2 === 0 ? classM.id : classF.id,
        firstName: `Testare${i}`,
        lastName: `Testsson`,
        email: `test${i}@example.com`,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        birthDate: new Date('1990-01-01'),
        club: 'Test IK',
        nationality: 'SE',
        registrationNumber: `JP${100000 + i}`,
        epc: `EPC${i.toString().padStart(6, '0')}`,
        bib: i.toString(),
        gdprConsent: true,
        gdprConsentAt: new Date(),
        paymentStatus: 'PAID',
      },
    });
    participants.push(participant);
  }

  console.log(`Created ${participants.length} participants`);

  // Create sample passages for a race simulation
  const startTime = new Date('2024-12-31T10:00:00Z');
  
  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i];
    
    // Start passage
    await prisma.passage.create({
      data: {
        eventId: event.id,
        participantId: participant.id,
        epc: participant.epc!,
        timestamp: new Date(startTime.getTime() + i * 1000),
        checkpoint: 'START',
        lapNumber: 0,
      },
    });

    // Finish passage (after random time between 30-60 minutes)
    const finishTime = startTime.getTime() + (30 + Math.random() * 30) * 60 * 1000 + i * 1000;
    await prisma.passage.create({
      data: {
        eventId: event.id,
        participantId: participant.id,
        epc: participant.epc!,
        timestamp: new Date(finishTime),
        checkpoint: 'FINISH',
        lapNumber: 1,
      },
    });
  }

  console.log('Created sample passages');

  // Create a Backyard event
  const backyardEvent = await prisma.event.create({
    data: {
      name: 'Backyard Ultra Test',
      slug: 'backyard-ultra-test',
      description: 'Test av Backyard Ultra-format',
      mode: 'BACKYARD',
      date: new Date('2025-01-15'),
      location: 'Göteborg',
      isActive: true,
      modeSettings: {
        yardDistance: 6706,
        yardTimeLimit: 3600000, // 1 hour
      },
    },
  });

  console.log(`Created backyard event: ${backyardEvent.name}`);

  console.log('✓ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
