"use client";
import { useEffect, useState } from "react";

export default function LiveView({ slug, mode }: { slug: string; mode: "auto" | "latest-first" }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    const src = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/live/${slug}/stream`);
    src.onmessage = (m) => {
      const data = JSON.parse(m.data);
      if (data.type === "results.update") setRows(data.rows);
    };
    return () => src.close();
  }, [slug]);

  const display = mode === "latest-first"
    ? [...rows].sort((a,b) => (b.lastPassAt||0) - (a.lastPassAt||0))
    : rows;

  return (
    <div className="p-4">
      <h1 className="font-bold text-xl">Jp7an-timing – Live</h1>
      <table className="w-full text-sm">
        <thead>
        <tr>
          <th>Pl</th><th>Namn</th><th>Klubb</th><th>Gun</th><th>Chip</th><th>Medelfart</th>
        </tr>
        </thead>
        <tbody>
        {display.map((r: any) => (
          <tr key={r.participantId}>
            <td>{r.placing}</td>
            <td><a href={`/${slug}/athlete/${r.participantId}`} className="text-blue-600 underline">{r.name}</a></td>
            <td>{r.club||""}</td>
            <td>{r.gunTime||""}</td>
            <td>{r.chipTime||""}</td>
            <td>{r.pace||""}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}