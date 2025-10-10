import { Router, Request, Response } from 'express';

const router = Router();

// Admin login
router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin-lösenord inte konfigurerat' });
  }

  // Trim whitespace from both passwords before comparison
  const trimmedPassword = password?.trim();
  const trimmedAdminPassword = adminPassword.trim();

  if (!trimmedPassword || trimmedPassword !== trimmedAdminPassword) {
    return res.status(401).json({ error: 'Felaktigt lösenord' });
  }

  // Return the password as token (simple auth for MVP)
  res.json({
    token: trimmedPassword,
    message: 'Inloggning lyckades',
  });
});

// Verify token
router.post('/verify', (req: Request, res: Response) => {
  const { token } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin-lösenord inte konfigurerat' });
  }

  // Trim whitespace from both tokens before comparison
  const trimmedToken = token?.trim();
  const trimmedAdminPassword = adminPassword.trim();

  if (!trimmedToken || trimmedToken !== trimmedAdminPassword) {
    return res.status(401).json({ error: 'Ogiltigt token' });
  }

  res.json({ valid: true });
});

export default router;
