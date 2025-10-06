import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function authMiddleware(_req: Request, _res: Response, next: NextFunction) {
  next();
}

export function gatewayAuth(req: Request, res: Response, next: NextFunction) {
  const sig = req.header("x-signature") || "";
  const body = JSON.stringify(req.body || {});
  const key = process.env.GATEWAY_HMAC_SECRET || "";
  const expect = crypto.createHmac("sha256", key).update(body).digest("hex");
  if (sig !== expect) return res.status(401).json({ error: "bad signature" });
  next();
}