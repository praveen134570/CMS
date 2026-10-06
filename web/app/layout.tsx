import "./globals.css";

export const metadata = {
  title: "Your Name | Full-Stack Developer",
  description: "Personal portfolio powered by a custom headless CMS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
