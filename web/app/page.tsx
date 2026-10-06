import Link from "next/link";
import { getCollection } from "../lib/api";

type About = { id: number; bio: string; resume_link?: string | null };
type Skill = { id: number; name: string; category: string; proficiency: number };
type Project = { id: number; title: string; description: string; tech_stack: string; live_link?: string | null; github_link?: string | null; image?: string | null };
type Experience = { id: number; role: string; company: string; timeline: string; description: string };

export default async function Home() {
  const [about, skills, projects, experience] = await Promise.all([
    getCollection<About>("/about").catch(() => []),
    getCollection<Skill>("/skills").catch(() => []),
    getCollection<Project>("/projects").catch(() => []),
    getCollection<Experience>("/experience").catch(() => []),
  ]);
  const me = about[0];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#12304a,transparent_35%),#080b12]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-bold tracking-tight">PORTFOLIO</span>
        <div className="flex gap-5 text-sm text-slate-300">
          <a href="#skills">Skills</a><a href="#projects">Projects</a><a href="#experience">Experience</a><Link href="/contact">Contact</Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-28 pt-20 lg:grid-cols-[1.3fr_.7fr] lg:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[.3em] text-cyan-300">Full-Stack Developer</p>
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl">I build useful digital products.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{me?.bio || "Your bio will appear here once you add it in the CMS."}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/contact" className="rounded-full bg-cyan-400 px-6 py-3 font-bold text-slate-950">Let’s work together</Link>
            {me?.resume_link && <a href={me.resume_link} target="_blank" className="rounded-full border border-slate-700 px-6 py-3 font-semibold">Resume</a>}
          </div>
        </div>
        <div className="rounded-3xl border border-cyan-900/60 bg-slate-900/70 p-8 shadow-2xl">
          <p className="text-sm text-slate-400">Powered by</p>
          <p className="mt-2 text-2xl font-bold">FastAPI + SQLAlchemy + Next.js</p>
          <p className="mt-4 text-slate-400">Every portfolio section is controlled from your custom CMS API.</p>
        </div>
      </section>

      <section id="skills" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold">Skills</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map(s => <div key={s.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex justify-between"><span>{s.name}</span><span className="text-cyan-300">{s.proficiency}%</span></div>
            <div className="mt-4 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-cyan-400" style={{width:`${s.proficiency}%`}} /></div>
            <p className="mt-2 text-xs uppercase text-slate-500">{s.category}</p>
          </div>)}
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold">Selected Projects</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {projects.map(p => <article key={p.id} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
            {p.image && <img src={p.image} alt="" className="h-52 w-full object-cover" />}
            <div className="p-7">
              <h3 className="text-2xl font-bold">{p.title}</h3>
              <p className="mt-3 text-slate-400">{p.description}</p>
              <p className="mt-5 text-sm text-cyan-300">{p.tech_stack}</p>
              <div className="mt-6 flex gap-4 text-sm font-semibold">
                {p.live_link && <a href={p.live_link} target="_blank">Live ↗</a>}
                {p.github_link && <a href={p.github_link} target="_blank">GitHub ↗</a>}
              </div>
            </div>
          </article>)}
        </div>
      </section>

      <section id="experience" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold">Experience</h2>
        <div className="mt-8 space-y-4">
          {experience.map(e => <article key={e.id} className="rounded-2xl border border-slate-800 p-6">
            <div className="flex flex-wrap justify-between gap-3"><h3 className="text-xl font-bold">{e.role} · {e.company}</h3><span className="text-cyan-300">{e.timeline}</span></div>
            <p className="mt-3 text-slate-400">{e.description}</p>
          </article>)}
        </div>
      </section>

      <footer className="border-t border-slate-900 px-6 py-10 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Your Name. Built with a custom headless CMS.
      </footer>
    </main>
  );
}
