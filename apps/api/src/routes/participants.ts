import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../config/prisma';
import { adminAuth } from '../middleware/auth';
import { parseCSV, generateCSV } from '../utils/csv';
import { generateSwishQR } from '../utils/qrcode';
import { sendRegistrationConfirmation } from '../utils/email';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Generate unique registration number
const generateRegistrationNumber = async (): Promise<string> => {
  const prefix = 'JP';
  const random = Math.floor(100000 + Math.random() * 900000);
  const number = `${prefix}${random}`;
  
  // Check if it exists
  const existing = await prisma.participant.findUnique({
    where: { registrationNumber: number },
  });
  
  if (existing) {
    return generateRegistrationNumber(); // Try again
  }
  
  return number;
};

// Get participants for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const participants = await prisma.participant.findMany({
      where: {
        eventId: req.params.eventId,
      },
      include: {
        class: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Kunde inte hämta deltagare' });
  }
});

// Get single participant
router.get('/:id', async (req, res) => {
  try {
    const participant = await prisma.participant.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        class: true,
        event: true,
        passages: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    });

    if (!participant) {
      return res.status(404).json({ error: 'Deltagare hittades inte' });
    }

    res.json(participant);
  } catch (error) {
    console.error('Error fetching participant:', error);
    res.status(500).json({ error: 'Kunde inte hämta deltagare' });
  }
});

// Search participants by EPC or Bib
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    
    const participants = await prisma.participant.findMany({
      where: {
        OR: [
          { epc: { contains: query, mode: 'insensitive' } },
          { bib: { contains: query, mode: 'insensitive' } },
          { registrationNumber: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        class: true,
        event: true,
      },
      take: 20,
    });

    res.json(participants);
  } catch (error) {
    console.error('Error searching participants:', error);
    res.status(500).json({ error: 'Kunde inte söka deltagare' });
  }
});

// Register participant (public)
router.post('/register', async (req, res) => {
  try {
    const {
      eventId,
      firstName,
      lastName,
      email,
      gender,
      birthDate,
      club,
      nationality,
      gdprConsent,
    } = req.body;

    if (!eventId || !firstName || !lastName || !email || !gender || !birthDate || !gdprConsent) {
      return res.status(400).json({ error: 'Saknade obligatoriska fält' });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: 'Evenemang hittades inte' });
    }

    // Generate registration number
    const registrationNumber = await generateRegistrationNumber();

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        eventId,
        firstName,
        lastName,
        email,
        gender,
        birthDate: new Date(birthDate),
        club,
        nationality: nationality || 'SE',
        registrationNumber,
        gdprConsent,
        gdprConsentAt: new Date(),
      },
      include: {
        event: true,
      },
    });

    // Generate Swish QR if amount is provided
    if (req.body.paymentAmount) {
      const qrData = await generateSwishQR(
        '1234567890', // Replace with actual Swish number
        parseFloat(req.body.paymentAmount),
        `Anmälan ${registrationNumber}`
      );
      
      await prisma.participant.update({
        where: { id: participant.id },
        data: {
          swishQR: qrData,
          paymentAmount: parseFloat(req.body.paymentAmount),
        },
      });
    }

    // Send confirmation email
    try {
      await sendRegistrationConfirmation(
        email,
        firstName,
        lastName,
        registrationNumber,
        event.name
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue anyway, registration is successful
    }

    res.status(201).json(participant);
  } catch (error) {
    console.error('Error registering participant:', error);
    res.status(500).json({ error: 'Kunde inte registrera deltagare' });
  }
});

// Create participant (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      eventId,
      classId,
      firstName,
      lastName,
      email,
      gender,
      birthDate,
      club,
      nationality,
      epc,
      bib,
    } = req.body;

    if (!eventId || !firstName || !lastName || !email || !gender || !birthDate) {
      return res.status(400).json({ error: 'Saknade obligatoriska fält' });
    }

    // Check for EPC duplicate
    if (epc) {
      const existing = await prisma.participant.findUnique({
        where: { epc },
      });
      if (existing) {
        return res.status(400).json({ error: 'EPC används redan av annan deltagare' });
      }
    }

    const registrationNumber = await generateRegistrationNumber();

    const participant = await prisma.participant.create({
      data: {
        eventId,
        classId,
        firstName,
        lastName,
        email,
        gender,
        birthDate: new Date(birthDate),
        club,
        nationality: nationality || 'SE',
        registrationNumber,
        epc,
        bib,
        gdprConsent: true,
        gdprConsentAt: new Date(),
      },
      include: {
        class: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        eventId,
        action: 'CREATE_PARTICIPANT',
        entityType: 'Participant',
        entityId: participant.id,
        changes: { firstName, lastName, email },
        performedBy: 'admin',
      },
    });

    res.status(201).json(participant);
  } catch (error) {
    console.error('Error creating participant:', error);
    res.status(500).json({ error: 'Kunde inte skapa deltagare' });
  }
});

// Update participant (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const {
      classId,
      firstName,
      lastName,
      email,
      gender,
      birthDate,
      club,
      nationality,
      epc,
      bib,
      paymentStatus,
    } = req.body;

    // Check for EPC duplicate
    if (epc) {
      const existing = await prisma.participant.findUnique({
        where: { epc },
      });
      if (existing && existing.id !== req.params.id) {
        return res.status(400).json({ error: 'EPC används redan av annan deltagare' });
      }
    }

    const participant = await prisma.participant.update({
      where: {
        id: req.params.id,
      },
      data: {
        ...(classId !== undefined && { classId }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(gender && { gender }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(club !== undefined && { club }),
        ...(nationality && { nationality }),
        ...(epc !== undefined && { epc }),
        ...(bib !== undefined && { bib }),
        ...(paymentStatus && { paymentStatus }),
      },
      include: {
        class: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        eventId: participant.eventId,
        action: 'UPDATE_PARTICIPANT',
        entityType: 'Participant',
        entityId: participant.id,
        changes: { epc, bib, paymentStatus },
        performedBy: 'admin',
      },
    });

    res.json(participant);
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera deltagare' });
  }
});

// Delete participant (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await prisma.participant.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({ message: 'Deltagare raderad' });
  } catch (error) {
    console.error('Error deleting participant:', error);
    res.status(500).json({ error: 'Kunde inte radera deltagare' });
  }
});

// Import participants from CSV (admin only)
router.post('/import', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Ingen fil uppladdad' });
    }

    const { eventId, encoding } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ error: 'EventId saknas' });
    }

    const csvEncoding = encoding === 'cp1252' ? 'cp1252' : 'utf-8';
    const parsedData = parseCSV(req.file.buffer, csvEncoding);

    const results = [];
    const errors = [];

    for (const row of parsedData) {
      try {
        // Find or create class
        let classId = null;
        if (row.className) {
          let classItem = await prisma.class.findFirst({
            where: {
              eventId,
              name: row.className,
            },
          });

          if (!classItem) {
            classItem = await prisma.class.create({
              data: {
                eventId,
                name: row.className,
              },
            });
          }

          classId = classItem.id;
        }

        const registrationNumber = await generateRegistrationNumber();

        const participant = await prisma.participant.create({
          data: {
            eventId,
            classId,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            gender: row.gender,
            birthDate: new Date(row.birthDate),
            club: row.club,
            nationality: row.nationality,
            registrationNumber,
            gdprConsent: true,
            gdprConsentAt: new Date(),
          },
        });

        results.push(participant);
      } catch (error) {
        errors.push({
          row,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    res.json({
      message: `${results.length} deltagare importerade`,
      imported: results.length,
      errors: errors.length,
      errorDetails: errors,
    });
  } catch (error) {
    console.error('Error importing participants:', error);
    res.status(500).json({ error: 'Kunde inte importera deltagare' });
  }
});

// Export participants to CSV (admin only)
router.get('/export/:eventId', adminAuth, async (req, res) => {
  try {
    const participants = await prisma.participant.findMany({
      where: {
        eventId: req.params.eventId,
      },
      include: {
        class: true,
      },
    });

    const csv = generateCSV(participants);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=deltagare-${req.params.eventId}.csv`);
    res.send('\ufeff' + csv); // BOM for UTF-8
  } catch (error) {
    console.error('Error exporting participants:', error);
    res.status(500).json({ error: 'Kunde inte exportera deltagare' });
  }
});

// Auto-assign EPC (admin only)
router.post('/:id/assign-epc', adminAuth, async (req, res) => {
  try {
    const { epc } = req.body;

    if (!epc) {
      return res.status(400).json({ error: 'EPC saknas' });
    }

    // Check for duplicate
    const existing = await prisma.participant.findUnique({
      where: { epc },
    });

    if (existing && existing.id !== req.params.id) {
      return res.status(400).json({ 
        error: 'EPC används redan',
        existingParticipant: {
          id: existing.id,
          firstName: existing.firstName,
          lastName: existing.lastName,
        },
      });
    }

    const participant = await prisma.participant.update({
      where: {
        id: req.params.id,
      },
      data: {
        epc,
      },
    });

    res.json(participant);
  } catch (error) {
    console.error('Error assigning EPC:', error);
    res.status(500).json({ error: 'Kunde inte tilldela EPC' });
  }
});

export default router;
