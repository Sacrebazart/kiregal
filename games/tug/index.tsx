"use client";

import { useEffect, useRef, useState } from "react";
import type { DuelGameProps } from "@/lib/games";

type Phase = "ready" | "countdown" | "play" | "done";
const STEP = 2.2;

export default function Tug({ players, onResult }: DuelGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [count, setCount] = useState(3);
  const [pos, setPos] = useState(50); // 0 = joueur du haut gagne, 100 = joueur du bas
  const resolved = useRef(false);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (count === 0) {
      setPhase("play");
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [phase, count]);

  const start = () => {
    setPos(50);
    setCount(3);
    resolved.current = false;
    setPhase("countdown");
  };

  const pull = (player: 0 | 1) => {
    if (phase !== "play") return;
    setPos((p) => {
      const np = player === 0 ? p - STEP : p + STEP;
      if (np <= 0 && !resolved.current) {
        resolved.current = true;
        setPhase("done");
        setTimeout(() => onResult(0), 600);
        return 0;
      }
      if (np >= 100 && !resolved.current) {
        resolved.current = true;
        setPhase("done");
        setTimeout(() => onResult(1), 600);
        return 100;
      }
      return np;
    });
  };

  if (phase === "ready") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-bg">
        <p className="text-white/60 text-center px-8">
          Tapez votre zone le plus vite possible pour tirer la corde de votre côté !
        </p>
        <button
          onClick={start}
          className="rounded-2xl bg-accent px-8 py-4 text-2xl font-extrabold"
        >
          🪢 Bras de fer
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      <button
        onPointerDown={() => pull(0)}
        style={{ flexGrow: pos }}
        className="bg-accent/40 flex items-end justify-center select-none rotate-180 pb-6 transition-[flex-grow] duration-75"
      >
        <span className="text-white text-xl font-bold">
          {phase === "countdown" ? count || "GO" : players[0]}
        </span>
      </button>
      <div className="h-2 bg-white/40" />
      <button
        onPointerDown={() => pull(1)}
        style={{ flexGrow: 100 - pos }}
        className="bg-amber-400/30 flex items-start justify-center select-none pt-6 transition-[flex-grow] duration-75"
      >
        <span className="text-white text-xl font-bold">
          {phase === "countdown" ? count || "GO" : players[1]}
        </span>
      </button>
    </div>
  );
}
