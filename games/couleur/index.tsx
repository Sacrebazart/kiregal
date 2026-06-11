"use client";

import { useEffect, useRef, useState } from "react";
import type { DuelGameProps } from "@/lib/games";

const COLORS = [
  { name: "ROUGE", hex: "#ef4444" },
  { name: "BLEU", hex: "#3b82f6" },
  { name: "VERT", hex: "#10b981" },
  { name: "JAUNE", hex: "#eab308" },
];

type Phase = "ready" | "wait" | "go" | "done";

function shuffle<T>(a: T[]): T[] {
  return [...a].sort(() => Math.random() - 0.5);
}

export default function Couleur({ players, onResult }: DuelGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [target, setTarget] = useState(0);
  const [grid, setGrid] = useState(() => shuffle([0, 1, 2, 3]));
  const [loser, setLoser] = useState<0 | 1 | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const begin = () => {
    setPhase("wait");
    setLoser(null);
    timer.current = setTimeout(() => {
      setTarget(Math.floor(Math.random() * 4));
      setGrid(shuffle([0, 1, 2, 3]));
      setPhase("go");
    }, 1000 + Math.random() * 2500);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const tapColor = (player: 0 | 1, color: number) => {
    if (phase !== "go") return;
    const correct = color === target;
    setLoser(correct ? (player === 0 ? 1 : 0) : player);
    setPhase("done");
    setTimeout(() => onResult(correct ? player : player === 0 ? 1 : 0), 1200);
  };

  if (phase === "ready") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-bg px-8 text-center">
        <p className="text-white/60">
          Un mot va s&apos;afficher. Tape le carré de la <b>bonne couleur</b> le plus vite.
          Erreur = perdu !
        </p>
        <button onClick={begin} className="rounded-2xl bg-accent px-8 py-4 text-2xl font-extrabold">
          🎨 C&apos;est parti
        </button>
      </div>
    );
  }

  const zone = (player: 0 | 1, flip: boolean) => (
    <div className={`flex-1 flex flex-col items-center justify-center gap-4 ${flip ? "rotate-180" : ""}`}>
      <span className="text-white/40 text-sm font-semibold">{players[player]}</span>
      {phase === "wait" && <span className="text-2xl font-bold text-white/70">Prêt…</span>}
      {phase === "go" && (
        <>
          <span className="text-3xl font-black" style={{ color: COLORS[target].hex }}>
            {COLORS[target].name}
          </span>
          <div className="grid grid-cols-2 gap-3">
            {grid.map((c) => (
              <button
                key={c}
                onPointerDown={() => tapColor(player, c)}
                className="h-16 w-16 rounded-2xl"
                style={{ background: COLORS[c].hex }}
              />
            ))}
          </div>
        </>
      )}
      {phase === "done" && (
        <span className="text-3xl font-extrabold">{loser === player ? "Perdu 😤" : "Gagné 🎉"}</span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col">
      {zone(0, true)}
      <div className="h-1 bg-white/20" />
      {zone(1, false)}
    </div>
  );
}
