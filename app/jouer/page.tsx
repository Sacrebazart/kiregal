"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GAMES } from "@/lib/games";

const GRAD: Record<string, [string, string]> = {
  random: ["#f472b6", "#8b5cf6"],
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

const GAGES = [
  "🍻 régale ce soir",
  "🍽️ paie le resto",
  "☕ paie le café",
  "🧽 fait la vaisselle",
  "🍺 tournée générale",
  "💪 10 pompes",
];

type Card = { slug: string; title: string; emoji: string; tagline: string };

const CARDS: Card[] = [
  { slug: "random", title: "Aléatoire", emoji: "🎲", tagline: "Le sort choisit le jeu. Surprise !" },
  ...GAMES.map((g) => ({ slug: g.slug, title: g.title, emoji: g.emoji, tagline: g.tagline })),
];

export default function JouerPage() {
  const router = useRouter();
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const [p1, setP1] = useState("Joueur 1");
  const [p2, setP2] = useState("Joueur 2");
  const [stakeType, setStakeType] = useState<"gage" | "argent">("gage");
  const [gage, setGage] = useState("");
  const [montant, setMontant] = useState("10");
  const [format, setFormat] = useState<"single" | "bo3">("bo3");

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
    const cfg = {
      game: slug,
      stakeType,
      gage,
      montant,
      p1: p1.trim() || "Joueur 1",
      p2: p2.trim() || "Joueur 2",
      format,
    };
    try {
      sessionStorage.setItem("kiregal_duel_config", JSON.stringify(cfg));
    } catch {
      /* ignore */
    }
    router.push("/duel");
  };

  return (
    <div className="relative -mx-4 -my-8 min-h-[calc(100vh-3.5rem)] overflow-hidden pb-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-accent2/30 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />
      </div>

      <div className="relative pt-5">
        <div className="px-6 flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-white/10 border border-white/15 h-9 w-9 grid place-items-center text-lg"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold leading-tight">En duo 👥</h1>
            <p className="text-xs text-white/60">Règle le pari, choisis le jeu, ça se lance.</p>
          </div>
        </div>

        {/* LE PARI */}
        <div className="mx-auto mt-5 max-w-md px-4">
          <div className="rounded-3xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-wide text-amber-300/80 mb-2">🎯 Le pari</p>
            <div className="flex gap-2 mb-2">
              <Pill active={stakeType === "gage"} onClick={() => setStakeType("gage")}>🎭 Gage</Pill>
              <Pill active={stakeType === "argent"} onClick={() => setStakeType("argent")}>💸 Argent</Pill>
            </div>
            {stakeType === "gage" ? (
              <>
                <input
                  value={gage}
                  onChange={(e) => setGage(e.target.value)}
                  placeholder="Le perdant… (ex : paie le resto)"
                  className="w-full rounded-xl bg-card border border-white/10 px-4 py-2.5 text-sm"
                />
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {GAGES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGage(g)}
                      className={`shrink-0 rounded-full px-3 py-1 text-xs border ${
                        gage === g ? "bg-accent border-accent" : "bg-card border-white/10 text-white/70"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className="w-24 rounded-xl bg-card border border-white/10 px-4 py-2.5 text-center text-sm"
                />
                <span className="text-white/60 text-sm">€ — le perdant doit au gagnant</span>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <input
                value={p1}
                onChange={(e) => setP1(e.target.value.slice(0, 12))}
                className="flex-1 rounded-xl bg-card border border-white/10 px-3 py-2 text-center text-sm"
              />
              <span className="text-white/30 text-xs font-bold">VS</span>
              <input
                value={p2}
                onChange={(e) => setP2(e.target.value.slice(0, 12))}
                className="flex-1 rounded-xl bg-card border border-white/10 px-3 py-2 text-center text-sm"
              />
            </div>
            <div className="mt-2 flex gap-2">
              <Pill active={format === "single"} onClick={() => setFormat("single")}>⚡ 1 manche</Pill>
              <Pill active={format === "bo3"} onClick={() => setFormat("bo3")}>🔥 3 manches</Pill>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm font-semibold text-white/50">
          👇 Tape un jeu pour lancer le duel
        </p>
        <div
          ref={scroller}
          className="mt-3 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ perspective: "1200px", paddingInline: "calc(50% - 9.5rem)" }}
        >
          {CARDS.map((c) => {
            const [c1, c2] = GRAD[c.slug] ?? ["#888", "#555"];
            return (
              <div key={c.slug} data-card className="shrink-0 snap-center w-[19rem]">
                <button
                  onClick={() => launch(c.slug)}
                  className="block w-full text-left rounded-[2rem] p-5 shadow-2xl transition-[transform,opacity] duration-150 will-change-transform active:scale-[0.98]"
                  style={{
                    transformStyle: "preserve-3d",
                    background: `linear-gradient(160deg, ${c1}, ${c2})`,
                    boxShadow: `0 25px 50px -12px ${c2}99`,
                  }}
                >
                  <div className="relative grid h-48 place-items-center overflow-hidden rounded-3xl bg-white/90">
                    <Stars />
                    <span className="relative text-[6.5rem] drop-shadow-lg">{c.emoji}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-white drop-shadow">{c.title}</h2>
                  <p className="mt-1 text-sm leading-snug text-white/85">{c.tagline}</p>
                  <div
                    className="mt-4 w-full rounded-2xl bg-white py-3 text-center text-lg font-bold shadow-lg"
                    style={{ color: c2 }}
                  >
                    Jouer ▶
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-1.5">
          {CARDS.map((c, i) => (
            <span
              key={c.slug}
              className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-2 bg-white/30"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold border ${
        active ? "bg-accent border-accent" : "bg-card border-white/10 text-white/60"
      }`}
    >
      {children}
    </button>
  );
}

function Stars() {
  const pts = [
    { x: "12%", y: "20%", s: "1.1rem" },
    { x: "82%", y: "16%", s: "0.85rem" },
    { x: "70%", y: "78%", s: "1.3rem" },
    { x: "20%", y: "74%", s: "0.95rem" },
    { x: "50%", y: "10%", s: "0.75rem" },
  ];
  return (
    <>
      {pts.map((p, i) => (
        <span key={i} className="absolute text-sky-300/70" style={{ left: p.x, top: p.y, fontSize: p.s }}>
          ★
        </span>
      ))}
    </>
  );
}
