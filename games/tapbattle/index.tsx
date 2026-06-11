"use client";

import { useEffect, useRef, useState } from "react";
import type { DuelGameProps } from "@/lib/games";

const DURATION = 5;

type Phase = "ready" | "countdown" | "play" | "done";

export default function TapBattle({ players, onResult }: DuelGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [count, setCount] = useState(3);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const scoresRef = useRef<[number, number]>([0, 0]);
  const resolved = useRef(false);

  // Countdown 3-2-1 puis démarrage
  useEffect(() => {
    if (phase !== "countdown") return;
    if (count === 0) {
      setPhase("play");
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [phase, count]);

  // Timer de jeu — NE dépend QUE du temps, pas des taps (sinon il se réinitialise sans cesse)
  useEffect(() => {
    if (phase !== "play") return;
    if (timeLeft <= 0) {
      if (!resolved.current) {
        resolved.current = true;
        const [a, b] = scoresRef.current;
        setPhase("done");
        setTimeout(() => onResult(a === b ? "draw" : a > b ? 0 : 1), 1300);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, onResult]);

  const start = () => {
    setScores([0, 0]);
    scoresRef.current = [0, 0];
    setTimeLeft(DURATION);
    setCount(3);
    resolved.current = false;
    setPhase("countdown");
  };

  const bump = (player: 0 | 1) => {
    if (phase !== "play") return;
    const ns: [number, number] = [...scoresRef.current] as [number, number];
    ns[player]++;
    scoresRef.current = ns;
    setScores(ns);
  };

  if (phase === "ready") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-bg">
        <button
          onClick={start}
          className="rounded-2xl bg-amber-400 px-8 py-4 text-2xl font-extrabold text-black"
        >
          👊 Démarrer le Tap Battle
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      <TapZone
        flip
        name={players[0]}
        score={scores[0]}
        color="bg-accent/30"
        phase={phase}
        count={count}
        timeLeft={timeLeft}
        onTap={() => bump(0)}
        win={phase === "done" && scores[0] > scores[1]}
      />
      <div className="h-1 bg-white/20" />
      <TapZone
        name={players[1]}
        score={scores[1]}
        color="bg-amber-400/20"
        phase={phase}
        count={count}
        timeLeft={timeLeft}
        onTap={() => bump(1)}
        win={phase === "done" && scores[1] > scores[0]}
      />
    </div>
  );
}

function TapZone({
  flip,
  name,
  score,
  color,
  phase,
  count,
  timeLeft,
  onTap,
  win,
}: {
  flip?: boolean;
  name: string;
  score: number;
  color: string;
  phase: Phase;
  count: number;
  timeLeft: number;
  onTap: () => void;
  win: boolean;
}) {
  return (
    <button
      onPointerDown={onTap}
      className={`${color} ${win ? "ring-4 ring-amber-300 ring-inset" : ""} flex-1 flex flex-col items-center justify-center select-none ${
        flip ? "rotate-180" : ""
      }`}
    >
      <span className="text-white/60 text-sm font-semibold">{name}</span>
      {phase === "countdown" ? (
        <span className="text-white text-6xl font-extrabold mt-2">
          {count === 0 ? "GO" : count}
        </span>
      ) : (
        <>
          <span className="text-white text-7xl font-extrabold mt-2 tabular-nums">{score}</span>
          {phase === "play" && (
            <span className="text-white/50 mt-2">{timeLeft}s — TAPEZ !</span>
          )}
          {phase === "done" && (
            <span className="text-white/70 mt-2">{win ? "Gagné 🎉" : "Perdu 😤"}</span>
          )}
        </>
      )}
    </button>
  );
}
