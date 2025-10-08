import { Router } from 'express';

const router = Router();

// Admin login
router.post('/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin-lösenord inte konfigurerat' });
  }

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Felaktigt lösenord' });
  }

  // Return the password as token (simple auth for MVP)
  res.json({
    token: password,
    message: 'Inloggning lyckades',
  });
});

// Verify token
router.post('/verify', (req, res) => {
  const { token } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin-lösenord inte konfigurerat' });
  }

  if (token !== adminPassword) {
    return res.status(401).json({ error: 'Ogiltigt token' });
  }

  res.json({ valid: true });
});

export default router;
