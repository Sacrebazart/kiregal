"use client";

import { useEffect, useRef, useState } from "react";
import type { DuelGameProps } from "@/lib/games";

const PADS = [
  { on: "#22d3ee", off: "#0b2b33" },
  { on: "#f59e0b", off: "#3a2208" },
  { on: "#a855f7", off: "#2a1340" },
  { on: "#10b981", off: "#0a2c20" },
];

type Phase = "show" | "input" | "over";

const rand = () => Math.floor(Math.random() * 4);

export default function Simon({ players, onResult }: DuelGameProps) {
  const [seq, setSeq] = useState<number[]>(() => [rand()]);
  const [turn, setTurn] = useState<0 | 1>(0);
  const [phase, setPhase] = useState<Phase>("show");
  const [active, setActive] = useState<number | null>(null);
  const [inputPos, setInputPos] = useState(0);
  const [loser, setLoser] = useState<0 | 1 | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Joue la séquence en boucle de flashs au début du tour
  useEffect(() => {
    if (phase !== "show") return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    seq.forEach((pad, i) => {
      timers.current.push(setTimeout(() => setActive(pad), 600 * i + 300));
      timers.current.push(setTimeout(() => setActive(null), 600 * i + 650));
    });
    timers.current.push(
      setTimeout(() => {
        setInputPos(0);
        setPhase("input");
      }, 600 * seq.length + 400)
    );
    return () => timers.current.forEach(clearTimeout);
  }, [phase, seq, turn]);

  const tap = (pad: number) => {
    if (phase !== "input") return;
    setActive(pad);
    setTimeout(() => setActive(null), 150);

    if (pad !== seq[inputPos]) {
      setPhase("over");
      setLoser(turn);
      setTimeout(() => onResult(turn === 0 ? 1 : 0), 700);
      return;
    }

    const next = inputPos + 1;
    if (next < seq.length) {
      setInputPos(next);
      return;
    }
    // séquence complétée par ce joueur
    if (turn === 0) {
      setTurn(1);
      setPhase("show");
    } else {
      // les deux ont réussi → on rallonge
      setSeq((s) => [...s, rand()]);
      setTurn(0);
      setPhase("show");
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-bg px-6">
      <div className="text-center">
        <p className="text-white/40 text-sm">Séquence de {seq.length}</p>
        <p className="text-2xl font-extrabold">
          {phase === "over"
            ? `${loser === 0 ? players[0] : players[1]} s'est trompé 😤`
            : phase === "show"
            ? `Regarde bien, ${players[turn]}…`
            : `À toi, ${players[turn]} !`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PADS.map((c, i) => {
          const lit = active === i;
          return (
            <button
              key={i}
              onPointerDown={() => tap(i)}
              disabled={phase !== "input"}
              style={{
                background: lit ? c.on : c.off,
                boxShadow: lit ? `0 0 45px 8px ${c.on}` : "none",
                transform: lit ? "scale(1.08)" : "scale(1)",
                borderColor: lit ? "#ffffff" : "rgba(255,255,255,0.06)",
              }}
              className="h-32 w-32 sm:h-36 sm:w-36 rounded-3xl border-2 transition-all duration-100 disabled:cursor-default"
            />
          );
        })}
      </div>
    </div>
  );
}
