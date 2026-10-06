"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAuthToken } from "../../lib/api";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const body = new URLSearchParams({ username: email, password });
      const { data } = await api.post("/auth/login", body, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
      localStorage.setItem("cms_token", data.access_token);
      setAuthToken(data.access_token);
      router.push("/");
    } catch {
      setError("Invalid credentials.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-7">
        <h1 className="text-2xl font-bold">CMS Login</h1>
        {error && <p className="text-red-400">{error}</p>}
        <input className="w-full" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" />
        <input className="w-full" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400">Sign in</button>
      </form>
    </main>
  );
}
