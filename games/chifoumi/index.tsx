"use client";

import { useState } from "react";
import type { DuelGameProps } from "@/lib/games";

const MOVES = [
  { key: "pierre", emoji: "✊", label: "Pierre" },
  { key: "feuille", emoji: "✋", label: "Feuille" },
  { key: "ciseaux", emoji: "✌️", label: "Ciseaux" },
];

// 0 bat 2, 1 bat 0, 2 bat 1
function beats(a: number, b: number) {
  return (a === 0 && b === 2) || (a === 1 && b === 0) || (a === 2 && b === 1);
}

type Phase = "p0" | "handoff" | "p1" | "reveal";

export default function Chifoumi({ players, onResult }: DuelGameProps) {
  const [phase, setPhase] = useState<Phase>("p0");
  const [pick0, setPick0] = useState<number | null>(null);
  const [pick1, setPick1] = useState<number | null>(null);

  const choose = (player: 0 | 1, move: number) => {
    if (player === 0) {
      setPick0(move);
      setPhase("handoff");
    } else {
      setPick1(move);
      setPhase("reveal");
      const winner = pick0 === move ? "draw" : beats(move, pick0!) ? 1 : 0;
      setTimeout(() => onResult(winner), 1500);
    }
  };

  if (phase === "p0" || phase === "p1") {
    const player: 0 | 1 = phase === "p0" ? 0 : 1;
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 bg-bg px-6">
        <p className="text-xl text-white/70">
          <span className="font-bold text-white">{players[player]}</span>, choisis en secret 🤫
        </p>
        <div className="flex gap-4">
          {MOVES.map((m, i) => (
            <button
              key={m.key}
              onPointerDown={() => choose(player, i)}
              className="flex flex-col items-center gap-2 rounded-3xl bg-card border border-white/15 px-5 py-6 active:bg-accent"
            >
              <span className="text-5xl">{m.emoji}</span>
              <span className="text-sm text-white/60">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "handoff") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-bg px-6 text-center">
        <p className="text-3xl font-extrabold">Passe le téléphone à</p>
        <p className="text-4xl font-extrabold text-accent">{players[1]}</p>
        <button
          onClick={() => setPhase("p1")}
          className="mt-4 rounded-2xl bg-accent px-8 py-4 text-xl font-bold"
        >
          C&apos;est bon, à moi !
        </button>
      </div>
    );
  }

  // reveal
  const draw = pick0 === pick1;
  const p1wins = pick1 !== null && pick0 !== null && beats(pick1, pick0);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 bg-bg px-6">
      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="text-6xl">{MOVES[pick0!].emoji}</div>
          <div className="text-white/60 mt-2">{players[0]}</div>
        </div>
        <div className="text-2xl text-white/40">VS</div>
        <div className="text-center">
          <div className="text-6xl">{MOVES[pick1!].emoji}</div>
          <div className="text-white/60 mt-2">{players[1]}</div>
        </div>
      </div>
      <p className="text-3xl font-extrabold">
        {draw ? "Égalité 🤝" : `${players[p1wins ? 1 : 0]} gagne 🎉`}
      </p>
    </div>
  );
}
