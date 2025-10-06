import "dotenv/config";
import crypto from "crypto";
import fetch from "node-fetch";

type Read = { epc: string; antenna?: number; rssi?: number; seenAt: string };

const API_URL = process.env.API_URL!;
const EVENT_ID = process.env.EVENT_ID!;
const HMAC = process.env.GATEWAY_HMAC_SECRET!;
const DRIVER = process.env.DRIVER || "simulator"; // "llrp" snart

function sign(body: any) {
  const b = JSON.stringify(body);
  return crypto.createHmac("sha256", HMAC).update(b).digest("hex");
}

async function postReads(batch: Read[]) {
  const body = { reads: batch };
  const res = await fetch(`${API_URL}/events/${EVENT_ID}/reads`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-signature": sign(body) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`post failed ${res.status}`);
}

async function runSimulator() {
  console.log("Gateway simulator startar. Genererar EPC-läsningar...");
  const epcs = ["E20000172211011111111111", "E20000172211012222222222", "E20000172211013333333333"];
  const buffer: Read[] = [];
  setInterval(async () => {
    const epc = epcs[Math.floor(Math.random() * epcs.length)];
    buffer.push({ epc, antenna: 1, rssi: -40, seenAt: new Date().toISOString() });
    if (buffer.length >= 10) {
      const batch = buffer.splice(0, buffer.length);
      try { await postReads(batch); } catch (e) { console.error("post fail", e); }
    }
  }, 500);
}

async function runLLRP() {
  console.log("LLRP-läge – här lägger vi in faktisk LLRP-klient.");
  console.log("För nu: använd DRIVER=simulator tills vi kopplar mot R420.");
  await runSimulator();
}

async function main() {
  if (!API_URL || !EVENT_ID || !HMAC) {
    console.error("Saknar API_URL, EVENT_ID eller GATEWAY_HMAC_SECRET");
    process.exit(1);
  }
  if (DRIVER === "llrp") await runLLRP();
  else await runSimulator();
}

main().catch(err => { console.error(err); process.exit(1); });