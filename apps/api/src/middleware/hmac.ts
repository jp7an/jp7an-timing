import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const verifyHMAC = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-signature'] as string;
  const secret = process.env.GATEWAY_HMAC_SECRET;

  if (!secret) {
    return res.status(500).json({ error: 'HMAC-hemlighet inte konfigurerad' });
  }

  if (!signature) {
    return res.status(401).json({ error: 'Ingen signatur tillhandahållen' });
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(403).json({ error: 'Ogiltig signatur' });
  }

  next();
};
