"use client";

import { useState } from "react";
import type { DuelGameProps } from "@/lib/games";

type Phase = "ready" | "play" | "done";

function makeQuestion() {
  const a = 2 + Math.floor(Math.random() * 11);
  const b = 2 + Math.floor(Math.random() * 11);
  const ops = ["+", "−", "×"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  const answer = op === "+" ? a + b : op === "−" ? a - b : a * b;
  const opts = new Set<number>([answer]);
  while (opts.size < 3) {
    const delta = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 6));
    opts.add(answer + delta);
  }
  return {
    text: `${a} ${op} ${b}`,
    answer,
    options: [...opts].sort(() => Math.random() - 0.5),
  };
}

export default function MathDuel({ players, onResult }: DuelGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [q, setQ] = useState(makeQuestion);
  const [loser, setLoser] = useState<0 | 1 | null>(null);

  const start = () => {
    setQ(makeQuestion());
    setLoser(null);
    setPhase("play");
  };

  const answer = (player: 0 | 1, value: number) => {
    if (phase !== "play") return;
    const correct = value === q.answer;
    setLoser(correct ? (player === 0 ? 1 : 0) : player);
    setPhase("done");
    onResult(correct ? player : player === 0 ? 1 : 0);
  };

  if (phase === "ready") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-bg">
        <p className="text-white/60 text-center px-8">
          Premier à toucher la bonne réponse. Mais attention, une erreur et c&apos;est perdu !
        </p>
        <button onClick={start} className="rounded-2xl bg-accent px-8 py-4 text-2xl font-extrabold">
          🧮 Calcul éclair
        </button>
      </div>
    );
  }

  const zone = (player: 0 | 1, flip: boolean) => (
    <div
      className={`flex-1 flex flex-col items-center justify-center gap-4 ${
        flip ? "rotate-180" : ""
      } ${phase === "done" ? (loser === player ? "bg-rose-900/30" : "bg-emerald-900/30") : ""}`}
    >
      <div className="text-white/40 text-sm font-semibold">{players[player]}</div>
      {phase === "done" ? (
        <div className="text-3xl font-extrabold">{loser === player ? "Perdu 😤" : "Gagné 🎉"}</div>
      ) : (
        <>
          <div className="text-4xl font-extrabold text-white">{q.text} = ?</div>
          <div className="flex gap-3">
            {q.options.map((o) => (
              <button
                key={o}
                onPointerDown={() => answer(player, o)}
                className="h-16 w-16 rounded-2xl bg-card border border-white/15 text-2xl font-bold active:bg-accent"
              >
                {o}
              </button>
            ))}
          </div>
        </>
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
