"use client";
import { useState } from "react";

export default function Admin() {
  const [password, setPassword] = useState("");
  async function login() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/admin/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "include"
    });
    if (res.ok) {
      window.location.href = "/admin/panel";
    } else {
      alert("Fel lösenord");
    }
  }
  return (
    <main className="p-8">
      <h1 className="font-bold text-2xl mb-4">Admin – Jp7an-timing</h1>
      <input className="border p-2 mr-2" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Admin-lösenord" />
      <button className="bg-orange-500 text-white px-4 py-2" onClick={login}>Logga in</button>
    </main>
  );
}