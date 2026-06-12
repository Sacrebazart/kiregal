"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GAMES } from "@/lib/games";

// Dégradés "familiaux" par jeu (vifs, lumineux)
const GRAD: Record<string, [string, string]> = {
  reaction: ["#22d3ee", "#0284c7"],
  tapbattle: ["#fbbf24", "#f97316"],
  target: ["#34d399", "#059669"],
  tug: ["#c084fc", "#7c3aed"],
  math: ["#fb7185", "#e11d48"],
  stop: ["#fcd34d", "#f59e0b"],
  simon: ["#f472b6", "#db2777"],
  morpion: ["#38bdf8", "#2563eb"],
  chifoumi: ["#a78bfa", "#6d28d9"],
  couleur: ["#fb923c", "#ef4444"],
};

export default function Home() {
  const router = useRouter();
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Effet perspective : chaque carte tourne / zoome selon sa distance au centre
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const center = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      Array.from(el.querySelectorAll<HTMLElement>("[data-card]")).forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const d = (cardCenter - center) / el.clientWidth;
        const cl = Math.max(-1.3, Math.min(1.3, d));
        const inner = card.firstElementChild as HTMLElement;
        if (inner) {
          inner.style.transform = `rotateY(${cl * -24}deg) scale(${1 - Math.min(Math.abs(cl), 1) * 0.16}) translateZ(${-Math.abs(cl) * 80}px)`;
          inner.style.opacity = String(1 - Math.min(Math.abs(cl), 1) * 0.4);
        }
        if (Math.abs(d) < bestDist) {
          bestDist = Math.abs(d);
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
    };
  }, []);

  const launch = (slug: string) => {
    try {
      sessionStorage.setItem("kiregal_pickgame", slug);
    } catch {
      /* ignore */
    }
    router.push("/duel");
  };

  return (
    <div className="relative -mx-4 -my-8 min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* fond coloré flou */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute top-32 -right-20 h-72 w-72 rounded-full bg-accent2/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />
      </div>

      <div className="relative pt-8">
        <div className="px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">Kirégal</p>
          <h1 className="mt-1 text-4xl font-bold">Choisis ton défi</h1>
          <p className="mt-2 text-white/60">Glisse, lance, et que le dernier régale 🍻</p>
        </div>

        {/* Carrousel 3D */}
        <div
          ref={scroller}
          className="mt-6 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ perspective: "1200px", paddingInline: "calc(50% - 9.5rem)" }}
        >
          {GAMES.map((g) => {
            const [c1, c2] = GRAD[g.slug] ?? [g.accent, g.accent];
            return (
              <div key={g.slug} data-card className="shrink-0 snap-center w-[19rem]">
                <div
                  className="rounded-[2rem] p-5 shadow-2xl transition-[transform,opacity] duration-150 will-change-transform"
                  style={{
                    transformStyle: "preserve-3d",
                    background: `linear-gradient(160deg, ${c1}, ${c2})`,
                    boxShadow: `0 25px 50px -12px ${c2}99`,
                  }}
                >
                  {/* scène blanche avec l'illustration */}
                  <div className="relative grid h-56 place-items-center overflow-hidden rounded-3xl bg-white/90">
                    <Stars />
                    <span className="relative text-[7rem] drop-shadow-lg">{g.emoji}</span>
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-white drop-shadow">{g.title}</h2>
                  <p className="mt-1 text-sm leading-snug text-white/85">{g.tagline}</p>

                  <button
                    onClick={() => launch(g.slug)}
                    className="mt-4 w-full rounded-2xl bg-white py-3 text-lg font-bold shadow-lg active:scale-95 transition-transform"
                    style={{ color: c2 }}
                  >
                    Jouer ▶
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* points indicateurs */}
        <div className="flex justify-center gap-1.5">
          {GAMES.map((g, i) => (
            <span
              key={g.slug}
              className={`h-2 rounded-full transition-all ${
                i === active ? "w-6 bg-white" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* modes de jeu */}
        <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3 px-6">
          <button
            onClick={() => router.push("/duel")}
            className="rounded-2xl bg-white/10 border border-white/15 py-4 font-bold backdrop-blur active:scale-95 transition-transform"
          >
            ⚔️ Duel 1v1
          </button>
          <button
            onClick={() => router.push("/room")}
            className="rounded-2xl bg-white/10 border border-white/15 py-4 font-bold backdrop-blur active:scale-95 transition-transform"
          >
            🌐 Jusqu&apos;à 10
          </button>
        </div>

        <p className="mt-6 pb-10 text-center text-xs text-white/40">
          Qui régale ce soir ? Kirégal tranche.
        </p>
      </div>
    </div>
  );
}

function Stars() {
  const pts = [
    { x: "12%", y: "20%", s: "1.2rem" },
    { x: "82%", y: "16%", s: "0.9rem" },
    { x: "70%", y: "78%", s: "1.4rem" },
    { x: "20%", y: "74%", s: "1rem" },
    { x: "50%", y: "10%", s: "0.8rem" },
  ];
  return (
    <>
      {pts.map((p, i) => (
        <span
          key={i}
          className="absolute text-sky-300/70"
          style={{ left: p.x, top: p.y, fontSize: p.s }}
        >
          ★
        </span>
      ))}
    </>
  );
}
