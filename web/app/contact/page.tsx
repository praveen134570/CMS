"use client";

import { FormEvent, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(false); setError("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch(`${API}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      e.currentTarget.reset();
      setSent(true);
    } catch {
      setError("Unable to send your message. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#12304a,transparent_35%),#080b12] px-6 py-20 text-white">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="text-sm text-cyan-300">← Back home</a>
        <h1 className="mt-8 text-5xl font-black">Let’s talk.</h1>
        <p className="mt-4 text-slate-400">Send a message and it will be stored securely in the CMS.</p>
        <form onSubmit={submit} className="mt-10 space-y-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-7">
          <input name="name" required placeholder="Your name" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
          <input name="email" required type="email" placeholder="Email address" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
          <input name="subject" placeholder="Subject" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
          <textarea name="message" required rows={7} placeholder="Your message" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
          <button className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">Send message</button>
          {sent && <p className="text-emerald-400">Message sent successfully.</p>}
          {error && <p className="text-red-400">{error}</p>}
        </form>
      </div>
    </main>
  );
}
