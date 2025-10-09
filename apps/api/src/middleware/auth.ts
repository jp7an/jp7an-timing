import { Request, Response, NextFunction } from 'express';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ingen autentisering tillhandahållen' });
  }

  const token = authHeader.substring(7);
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin-lösenord inte konfigurerat' });
  }

  if (token !== adminPassword) {
    return res.status(403).json({ error: 'Ogiltigt lösenord' });
  }

  next();
};
