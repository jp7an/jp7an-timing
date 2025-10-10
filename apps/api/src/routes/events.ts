import { Router } from 'express';
import { prisma } from '../config/prisma';
import { adminAuth } from '../middleware/auth';

const router = Router();

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    // Allow fetching all events (including inactive) with ?all=true query parameter
    const includeAll = req.query.all === 'true';
    
    const events = await prisma.event.findMany({
      where: includeAll ? {} : {
        isActive: true,
      },
      include: {
        classes: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Kunde inte hämta evenemang' });
  }
});

// Get event by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        slug: req.params.slug,
      },
      include: {
        classes: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Evenemang hittades inte' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Kunde inte hämta evenemang' });
  }
});

// Create event (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, slug, description, mode, date, location, modeSettings } = req.body;

    if (!name || !slug || !mode || !date) {
      return res.status(400).json({ error: 'Saknade obligatoriska fält' });
    }

    const event = await prisma.event.create({
      data: {
        name,
        slug,
        description,
        mode,
        date: new Date(date),
        location,
        modeSettings,
      },
      include: {
        classes: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        eventId: event.id,
        action: 'CREATE_EVENT',
        entityType: 'Event',
        entityId: event.id,
        changes: { name, slug, mode },
        performedBy: 'admin',
      },
    });

    res.status(201).json(event);
  } catch (error: any) {
    console.error('Error creating event:', error);
    // Provide more detailed error information
    const errorMessage = error?.message || 'Kunde inte skapa evenemang';
    res.status(500).json({ 
      error: 'Kunde inte skapa evenemang',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

// Update event (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, mode, date, location, modeSettings, isActive } = req.body;

    const event = await prisma.event.update({
      where: {
        id: req.params.id,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(mode && { mode }),
        ...(date && { date: new Date(date) }),
        ...(location !== undefined && { location }),
        ...(modeSettings !== undefined && { modeSettings }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        classes: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        eventId: event.id,
        action: 'UPDATE_EVENT',
        entityType: 'Event',
        entityId: event.id,
        changes: { name, mode, isActive },
        performedBy: 'admin',
      },
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera evenemang' });
  }
});

// Delete event (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await prisma.event.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({ message: 'Evenemang raderat' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Kunde inte radera evenemang' });
  }
});

// Reset event (admin only)
router.post('/:id/reset', adminAuth, async (req, res) => {
  try {
    const eventId = req.params.id;

    // Delete all passages
    await prisma.passage.deleteMany({
      where: { eventId },
    });

    // Optionally reset participants
    if (req.body.resetParticipants) {
      await prisma.participant.deleteMany({
        where: { eventId },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        eventId,
        action: 'RESET_EVENT',
        entityType: 'Event',
        entityId: eventId,
        changes: { resetParticipants: req.body.resetParticipants },
        performedBy: 'admin',
      },
    });

    res.json({ message: 'Evenemang återställt' });
  } catch (error) {
    console.error('Error resetting event:', error);
    res.status(500).json({ error: 'Kunde inte återställa evenemang' });
  }
});

export default router;
