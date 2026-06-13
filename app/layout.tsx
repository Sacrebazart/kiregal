import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Fredoka } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kirégal — Qui régale ce soir ?",
  description: "Qui paie le coup ? Qui fait la vaisselle ? Un mini-duel entre potes tranche pour vous. Le perdant régale.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${fredoka.className} min-h-screen`}>
        <header className="sticky top-0 z-10 backdrop-blur bg-bg/70 border-b border-white/10">
          <div className="mx-auto max-w-3xl flex items-center justify-between px-4 h-14">
            <Link href="/" className="text-lg font-extrabold tracking-tight">
              🍻 Ki<span className="text-accent">régal</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
