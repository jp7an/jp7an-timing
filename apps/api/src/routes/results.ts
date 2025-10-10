import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { getModeCalculator } from '../modes';

const router = Router();

// Get results for an event
router.get('/event/:eventSlug', async (req: Request, res: Response) => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        slug: req.params.eventSlug,
      },
      include: {
        classes: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Evenemang hittades inte' });
    }

    // Get all participants
    const participants = await prisma.participant.findMany({
      where: {
        eventId: event.id,
      },
      include: {
        class: true,
      },
    });

    // Get all passages
    const passages = await prisma.passage.findMany({
      where: {
        eventId: event.id,
        isValid: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Calculate results using the appropriate mode calculator
    const calculator = getModeCalculator(event.mode);
    const results = calculator.calculateResults(participants, passages, {
      mode: event.mode,
      settings: event.modeSettings,
    });

    res.json({
      event,
      results,
      totalParticipants: participants.length,
      totalPassages: passages.length,
    });
  } catch (error) {
    console.error('Error calculating results:', error);
    res.status(500).json({ error: 'Kunde inte beräkna resultat' });
  }
});

// Get results by class
router.get('/event/:eventSlug/class/:className', async (req: Request, res: Response) => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        slug: req.params.eventSlug,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Evenemang hittades inte' });
    }

    const classItem = await prisma.class.findFirst({
      where: {
        eventId: event.id,
        name: req.params.className,
      },
    });

    if (!classItem) {
      return res.status(404).json({ error: 'Klass hittades inte' });
    }

    // Get participants in this class
    const participants = await prisma.participant.findMany({
      where: {
        eventId: event.id,
        classId: classItem.id,
      },
      include: {
        class: true,
      },
    });

    // Get passages for these participants
    const participantIds = participants.map((p) => p.id);
    const passages = await prisma.passage.findMany({
      where: {
        eventId: event.id,
        participantId: { in: participantIds },
        isValid: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Calculate results
    const calculator = getModeCalculator(event.mode);
    const results = calculator.calculateResults(participants, passages, {
      mode: event.mode,
      settings: event.modeSettings,
    });

    res.json({
      event,
      class: classItem,
      results,
    });
  } catch (error) {
    console.error('Error calculating class results:', error);
    res.status(500).json({ error: 'Kunde inte beräkna resultat för klass' });
  }
});

// Get participant result details
router.get('/participant/:participantId', async (req: Request, res: Response) => {
  try {
    const participant = await prisma.participant.findUnique({
      where: {
        id: req.params.participantId,
      },
      include: {
        event: true,
        class: true,
      },
    });

    if (!participant) {
      return res.status(404).json({ error: 'Deltagare hittades inte' });
    }

    const passages = await prisma.passage.findMany({
      where: {
        participantId: participant.id,
        isValid: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Calculate result for this participant
    const calculator = getModeCalculator(participant.event.mode);
    const results = calculator.calculateResults([participant], passages, {
      mode: participant.event.mode,
      settings: participant.event.modeSettings,
    });

    res.json({
      participant,
      result: results[0],
      passages,
    });
  } catch (error) {
    console.error('Error getting participant result:', error);
    res.status(500).json({ error: 'Kunde inte hämta resultat' });
  }
});

export default router;
