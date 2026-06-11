import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Faceoff — Duels entre potes",
  description: "Réglez vos paris en 10 secondes. Un mini-duel, un enjeu, un perdant.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <header className="sticky top-0 z-10 backdrop-blur bg-bg/70 border-b border-white/10">
          <div className="mx-auto max-w-3xl flex items-center justify-between px-4 h-14">
            <Link href="/" className="text-lg font-extrabold tracking-tight">
              ⚔️ Face<span className="text-accent">off</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
