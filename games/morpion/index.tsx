"use client";

import { useState } from "react";
import type { DuelGameProps } from "@/lib/games";

type Cell = 0 | 1 | null;
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];
const MARK = ["✕", "◯"];

function winner(b: Cell[]): 0 | 1 | null {
  for (const [a, c, d] of LINES) {
    if (b[a] !== null && b[a] === b[c] && b[a] === b[d]) return b[a] as 0 | 1;
  }
  return null;
}

export default function Morpion({ players, onResult }: DuelGameProps) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<0 | 1>(0);
  const [done, setDone] = useState(false);

  const play = (i: number) => {
    if (done || board[i] !== null) return;
    const nb = [...board];
    nb[i] = turn;
    setBoard(nb);
    const w = winner(nb);
    if (w !== null) {
      setDone(true);
      setTimeout(() => onResult(w), 1100);
      return;
    }
    if (nb.every((c) => c !== null)) {
      setDone(true);
      setTimeout(() => onResult("draw"), 1100);
      return;
    }
    setTurn((t) => (t === 0 ? 1 : 0));
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-bg px-6">
      <p className="text-2xl font-extrabold text-center">
        Au tour de <span style={{ color: turn === 0 ? "#22d3ee" : "#f59e0b" }}>{players[turn]}</span>{" "}
        <span className="text-3xl">{MARK[turn]}</span>
      </p>
      <div className="grid grid-cols-3 gap-2">
        {board.map((c, i) => (
          <button
            key={i}
            onPointerDown={() => play(i)}
            className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-card border border-white/15 grid place-items-center text-5xl font-black"
            style={{ color: c === 0 ? "#22d3ee" : c === 1 ? "#f59e0b" : undefined }}
          >
            {c === null ? "" : MARK[c]}
          </button>
        ))}
      </div>
      <p className="text-white/40 text-sm">Aligne 3 symboles pour gagner</p>
    </div>
  );
}
