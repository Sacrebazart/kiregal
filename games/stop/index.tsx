"use client";

import { useRef, useState } from "react";
import type { DuelGameProps } from "@/lib/games";

const TARGET = 3; // secondes à viser

type Phase = "intro" | "running" | "shown";

export default function StopTimer({ players, onResult }: DuelGameProps) {
  const [turn, setTurn] = useState<0 | 1>(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [times, setTimes] = useState<[number | null, number | null]>([null, null]);
  const startRef = useRef(0);
  const [last, setLast] = useState(0);

  const action = () => {
    if (phase === "intro") {
      startRef.current = performance.now();
      setPhase("running");
    } else if (phase === "running") {
      const elapsed = (performance.now() - startRef.current) / 1000;
      setLast(elapsed);
      const nt: [number | null, number | null] = [...times] as [number | null, number | null];
      nt[turn] = elapsed;
      setTimes(nt);
      setPhase("shown");
    } else {
      // passer au joueur suivant ou conclure
      if (turn === 0) {
        setTurn(1);
        setPhase("intro");
      } else {
        const [a, b] = [times[0]!, last];
        const da = Math.abs(a - TARGET);
        const db = Math.abs(b - TARGET);
        onResult(da === db ? "draw" : da < db ? 0 : 1);
      }
    }
  };

  const diff = Math.abs(last - TARGET);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-bg px-8 text-center">
      <p className="text-white/50">Sans regarder l&apos;heure…</p>
      <p className="text-3xl font-extrabold">
        Arrête le chrono à <span className="text-accent2">{TARGET.toFixed(1)} s</span>
      </p>
      <div className="text-white/70 text-lg">
        Au tour de <span className="font-bold text-white">{players[turn]}</span>
        {times[0] !== null && turn === 1 && (
          <span className="block text-sm text-white/40 mt-1">
            {players[0]} a fait {times[0]!.toFixed(2)} s
          </span>
        )}
      </div>

      {phase === "shown" && (
        <div className="rounded-2xl bg-card border border-white/10 px-6 py-4">
          <div className="text-2xl font-extrabold">{last.toFixed(2)} s</div>
          <div className="text-sm text-white/50">à {diff.toFixed(2)} s de la cible</div>
        </div>
      )}

      <button
        onPointerDown={action}
        className={`rounded-2xl px-10 py-5 text-2xl font-extrabold ${
          phase === "running" ? "bg-rose-600" : "bg-accent"
        }`}
      >
        {phase === "intro"
          ? "▶︎ Démarrer"
          : phase === "running"
          ? "■ STOP"
          : turn === 0
          ? `Au tour de ${players[1]} →`
          : "Voir le résultat"}
      </button>
    </div>
  );
}
