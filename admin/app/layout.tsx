import "./globals.css";
import Link from "next/link";

export const metadata = { title: "Portfolio CMS", description: "Custom portfolio content management dashboard" };

const links = [
  ["Dashboard", "/"], ["Projects", "/projects"], ["Blogs", "/blogs"],
  ["Skills", "/skills"], ["Experience", "/experience"], ["Services", "/services"],
  ["Testimonials", "/testimonials"], ["Messages", "/messages"], ["About", "/about"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen md:flex">
          <aside className="w-full border-b border-slate-800 bg-slate-900 p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
            <h1 className="mb-6 text-xl font-bold">Portfolio CMS</h1>
            <nav className="grid gap-1">
              {links.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
