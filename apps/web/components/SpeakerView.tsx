"use client";
import { useEffect, useState } from "react";

export default function SpeakerView({ slug }: { slug: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const src = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/live/${slug}/stream`);
    src.onmessage = (m) => {
      const data = JSON.parse(m.data);
      if (data.type === "results.update") setRows(data.rows);
    };
    const t = setInterval(()=>setNow(Date.now()), 1000);
    return () => { src.close(); clearInterval(t); };
  }, [slug]);

  return (
    <div className="p-4">
      <h1 className="font-bold text-2xl">Speakerview</h1>
      <div className="text-3xl my-2">{new Date(now).toLocaleTimeString()}</div>
      <div className="grid grid-cols-1 gap-2">
        {rows.slice(0, 10).map((r: any) => (
          <div key={r.participantId} className="p-3 border">
            <div className="text-xl font-semibold">{r.placing}. {r.name} ({r.club||"-"})</div>
            <div>Senaste varv: {r.lastLap||"-"} • Medelfart: {r.pace||"-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}