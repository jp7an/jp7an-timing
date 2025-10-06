import { PrismaClient, RaceType } from "@prisma/client";
import { calcAgeGroup } from "../../../packages/shared/src/age-groups.js";

const prisma = new PrismaClient();

export async function exportSFA(eventId: string) {
  const ev = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      results: {
        include: { participant: true }
      }
    }
  });
  if (!ev) throw new Error("event not found");
  const eventYear = new Date(ev.date).getFullYear();

  const header = [
    "type","race_name","city","date","organizer","distance","gender","course_measurer","date_of_measurement",
    "placing","agegroup","agegroupplacing","extra","firstname","lastname","country","club","birthday","yb","result","netto","5kmsplit"
  ];
  const rows: string[] = [header.join(";")];

  // Bygg klassvis placering
  const classCounters = new Map<string, number>();

  // Sortera efter placing (bör komma från ranking-service)
  const sorted = (ev.results || []).sort((a,b) => (a.placing ?? 999999) - (b.placing ?? 999999));

  for (const r of sorted) {
    const p = r.participant!;
    const birthYear = p.birthday ? new Date(p.birthday).getFullYear() : undefined;
    const agegroup = birthYear ? calcAgeGroup(eventYear, birthYear, p.gender as any) : "";
    const classPlace = agegroup ? (classCounters.set(agegroup, (classCounters.get(agegroup) || 0) + 1), classCounters.get(agegroup)!) : "";

    const A = ev.sfa_type ?? "";
    const B = ev.name;
    const C = ev.city;
    const D = ev.date.toISOString().slice(0,10);
    const E = ev.organizer;
    const F = ev.distanceMeters ? (ev.distanceMeters/1000).toFixed(3) : "";
    const G = p.gender === "K" ? "K" : "M"; // per rad, från deltagaren
    const H = ev.sfa_courseMeasurer ?? "";
    const I = ev.sfa_dateOfMeasurement ? ev.sfa_dateOfMeasurement.toISOString().slice(0,10) : "";
    const J = r.placing ?? "";
    const K = agegroup;
    const L = classPlace;
    const M = ""; // extra (blank)
    const N = p.firstname;
    const O = p.lastname;
    const P = p.nationality && p.nationality !== "SWE" ? p.nationality : "";
    const Q = p.club ?? "";
    const R = ""; // birthday blank for privacy
    const S = birthYear ?? "";
    const T = formatHMS(r.gunTimeMs ?? null);
    const U = (ev.raceType === RaceType.NORMAL || ev.raceType === RaceType.LAP) ? formatHMS(r.chipTimeMs ?? r.gunTimeMs ?? null) : "";
    const V = ""; // 5kmsplit (kan fyllas senare)

    rows.push([A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V].join(";"));
  }
  return rows.join("\n");
}

function formatHMS(ms: number | null) {
  if (ms == null) return "";
  const sec = Math.round(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}