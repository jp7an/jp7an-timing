"use client";
import { useState } from "react";

export default function ImportPage() {
  const [preview, setPreview] = useState<string[][]>([]);
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const buf = await f.arrayBuffer();
    // Skicka till API som auto-detekterar UTF-8/CP1252 och returnerar preview
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/import/csv`, {
      method: "POST",
      body: buf,
      headers: { "content-type": "application/octet-stream" }
    });
    const data = await res.json();
    setPreview(data.preview || []);
  }
  return (
    <div className="p-4">
      <h1 className="font-bold text-xl">Importera deltagare (CSV)</h1>
      <input type="file" accept=".csv" onChange={onFile} />
      <table className="mt-4 text-sm">
        <tbody>
          {preview.map((r,i) => <tr key={i}>{r.map((c,j)=><td key={j} className="px-2 py-1 border">{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}