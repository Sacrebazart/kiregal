"use client";

import { useEffect, useRef, useState } from "react";
import type { DuelGameProps } from "@/lib/games";

type Phase = "ready" | "waiting" | "go" | "done";

export default function Target({ players, onResult }: DuelGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [loser, setLoser] = useState<0 | 1 | null>(null);
  const [dot, setDot] = useState({ x: 50, y: 50 });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const begin = () => {
    setPhase("waiting");
    setLoser(null);
    const delay = 1200 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setDot({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 });
      setPhase("go");
    }, delay);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const tapZone = (player: 0 | 1) => {
    if (phase === "ready") begin();
    else if (phase === "waiting") {
      clearTimeout(timerRef.current);
      setLoser(player);
      setPhase("done");
      onResult(player === 0 ? 1 : 0);
    }
  };

  const hitDot = (player: 0 | 1, e: React.PointerEvent) => {
    e.stopPropagation();
    if (phase !== "go") return;
    setLoser(player === 0 ? 1 : 0);
    setPhase("done");
    onResult(player);
  };

  const renderZone = (player: 0 | 1, flip: boolean) => {
    const color =
      phase === "waiting" ? "bg-rose-600" : phase === "go" ? "bg-slate-800" : "bg-card";
    return (
      <button
        onPointerDown={() => tapZone(player)}
        className={`${color} relative flex-1 flex items-center justify-center select-none transition-colors ${
          flip ? "rotate-180" : ""
        }`}
      >
        {phase === "go" && (
          <span
            onPointerDown={(e) => hitDot(player, e)}
            className="absolute h-20 w-20 rounded-full bg-emerald-400 ring-8 ring-emerald-300/60 shadow-[0_0_30px_rgba(16,185,129,0.8)] animate-pulse"
            style={{ left: `${dot.x}%`, top: `${dot.y}%`, transform: "translate(-50%,-50%)" }}
          />
        )}
        {phase !== "go" && (
          <span className="text-white text-2xl font-extrabold text-center px-4 pointer-events-none">
            {phase === "ready"
              ? "Touchez pour lancer"
              : phase === "waiting"
              ? "Attendez la zone verte…"
              : loser === player
              ? "Perdu 😤"
              : "Gagné 🎉"}
          </span>
        )}
        <span className="absolute bottom-3 text-white/50 text-sm font-semibold pointer-events-none">
          {players[player]}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 flex flex-col">
      {renderZone(0, true)}
      <div className="h-1 bg-white/20" />
      {renderZone(1, false)}
    </div>
  );
}
