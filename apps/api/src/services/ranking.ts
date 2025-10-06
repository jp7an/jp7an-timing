import { PrismaClient, RaceType } from "@prisma/client";
import { paceSecPerKm } from "../../../packages/shared/src/pace.js";

const prisma = new PrismaClient();

// Enkel, initial ranking-logik (kan utökas)
export async function recomputeResults(eventId: string) {
  const ev = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      participants: true,
      normalConfig: true,
      lapConfig: true,
      timeRaceConfig: true,
      backyardConfig: true,
      laps: true,
      results: true
    }
  });
  if (!ev) return;

  // TODO: Bygg Lap från TagRead + anti-dup + minLapTime (se separat processor)
  // Här antar vi att Lap redan finns (från processor). Vi uppdaterar Result-avsnittet.

  for (const p of ev.participants) {
    let res = await prisma.result.findFirst({ where: { eventId, participantId: p.id } });
    if (!res) {
      res = await prisma.result.create({ data: { eventId, participantId: p.id } });
    }
    const laps = await prisma.lap.findMany({ where: { eventId, participantId: p.id, valid: true }, orderBy: { index: "asc" } });

    let gunTimeMs: number | null = null;
    let chipTimeMs: number | null = null;
    let totalMs = 0;
    let totalMeters = 0;
    let lastLapMs: number | null = laps.length > 0 ? laps[laps.length - 1].lapTimeMs : null;

    switch (ev.raceType) {
      case RaceType.NORMAL: {
        // Antag: lap[0] = chipstart-pass, lap[1] = mål (generator sätter detta)
        gunTimeMs = ev.normalConfig?.gunAt ? (laps[1]?.passedAt.getTime() - ev.normalConfig.gunAt.getTime()) : null;
        chipTimeMs = laps[1] && laps[0] ? (laps[1].passedAt.getTime() - laps[0].passedAt.getTime()) : null;
        totalMeters = ev.distanceMeters ?? 0;
        totalMs = gunTimeMs ?? 0;
        break;
      }
      case RaceType.LAP: {
        // Första pass efter gun = chipstart. Därefter varje pass = varv.
        const lapLen = ev.lapConfig?.lapLengthMeters ?? 0;
        const totalLaps = laps.length > 0 ? laps.length - 1 : 0; // exkludera chipstart-pass
        totalMeters = lapLen * totalLaps;
        gunTimeMs = ev.lapConfig?.gunAt && laps.length > 0 ? (laps[laps.length - 1].passedAt.getTime() - ev.lapConfig.gunAt.getTime()) : null;
        // Chip time = sum varvlap T?
        chipTimeMs = totalLaps > 0 ? laps.slice(1).reduce((a, b) => a + b.lapTimeMs, 0) : null;
        totalMs = gunTimeMs ?? 0;
        break;
      }
      case RaceType.TIMERACE: {
        const lapLen = ev.timeRaceConfig?.lapLengthMeters ?? 0;
        const totalLaps = laps.length > 0 ? laps.length - 1 : 0;
        totalMeters = lapLen * totalLaps + (p.extraMeters || 0);
        gunTimeMs = ev.timeRaceConfig?.gunAt && ev.timeRaceConfig?.endsAt
          ? (ev.timeRaceConfig.endsAt.getTime() - ev.timeRaceConfig.gunAt.getTime())
          : null;
        chipTimeMs = null; // ej i tidslopp
        totalMs = gunTimeMs ?? 0;
        break;
      }
      case RaceType.BACKYARD: {
        const lapLen = ev.backyardConfig?.loopLengthMeters ?? 6706;
        const totalLaps = laps.length; // här räknar vi varje godkänt varv
        totalMeters = lapLen * totalLaps;
        gunTimeMs = null; // ej relevant
        chipTimeMs = null;
        totalMs = laps.reduce((a, b) => a + b.lapTimeMs, 0);
        break;
      }
    }

    const avgPace = totalMeters > 0 && totalMs > 0 ? paceSecPerKm(totalMs, totalMeters) : null;

    await prisma.result.update({
      where: { id: res.id },
      data: {
        gunTimeMs,
        chipTimeMs,
        totalLaps: ev.raceType === RaceType.LAP ? Math.max(0, (laps.length - 1)) : (ev.raceType === RaceType.BACKYARD ? laps.length : res.totalLaps),
        totalMeters,
        avgPaceSecPerKm: avgPace ?? null,
        lastLapMs: lastLapMs ?? null
      }
    });
  }

  // Placering – initial enkel strategi
  const results = await prisma.result.findMany({ where: { eventId }, include: { participant: true } });

  let sorted: typeof results = [];
  switch (ev.raceType) {
    case RaceType.NORMAL:
      sorted = results.sort((a,b) => (a.gunTimeMs ?? Infinity) - (b.gunTimeMs ?? Infinity)
        || (a.chipTimeMs ?? Infinity) - (b.chipTimeMs ?? Infinity)
        || a.participant.lastname.localeCompare(b.participant.lastname));
      break;
    case RaceType.LAP:
      sorted = results.sort((a,b) => (b.totalMeters - a.totalMeters)
        || (a.gunTimeMs ?? Infinity) - (b.gunTimeMs ?? Infinity)
        || a.participant.lastname.localeCompare(b.participant.lastname));
      break;
    case RaceType.TIMERACE:
      sorted = results.sort((a,b) => (b.totalMeters - a.totalMeters)
        || (a.avgPaceSecPerKm ?? Infinity) - (b.avgPaceSecPerKm ?? Infinity)
        || a.participant.lastname.localeCompare(b.participant.lastname));
      break;
    case RaceType.BACKYARD:
      sorted = results.sort((a,b) =>
        (b.totalLaps - a.totalLaps)
        || ((a.avgPaceSecPerKm ?? Infinity) - (b.avgPaceSecPerKm ?? Infinity))
        || ((b.lastLapMs ?? Infinity) - (a.lastLapMs ?? Infinity)) // snabbast senaste varv favor
      );
      break;
  }

  // Sätt placing
  for (let i = 0; i < sorted.length; i++) {
    await prisma.result.update({ where: { id: sorted[i].id }, data: { placing: i + 1 } });
  }

  // Klassplacering
  const evYear = new Date(ev.date).getFullYear();
  const classMap = new Map<string, number>();
  for (const r of sorted) {
    const p = r.participant;
    const birthYear = p.birthday ? p.birthday.getFullYear() : undefined;
    const cls = birthYear ? ageGroupString(evYear, birthYear, p.gender) : undefined;
    if (!cls) continue;
    const place = (classMap.get(cls) || 0) + 1;
    classMap.set(cls, place);
    await prisma.result.update({ where: { id: r.id }, data: { classPlacing: place } });
  }
}

function ageGroupString(eventYear: number, birthYear: number, sex: string) {
  const age = eventYear - birthYear;
  if (age <= 20) return `U${sex}20`;
  if (age <= 34) return `${sex}21`;
  const base = Math.floor(age / 5) * 5;
  return `${sex}${Math.max(35, base)}`;
}