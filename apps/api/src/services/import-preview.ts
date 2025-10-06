import { detect } from "@fast-csv/parse/dist/parser/encodingDetector.js"; // lightweight detektor
import iconv from "iconv-lite";

export function parseCsvPreview(buffer: Buffer): string[][] {
  const enc = (detect(buffer) || "utf8").toString().toLowerCase();
  const text = iconv.decode(buffer, enc.includes("1252") ? "win1252" : "utf8");
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = lines.map(l => l.split(";"));
  return rows.slice(0, 25);
}