"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRoom, RoomApi } from "@/lib/realtime";
import { isSupabaseConfigured } from "@/lib/supabaseConfig";
import { sfxTick, sfxGo, sfxWin, sfxLose } from "@/lib/feedback";
import ShareResult from "@/components/ShareResult";

const MAX_PLAYERS = 10;

function randomCode() {
  const L = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => L[Math.floor(Math.random() * L.length)]).join("");
}

export default function RoomPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [joined, setJoined] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-md mx-auto flex flex-col gap-4 py-8">
        <h1 className="text-2xl font-extrabold">🌐 Mode multi-téléphone</h1>
        <p className="text-white/60">
          Config Supabase manquante dans <code className="text-accent2">lib/supabaseConfig.ts</code>.
        </p>
        <Link href="/" className="text-accent2 text-sm hover:underline">← Retour</Link>
      </div>
    );
  }

  if (joined && name && code) {
    return <Room name={name} code={code} onLeave={() => setJoined(false)} />;
  }

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 py-8">
      <h1 className="text-2xl font-extrabold text-center">🌐 Battle royale</h1>
      <p className="text-center text-white/50 text-sm">
        Jusqu&apos;à {MAX_PLAYERS} joueurs, chacun son téléphone. Le dernier régale 🍻
      </p>

      <div>
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Ton pseudo</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 12))}
          placeholder="Ton prénom"
          className="w-full rounded-xl bg-card border border-white/10 px-4 py-3 text-center"
        />
      </div>

      <button
        disabled={!name.trim()}
        onClick={() => {
          setCode(randomCode());
          setJoined(true);
        }}
        className="rounded-xl bg-accent px-6 py-4 text-lg font-bold disabled:opacity-40"
      >
        ➕ Créer une partie
      </button>

      <div className="flex items-center gap-3 text-white/30 text-sm">
        <div className="h-px flex-1 bg-white/10" /> ou <div className="h-px flex-1 bg-white/10" />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Rejoindre avec un code</p>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="CODE"
            className="flex-1 rounded-xl bg-card border border-white/10 px-4 py-3 text-center tracking-[0.3em] font-bold uppercase"
          />
          <button
            disabled={!name.trim() || code.length !== 4}
            onClick={() => setJoined(true)}
            className="rounded-xl border border-white/20 px-5 font-semibold disabled:opacity-40"
          >
            Rejoindre
          </button>
        </div>
      </div>

      <Link href="/" className="text-center text-sm text-white/40 hover:text-white">Retour</Link>
    </div>
  );
}

// ----------------------------------------------------------------------------

type Phase = "lobby" | "countdown" | "play" | "done";
type Rank = { name: string; score: number };
const DURATION = 5;

function Room({ name, code, onLeave }: { name: string; code: string; onLeave: () => void }) {
  const room = useRoom(code, name);
  return <RoomInner key={code} room={room} name={name} code={code} onLeave={onLeave} />;
}

function RoomInner({
  room,
  name,
  code,
  onLeave,
}: {
  room: RoomApi;
  name: string;
  code: string;
  onLeave: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [stake, setStake] = useState("Le dernier régale 🍻");
  const [count, setCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [ranking, setRanking] = useState<Rank[]>([]);
  const [finalStake, setFinalStake] = useState("");

  const scoresRef = useRef<Record<string, number>>({});
  const myScore = useRef(0);
  const lastSent = useRef(0);
  const finalized = useRef(false);
  const isHost = room.isHost;
  const isHostRef = useRef(isHost);
  isHostRef.current = isHost;

  const setScore = (player: string, val: number) => {
    scoresRef.current = { ...scoresRef.current, [player]: val };
    setScores(scoresRef.current);
  };

  // ---- Réception des événements ----
  useEffect(() => {
    const offs = [
      room.on("start", (p) => {
        const { stake } = p as { stake: string };
        setFinalStake(stake);
        myScore.current = 0;
        scoresRef.current = {};
        setScores({});
        finalized.current = false;
        setCount(3);
        setPhase("countdown");
      }),
      room.on("go", () => {
        setTimeLeft(DURATION);
        setPhase("play");
      }),
      room.on("score", (p) => {
        const { name: n, score } = p as { name: string; score: number };
        setScore(n, score);
      }),
      room.on("final", (p) => {
        const { ranking, stake } = p as { ranking: Rank[]; stake: string };
        setRanking(ranking);
        setFinalStake(stake);
        setPhase("done");
        const last = ranking[ranking.length - 1];
        if (last?.name === name) sfxLose();
        else sfxWin();
      }),
    ];
    return () => offs.forEach((o) => o());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Décompte 3-2-1 (visuel, tous) ----
  useEffect(() => {
    if (phase !== "countdown") return;
    if (count <= 0) return;
    sfxTick();
    const t = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [phase, count]);

  // ---- Chrono de jeu (tous) + finalisation (hôte) ----
  useEffect(() => {
    if (phase !== "play") return;
    if (timeLeft <= 0) {
      // chacun envoie son score final exact
      room.send("score", { name, score: myScore.current });
      setScore(name, myScore.current);
      if (isHostRef.current && !finalized.current) {
        finalized.current = true;
        setTimeout(() => {
          const rk: Rank[] = Object.entries(scoresRef.current)
            .map(([n, s]) => ({ name: n, score: s }))
            .sort((a, b) => b.score - a.score);
          room.send("final", { ranking: rk, stake });
          setRanking(rk);
          setPhase("done");
          const last = rk[rk.length - 1];
          if (last?.name === name) sfxLose();
          else sfxWin();
        }, 700);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  // ---- Actions hôte ----
  const startGame = () => {
    sfxGo();
    room.send("start", { stake });
    // local (broadcast self:false)
    setFinalStake(stake);
    myScore.current = 0;
    scoresRef.current = {};
    setScores({});
    finalized.current = false;
    setCount(3);
    setPhase("countdown");
    setTimeout(() => {
      room.send("go", {});
      setTimeLeft(DURATION);
      setPhase("play");
    }, 2200);
  };

  const tap = () => {
    if (phase !== "play") return;
    myScore.current++;
    setScore(name, myScore.current);
    const now = Date.now();
    if (now - lastSent.current > 120) {
      lastSent.current = now;
      room.send("score", { name, score: myScore.current });
    }
  };

  const playAgain = () => {
    setPhase("lobby");
    setRanking([]);
  };

  // ================= RENDER =================
  const liveScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  if (phase === "countdown" || phase === "play") {
    return (
      <div className="fixed inset-0 flex flex-col bg-bg">
        <div className="text-center pt-6">
          {phase === "countdown" ? (
            <p className="text-6xl font-black">{count > 0 ? count : "GO"}</p>
          ) : (
            <p className="text-2xl font-bold text-white/70">{timeLeft}s — TAPE !</p>
          )}
        </div>

        {/* Scores live de tous */}
        <div className="px-5 mt-3 flex flex-wrap justify-center gap-2">
          {liveScores.map(([n, s]) => (
            <span
              key={n}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                n === name ? "bg-accent text-white" : "bg-card border border-white/10 text-white/70"
              }`}
            >
              {n} {s}
            </span>
          ))}
        </div>

        {/* Ma zone de tap géante */}
        <button
          onPointerDown={tap}
          disabled={phase !== "play"}
          className="flex-1 m-5 rounded-3xl bg-amber-400/20 active:bg-amber-400/40 disabled:opacity-40 flex flex-col items-center justify-center select-none"
        >
          <span className="text-8xl font-black tabular-nums">{myScore.current}</span>
          <span className="text-white/50 mt-2">{name}</span>
        </button>
      </div>
    );
  }

  if (phase === "done") {
    const winner = ranking[0];
    const loser = ranking[ranking.length - 1];
    return (
      <div className="max-w-md mx-auto flex flex-col items-center gap-5 py-8 text-center">
        <div className="text-6xl">🏆</div>
        <h1 className="text-2xl font-extrabold">{winner?.name} gagne !</h1>

        <div className="w-full rounded-2xl border border-amber-400/40 bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-amber-300/80">L&apos;enjeu</p>
          <p className="mt-1 text-lg font-semibold">
            {loser?.name} : {finalStake}
          </p>
        </div>

        <div className="w-full rounded-xl bg-card border border-white/10 p-4">
          <p className="text-white/50 text-sm mb-2">Classement</p>
          <ol className="space-y-1">
            {ranking.map((r, i) => (
              <li
                key={r.name}
                className={`flex justify-between rounded-lg px-3 py-2 ${
                  i === ranking.length - 1 ? "bg-rose-900/30" : i === 0 ? "bg-emerald-900/30" : "bg-white/5"
                }`}
              >
                <span>
                  {i + 1}. {r.name} {r.name === name && "(toi)"}
                </span>
                <span className="font-bold tabular-nums">{r.score}</span>
              </li>
            ))}
          </ol>
        </div>

        <ShareResult
          text={`🍻 Kirégal — ${loser?.name} régale ce soir ! 🏆 ${winner?.name} a gagné le Tap Battle à ${ranking.length}. Viens prendre ta revanche 👊`}
        />

        {isHost ? (
          <button onClick={playAgain} className="w-full rounded-xl bg-accent px-6 py-3 font-bold">
            🔁 Rejouer
          </button>
        ) : (
          <p className="text-white/50 text-sm">En attente de l&apos;hôte pour rejouer…</p>
        )}
        <button onClick={onLeave} className="text-sm text-white/40 hover:text-white">
          Quitter la partie
        </button>
      </div>
    );
  }

  // ---- LOBBY ----
  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-6 py-8 text-center">
      <div className="rounded-2xl bg-card border border-white/15 px-8 py-5">
        <p className="text-xs uppercase tracking-wide text-white/40">Code de la partie</p>
        <p className="text-4xl font-black tracking-[0.3em] mt-1">{code}</p>
      </div>

      <p className="text-sm">
        {room.status === "connected" ? (
          <span className="text-emerald-400">● Connecté</span>
        ) : room.status === "error" ? (
          <span className="text-rose-400">● Erreur de connexion</span>
        ) : (
          <span className="text-white/50">● Connexion…</span>
        )}
      </p>

      <div className="w-full rounded-xl bg-card border border-white/10 p-4">
        <p className="text-white/50 text-sm mb-2">
          Joueurs ({room.players.length}/{MAX_PLAYERS})
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {room.players.map((p) => (
            <span key={p} className="rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-sm">
              {p} {p === name && "(toi)"} {room.isHost && p === name && "👑"}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2 text-left">
          L&apos;enjeu (le dernier l&apos;exécute)
        </p>
        <input
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          disabled={!isHost}
          className="w-full rounded-xl bg-card border border-white/10 px-4 py-3 text-center disabled:opacity-60"
        />
        {!isHost && <p className="text-white/30 text-xs mt-1">Seul l&apos;hôte 👑 règle l&apos;enjeu</p>}
      </div>

      {isHost ? (
        <button
          onClick={startGame}
          disabled={room.players.length < 2}
          className="w-full rounded-xl bg-accent px-6 py-4 text-lg font-bold disabled:opacity-40"
        >
          👊 Lancer le Tap Battle
        </button>
      ) : (
        <p className="text-white/50">En attente que l&apos;hôte lance la partie…</p>
      )}

      <p className="text-white/30 text-xs">
        Partage le code <b>{code}</b> pour que tes potes rejoignent.
      </p>
      <button onClick={onLeave} className="text-sm text-white/40 hover:text-white">
        Quitter
      </button>
    </div>
  );
}
