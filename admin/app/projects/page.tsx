"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, getToken, setAuthToken } from "../../lib/api";

type Project = {
  id: number; title: string; description: string; tech_stack: string;
  live_link?: string | null; github_link?: string | null; image?: string | null;
};

const blank = { title: "", description: "", tech_stack: "", live_link: "", github_link: "", image: "" };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const { data } = await api.get("/projects");
    setProjects(data);
  }

  useEffect(() => {
    const token = getToken();
    if (token) setAuthToken(token);
    if (token) load().catch(() => setError("Failed to load projects."));
  }, []);

  function change(key: keyof typeof blank, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editing) await api.put(`/projects/${editing}`, form);
      else await api.post("/projects", form);
      setForm(blank); setEditing(null); await load();
    } catch { setError("Save failed. Check authentication and API."); }
  }

  function edit(p: Project) {
    setEditing(p.id);
    setForm({
      title: p.title, description: p.description, tech_stack: p.tech_stack,
      live_link: p.live_link || "", github_link: p.github_link || "", image: p.image || ""
    });
  }

  async function remove(id: number) {
    if (!confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    await load();
  }

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Projects</h2>
        <p className="text-slate-400">Reusable CRUD pattern for the other CMS managers.</p>
      </div>
      {error && <p className="mb-4 text-red-400">{error}</p>}

      <form onSubmit={submit} className="mb-10 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:grid-cols-2">
        <input value={form.title} onChange={e => change("title", e.target.value)} placeholder="Title" required />
        <input value={form.tech_stack} onChange={e => change("tech_stack", e.target.value)} placeholder="Tech stack: React, FastAPI" />
        <textarea className="min-h-32 md:col-span-2" value={form.description} onChange={e => change("description", e.target.value)} placeholder="Description" />
        <input value={form.live_link} onChange={e => change("live_link", e.target.value)} placeholder="Live URL" />
        <input value={form.github_link} onChange={e => change("github_link", e.target.value)} placeholder="GitHub URL" />
        <input className="md:col-span-2" value={form.image} onChange={e => change("image", e.target.value)} placeholder="Image URL" />
        <div className="flex gap-3 md:col-span-2">
          <button className="rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-slate-950">{editing ? "Update" : "Create"} Project</button>
          {editing && <button type="button" onClick={() => {setEditing(null); setForm(blank)}} className="rounded-lg border border-slate-700 px-5 py-2">Cancel</button>}
        </div>
      </form>

      <div className="grid gap-4">
        {projects.map(p => (
          <article key={p.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className="mt-1 text-sm text-cyan-300">{p.tech_stack}</p>
                <p className="mt-3 text-slate-400">{p.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => edit(p)} className="rounded-lg border border-slate-700 px-3 py-2">Edit</button>
                <button onClick={() => remove(p.id)} className="rounded-lg bg-red-600 px-3 py-2">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
