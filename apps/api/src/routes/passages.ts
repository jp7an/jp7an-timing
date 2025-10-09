import { Router } from 'express';
import { prisma } from '../config/prisma';
import { adminAuth } from '../middleware/auth';
import { verifyHMAC } from '../middleware/hmac';

const router = Router();

// Get passages for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const passages = await prisma.passage.findMany({
      where: {
        eventId: req.params.eventId,
      },
      include: {
        participant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bib: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: parseInt(req.query.limit as string) || 100,
    });

    res.json(passages);
  } catch (error) {
    console.error('Error fetching passages:', error);
    res.status(500).json({ error: 'Kunde inte hämta passeringar' });
  }
});

// Get passages for a participant
router.get('/participant/:participantId', async (req, res) => {
  try {
    const passages = await prisma.passage.findMany({
      where: {
        participantId: req.params.participantId,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    res.json(passages);
  } catch (error) {
    console.error('Error fetching passages:', error);
    res.status(500).json({ error: 'Kunde inte hämta passeringar' });
  }
});

// Create passage from gateway (with HMAC verification)
router.post('/gateway', verifyHMAC, async (req, res) => {
  try {
    const { epc, timestamp, checkpoint, readerInfo } = req.body;

    if (!epc || !timestamp) {
      return res.status(400).json({ error: 'Saknade obligatoriska fält' });
    }

    // Find participant by EPC
    const participant = await prisma.participant.findUnique({
      where: { epc },
      include: { event: true },
    });

    if (!participant) {
      return res.status(404).json({ error: 'Deltagare med denna EPC hittades inte' });
    }

    // Create passage
    const passage = await prisma.passage.create({
      data: {
        eventId: participant.eventId,
        participantId: participant.id,
        epc,
        timestamp: new Date(timestamp),
        checkpoint,
        readerInfo,
      },
    });

    res.status(201).json(passage);
  } catch (error) {
    console.error('Error creating passage from gateway:', error);
    res.status(500).json({ error: 'Kunde inte skapa passering' });
  }
});

// Create passage manually (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { eventId, participantId, epc, timestamp, checkpoint, lapNumber } = req.body;

    if (!eventId || !participantId || !epc || !timestamp) {
      return res.status(400).json({ error: 'Saknade obligatoriska fält' });
    }

    const passage = await prisma.passage.create({
      data: {
        eventId,
        participantId,
        epc,
        timestamp: new Date(timestamp),
        checkpoint,
        lapNumber,
      },
      include: {
        participant: {
          select: {
            firstName: true,
            lastName: true,
            bib: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        eventId,
        action: 'CREATE_PASSAGE',
        entityType: 'Passage',
        entityId: passage.id,
        changes: { participantId, timestamp },
        performedBy: 'admin',
      },
    });

    res.status(201).json(passage);
  } catch (error) {
    console.error('Error creating passage:', error);
    res.status(500).json({ error: 'Kunde inte skapa passering' });
  }
});

// Update passage (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { timestamp, checkpoint, lapNumber, isValid, invalidReason } = req.body;

    const passage = await prisma.passage.update({
      where: {
        id: req.params.id,
      },
      data: {
        ...(timestamp && { timestamp: new Date(timestamp) }),
        ...(checkpoint !== undefined && { checkpoint }),
        ...(lapNumber !== undefined && { lapNumber }),
        ...(isValid !== undefined && { isValid }),
        ...(invalidReason !== undefined && { invalidReason }),
      },
    });

    res.json(passage);
  } catch (error) {
    console.error('Error updating passage:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera passering' });
  }
});

// Delete passage (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const passage = await prisma.passage.findUnique({
      where: { id: req.params.id },
    });

    if (!passage) {
      return res.status(404).json({ error: 'Passering hittades inte' });
    }

    await prisma.passage.delete({
      where: {
        id: req.params.id,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        eventId: passage.eventId,
        action: 'DELETE_PASSAGE',
        entityType: 'Passage',
        entityId: passage.id,
        performedBy: 'admin',
      },
    });

    res.json({ message: 'Passering raderad' });
  } catch (error) {
    console.error('Error deleting passage:', error);
    res.status(500).json({ error: 'Kunde inte radera passering' });
  }
});

export default router;
