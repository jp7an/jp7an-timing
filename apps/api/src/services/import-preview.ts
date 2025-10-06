import jschardet from "jschardet";
import iconv from "iconv-lite";

export function parseCsvPreview(buffer: Buffer): string[][] {
  const det = jschardet.detect(buffer);
  const enc = (det.encoding || "utf-8").toLowerCase();

  // Mappa till iconv-lite alias
  const iconvEnc =
    enc.includes("1252") || enc.includes("windows") || enc.includes("ansi")
      ? "win1252"
      : "utf8";

  const text = iconv.decode(buffer, iconvEnc);
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = lines.map(l => l.split(";"));
  return rows.slice(0, 25);
}
