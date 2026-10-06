"use client";

import { useEffect, useState } from "react";
import { api, getToken, setAuthToken } from "../../lib/api";

export default function ServicesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const token = getToken();
    if (!token) { setError("Login required."); return; }
    setAuthToken(token);
    api.get("/services").then(r => setItems(r.data)).catch(() => setError("Could not load data."));
  }, []);
  return <section><h2 className="text-3xl font-bold">Services</h2><p className="mt-2 text-slate-400">API endpoint: /api/services</p>
    {error && <p className="mt-5 text-red-400">{error}</p>}
    <div className="mt-8 grid gap-3">{items.map((x:any) => <pre key={x.id} className="overflow-auto rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">{JSON.stringify(x, null, 2)}</pre>)}</div>
  </section>;
}
