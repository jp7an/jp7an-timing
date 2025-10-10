import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { adminAuth } from '../middleware/auth';

const router = Router();

// Get classes for an event
router.get('/event/:eventId', async (req: Request, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      where: {
        eventId: req.params.eventId,
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Kunde inte hämta klasser' });
  }
});

// Create class (admin only)
router.post('/', adminAuth, async (req: Request, res: Response) => {
  try {
    const { eventId, name, description, minAge, maxAge, gender } = req.body;

    if (!eventId || !name) {
      return res.status(400).json({ error: 'Saknade obligatoriska fält' });
    }

    const classItem = await prisma.class.create({
      data: {
        eventId,
        name,
        description,
        minAge,
        maxAge,
        gender,
      },
    });

    res.status(201).json(classItem);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Kunde inte skapa klass' });
  }
});

// Update class (admin only)
router.put('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { name, description, minAge, maxAge, gender } = req.body;

    const classItem = await prisma.class.update({
      where: {
        id: req.params.id,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(minAge !== undefined && { minAge }),
        ...(maxAge !== undefined && { maxAge }),
        ...(gender !== undefined && { gender }),
      },
    });

    res.json(classItem);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera klass' });
  }
});

// Delete class (admin only)
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    await prisma.class.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({ message: 'Klass raderad' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Kunde inte radera klass' });
  }
});

export default router;
