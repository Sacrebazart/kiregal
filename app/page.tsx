import Link from "next/link";
import { GAMES } from "@/lib/games";

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="text-center py-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Alors,
          <br />
          <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
            qui régale ce soir ?
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-white/60">
          Qui paie le coup ? Qui fait la vaisselle ? On parie 10 balles ?
          Arrêtez de débattre : un mini-duel débile tranche en 10 secondes. Le
          perdant régale.
        </p>
        <Link
          href="/duel"
          className="mt-8 inline-block rounded-xl bg-accent px-8 py-4 text-lg font-bold hover:opacity-90"
        >
          ⚔️ Lancer un duel
        </Link>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40 mb-4">
          Les duels
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {GAMES.map((g) => (
            <div key={g.slug} className="rounded-2xl bg-card border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="grid h-12 w-12 place-items-center rounded-xl text-2xl shrink-0"
                  style={{ background: `${g.accent}22` }}
                >
                  {g.emoji}
                </div>
                <div>
                  <h3 className="font-bold">{g.title}</h3>
                  <p className="text-xs text-white/50">{g.tagline}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center">
        <Link
          href="/room"
          className="inline-block rounded-xl border border-white/20 px-6 py-3 font-semibold hover:bg-white/5"
        >
          🌐 Jouer chacun sur son téléphone
        </Link>
        <p className="mt-4 text-xs text-white/40">
          Bientôt : plus de duels en multi · classements entre potes.
        </p>
      </section>
    </div>
  );
}
