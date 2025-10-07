import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { PrismaClient, RaceType } from "@prisma/client";
import bodyParser from "body-parser";
import { authMiddleware, gatewayAuth } from "./middleware/auth.js";
import { exportSFA } from "./services/sfa-export.js";
import { recomputeResults } from "./services/ranking.js";
import { parseCsvPreview } from "./services/import-preview.js";

const prisma = new PrismaClient();
const app = express();

// CORS för webklient
app.use(cors({ origin: true, credentials: true }));
// JSON och binär (för import-preview)
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.raw({ type: "application/octet-stream", limit: "10mb" }));

// Health
app.get("/health", (_req, res) => res.send("OK"));

// Admin inlogg (enkelt lösenord via env)
app.post("/auth/admin/login", (req, res) => {
  const { password } = req.body ?? {};
  if (!password || password !== process.env.ADMIN_PASSWORD) return res.status(401).end();
  // Enkel session: kunde sätta cookie, men för enkelhet svarar vi 204 och litar på admin UI
  res.status(204).end();
});

// Skapa event
app.post("/events", async (req, res) => {
  const { slug, name, city, date, organizer, distanceMeters, raceType, sfa_type, sfa_courseMeasurer, sfa_dateOfMeasurement } = req.body || {};
  if (!slug || !name || !city || !date || !organizer || !raceType) return res.status(400).json({ error: "missing fields" });
  const ev = await prisma.event.create({
    data: {
      slug, name, city, date: new Date(date), organizer, distanceMeters: distanceMeters ?? null, raceType,
      sfa_type: sfa_type ?? null,
      sfa_courseMeasurer: sfa_courseMeasurer ?? null,
      sfa_dateOfMeasurement: sfa_dateOfMeasurement ? new Date(sfa_dateOfMeasurement) : null
    }
  });
  res.status(201).json(ev);
});

app.get("/events/:slug", async (req, res) => {
  const ev = await prisma.event.findFirst({ where: { slug: req.params.slug } });
  if (!ev) return res.status(404).end();
  res.json(ev);
});

// Gun start (Normal/Lap/TimeRace)
app.post("/events/:id/gun", async (req, res) => {
  const ev = await prisma.event.findUnique({ where: { id: req.params.id }, include: { normalConfig: true, lapConfig: true, timeRaceConfig: true } });
  if (!ev) return res.status(404).end();

  const now = new Date();
  switch (ev.raceType) {
    case RaceType.NORMAL:
      if (ev.normalConfig) await prisma.normalConfig.update({ where: { eventId: ev.id }, data: { gunAt: now } });
      else await prisma.normalConfig.create({ data: { eventId: ev.id, gunAt: now } });
      break;
    case RaceType.LAP:
      if (ev.lapConfig) await prisma.lapConfig.update({ where: { eventId: ev.id }, data: { gunAt: now } });
      else await prisma.lapConfig.create({ data: { eventId: ev.id, gunAt: now } });
      break;
    case RaceType.TIMERACE:
      if (ev.timeRaceConfig) await prisma.timeRaceConfig.update({ where: { eventId: ev.id }, data: { gunAt: now } });
      else await prisma.timeRaceConfig.create({ data: { eventId: ev.id, gunAt: now } });
      break;
  }
  await prisma.event.update({ where: { id: ev.id }, data: { state: "RUNNING" } });
  res.status(204).end();
});

// Normal: snabbknapp till mål nu
app.post("/events/:id/finish-now", async (req, res) => {
  const ev = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!ev) return res.status(404).end();
  await prisma.normalConfig.upsert({
    where: { eventId: ev.id },
    update: { forceFinishNow: true },
    create: { eventId: ev.id, forceFinishNow: true }
  });
  res.status(204).end();
});

// Gateway -> ingest reads (HMAC-signerat)
app.post("/events/:id/reads", gatewayAuth, async (req, res) => {
  const eventId = req.params.id;
  const reads = req.body?.reads as Array<{ epc: string; antenna?: number; rssi?: number; seenAt: string }>;
  if (!Array.isArray(reads)) return res.status(400).json({ error: "reads array required" });

  await prisma.tagRead.createMany({
    data: reads.map(r => ({
      eventId,
      epc: r.epc,
      antenna: r.antenna ?? null,
      rssi: r.rssi ?? null,
      seenAt: new Date(r.seenAt)
    }))
  });

  // Kör omräkning asynkront (enkelt)
  recomputeResults(eventId).then(() => {
    broadcast(eventId, { type: "results.update", rows: [] }); // TODO: skicka sammanfattning
  }).catch(console.error);

  res.status(202).end();
});

// Live SSE per slug (vi mappar slug -> id)
const sseClients = new Map<string, Set<(msg: any) => void>>();
app.get("/live/:slug/stream", async (req, res) => {
  const slug = req.params.slug;
  const ev = await prisma.event.findFirst({ where: { slug } });
  if (!ev) { res.status(404).end(); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.write("retry: 3000\n\n");

  const set = sseClients.get(ev.id) ?? new Set();
  const client = (msg: any) => res.write(`data: ${JSON.stringify(msg)}\n\n`);
  set.add(client);
  sseClients.set(ev.id, set);
  req.on("close", () => {
    const s = sseClients.get(ev.id);
    if (s) { s.delete(client); if (s.size === 0) sseClients.delete(ev.id); }
  });
});

function broadcast(eventId: string, payload: any) {
  const set = sseClients.get(eventId);
  if (!set) return;
  for (const c of set) c({ eventId, ...payload });
}

// Import preview: auto-detektera UTF-8/CP1252 och parse semikolon
app.post("/import/csv", async (req, res) => {
  try {
    const preview = parseCsvPreview(req.body as Buffer);
    res.json({ preview });
  } catch (e: any) {
    res.status(400).json({ error: e.message || "parse error" });
  }
});

// SFA-export
app.get("/exports/:slug/sfa", async (req, res) => {
  const ev = await prisma.event.findFirst({ where: { slug: req.params.slug } });
  if (!ev) { res.status(404).end(); return; }
  const csv = await exportSFA(ev.id);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${ev.date.toISOString().slice(0,10)}_${ev.city}_${ev.name}.csv"`);
  res.send(csv);
});

// ===== Class Management API =====

// List all classes for an event
app.get("/event/:eventId/class", async (req, res) => {
  const { eventId } = req.params;
  const ev = await prisma.event.findUnique({ where: { id: eventId } });
  if (!ev) return res.status(404).json({ error: "Event not found" });

  const classes = await prisma.class.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" }
  });
  res.json(classes);
});

// Create a new class
app.post("/event/:eventId/class", async (req, res) => {
  const { eventId } = req.params;
  const { name, type, value, description } = req.body || {};
  
  if (!name || !type) {
    return res.status(400).json({ error: "name and type are required" });
  }

  const ev = await prisma.event.findUnique({ where: { id: eventId } });
  if (!ev) return res.status(404).json({ error: "Event not found" });

  const newClass = await prisma.class.create({
    data: {
      eventId,
      name,
      type,
      value: value ?? null,
      description: description ?? null
    }
  });

  res.status(201).json(newClass);
});

// Get a specific class
app.get("/event/:eventId/class/:classId", async (req, res) => {
  const { eventId, classId } = req.params;
  
  const cls = await prisma.class.findFirst({
    where: { id: classId, eventId }
  });

  if (!cls) return res.status(404).json({ error: "Class not found" });
  res.json(cls);
});

// Update a class
app.put("/event/:eventId/class/:classId", async (req, res) => {
  const { eventId, classId } = req.params;
  const { name, type, value, description } = req.body || {};

  const cls = await prisma.class.findFirst({
    where: { id: classId, eventId }
  });

  if (!cls) return res.status(404).json({ error: "Class not found" });

  const updated = await prisma.class.update({
    where: { id: classId },
    data: {
      name: name ?? cls.name,
      type: type ?? cls.type,
      value: value !== undefined ? value : cls.value,
      description: description !== undefined ? description : cls.description
    }
  });

  res.json(updated);
});

// Delete a class
app.delete("/event/:eventId/class/:classId", async (req, res) => {
  const { eventId, classId } = req.params;

  const cls = await prisma.class.findFirst({
    where: { id: classId, eventId }
  });

  if (!cls) return res.status(404).json({ error: "Class not found" });

  await prisma.class.delete({ where: { id: classId } });
  res.status(204).end();
});

const server = app.listen(process.env.PORT || 3001, () => {
  console.log("API listening");
});

// WS (valfritt)
const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => ws.send(JSON.stringify({ type: "welcome" })));