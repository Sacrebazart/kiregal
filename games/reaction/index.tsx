"use client";

import { useEffect, useRef, useState } from "react";
import type { DuelGameProps } from "@/lib/games";
import { sfxGo } from "@/lib/feedback";

type Phase = "ready" | "waiting" | "go" | "done";

export default function ReactionDuel({ players, onResult }: DuelGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [loser, setLoser] = useState<0 | 1 | null>(null);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const begin = () => {
    setPhase("waiting");
    setLoser(null);
    const delay = 1500 + Math.random() * 3500;
    timerRef.current = setTimeout(() => {
      startRef.current = performance.now();
      sfxGo();
      setPhase("go");
    }, delay);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const tap = (player: 0 | 1) => {
    if (phase === "ready") {
      begin();
    } else if (phase === "waiting") {
      // tapé trop tôt → ce joueur perd
      clearTimeout(timerRef.current);
      setLoser(player);
      setPhase("done");
      setTimeout(() => onResult(player === 0 ? 1 : 0), 1300);
    } else if (phase === "go") {
      setPhase("done");
      setLoser(player === 0 ? 1 : 0);
      setTimeout(() => onResult(player), 1300);
    }
  };

  const zoneColor = (player: 0 | 1) => {
    if (phase === "go") return "bg-emerald-500";
    if (phase === "waiting") return "bg-rose-600";
    if (phase === "done") return loser === player ? "bg-rose-900" : "bg-emerald-600";
    return "bg-card";
  };

  const zoneText = (player: 0 | 1) => {
    if (phase === "ready") return "Touchez pour lancer";
    if (phase === "waiting") return "Attendez…";
    if (phase === "go") return "TAPEZ !";
    // done
    if (loser === player) return "Perdu 😤";
    return "Gagné 🎉";
  };

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Joueur 1 (haut, à l'envers) */}
      <Zone
        onTap={() => tap(0)}
        color={zoneColor(0)}
        flip
        name={players[0]}
        text={zoneText(0)}
        won={phase === "done" && loser === 1}
      />
      <div className="h-1 bg-white/20" />
      {/* Joueur 2 (bas) */}
      <Zone
        onTap={() => tap(1)}
        color={zoneColor(1)}
        name={players[1]}
        text={zoneText(1)}
        won={phase === "done" && loser === 0}
      />
    </div>
  );
}

function Zone({
  onTap,
  color,
  flip,
  name,
  text,
  won,
}: {
  onTap: () => void;
  color: string;
  flip?: boolean;
  name: string;
  text: string;
  won: boolean;
}) {
  return (
    <button
      onPointerDown={onTap}
      className={`${color} ${won ? "ring-4 ring-amber-300 ring-inset" : ""} flex-1 flex flex-col items-center justify-center select-none transition-colors ${
        flip ? "rotate-180" : ""
      }`}
    >
      <span className="text-white/60 text-sm font-semibold">{name}</span>
      <span className="text-white text-4xl font-extrabold mt-2 text-center px-4">{text}</span>
    </button>
  );
}
