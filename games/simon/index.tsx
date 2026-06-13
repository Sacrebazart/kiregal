"use client";

import { useEffect, useRef, useState } from "react";
import type { DuelGameProps } from "@/lib/games";

const PADS = [
  { on: "#22d3ee", off: "#0b2b33" },
  { on: "#f59e0b", off: "#3a2208" },
  { on: "#a855f7", off: "#2a1340" },
  { on: "#10b981", off: "#0a2c20" },
];

type Phase = "handoff" | "show" | "input" | "over";

const rand = () => Math.floor(Math.random() * 4);

export default function Simon({ players, onResult }: DuelGameProps) {
  const [seq, setSeq] = useState<number[]>(() => [rand()]);
  const [turn, setTurn] = useState<0 | 1>(0);
  const [phase, setPhase] = useState<Phase>("handoff");
  const [active, setActive] = useState<number | null>(null);
  const [inputPos, setInputPos] = useState(0);
  const [loser, setLoser] = useState<0 | 1 | null>(null);
  const [showLabel, setShowLabel] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Joue la séquence en flashs, avec un petit "Prépare-toi" avant
  useEffect(() => {
    if (phase !== "show") return;
    clearTimers();
    setShowLabel("Regarde bien… 👀");
    setActive(null);
    const startDelay = 900;
    seq.forEach((pad, i) => {
      timers.current.push(setTimeout(() => setActive(pad), startDelay + 700 * i));
      timers.current.push(setTimeout(() => setActive(null), startDelay + 700 * i + 420));
    });
    timers.current.push(
      setTimeout(() => {
        setInputPos(0);
        setPhase("input");
      }, startDelay + 700 * seq.length + 250)
    );
    return clearTimers;
  }, [phase, seq, turn]);

  const tap = (pad: number) => {
    if (phase !== "input") return;
    setActive(pad);
    setTimeout(() => setActive(null), 150);

    if (pad !== seq[inputPos]) {
      // erreur → ce joueur perd
      setPhase("over");
      setLoser(turn);
      setTimeout(() => onResult(turn === 0 ? 1 : 0), 1200);
      return;
    }

    const next = inputPos + 1;
    if (next < seq.length) {
      setInputPos(next);
      return;
    }
    // séquence réussie par ce joueur → on passe la main (avec écran de passation)
    if (turn === 0) {
      setTurn(1);
      setPhase("handoff");
    } else {
      setSeq((s) => [...s, rand()]);
      setTurn(0);
      setPhase("handoff");
    }
  };

  // ----- ÉCRAN DE PASSATION (le temps de passer le téléphone) -----
  if (phase === "handoff") {
    const other = turn === 0 ? 1 : 0;
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-bg px-8 text-center">
        <div className="text-6xl">🤝</div>
        <div>
          <p className="text-white/50">Passe le téléphone à</p>
          <p className="text-4xl font-extrabold text-accent mt-1">{players[turn]}</p>
        </div>
        <p className="text-white/60 max-w-xs">
          Niveau {seq.length} · répète la séquence sans te tromper. {players[other]} attend son tour 👀
        </p>
        <button
          onClick={() => setPhase("show")}
          className="rounded-2xl bg-accent px-10 py-5 text-2xl font-extrabold active:scale-95 transition-transform"
        >
          Je suis {players[turn]} ✋
        </button>
      </div>
    );
  }

  // ----- JEU -----
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-bg px-6">
      <div className="text-center">
        <p className="text-white/40 text-sm">Niveau {seq.length}</p>
        <p className="text-2xl font-extrabold">
          {phase === "over"
            ? `${loser === 0 ? players[0] : players[1]} s'est trompé 😤`
            : phase === "show"
            ? showLabel
            : `À toi de répéter, ${players[turn]} !`}
        </p>
        {phase === "input" && (
          <p className="text-white/40 text-sm mt-1">
            {inputPos} / {seq.length}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PADS.map((c, i) => {
          const lit = active === i;
          return (
            <button
              key={i}
              data-pad={i}
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

      {phase === "show" && (
        <p className="text-white/30 text-sm">Mémorise bien, à toi juste après…</p>
      )}
    </div>
  );
}
