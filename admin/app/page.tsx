"use client";

import { useEffect, useState } from "react";
import { api, getToken, setAuthToken } from "../lib/api";

const resources = ["projects", "blogs", "skills", "experience", "services", "testimonials", "messages", "about"];

export default function Dashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (token) setAuthToken(token);
    if (!token) { setError("Login required. Use the login API or add a login screen before deploying."); return; }

    Promise.all(resources.map(async r => {
      const res = await api.get(`/${r}`);
      return [r, Array.isArray(res.data) ? res.data.length : 1] as const;
    })).then(items => setCounts(Object.fromEntries(items)))
      .catch(() => setError("Could not load dashboard. Check your API and authentication."));
  }, []);

  return (
    <section>
      <h2 className="mb-2 text-3xl font-bold">Dashboard</h2>
      <p className="mb-8 text-slate-400">Content overview for your portfolio.</p>
      {error && <div className="mb-5 rounded-lg border border-amber-700 bg-amber-950/40 p-4 text-amber-200">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resources.map(r => (
          <div key={r} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="capitalize text-slate-400">{r}</p>
            <p className="mt-2 text-3xl font-bold">{counts[r] ?? "—"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
