export function paceSecPerKm(totalMs: number, meters: number) {
  if (!meters) return null;
  const sec = totalMs / 1000;
  const perKm = sec / (meters / 1000);
  return Math.round(perKm);
}

export function formatPace(secPerKm: number | null) {
  if (secPerKm == null) return "";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2,"0")}`;
}