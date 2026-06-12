"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRoom } from "@/lib/realtime";
import { isSupabaseConfigured } from "@/lib/supabaseConfig";

function randomCode() {
  const L = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => L[Math.floor(Math.random() * L.length)]).join("");
}

export default function RoomPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [joined, setJoined] = useState(false);

  // ----- Pas encore configuré : instructions -----
  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-md mx-auto flex flex-col gap-4 py-8">
        <h1 className="text-2xl font-extrabold">🌐 Mode multi-téléphone</h1>
        <p className="text-white/60">
          Cette partie a besoin d&apos;un projet Supabase (gratuit) pour connecter
          les téléphones en temps réel. Il suffit de coller 2 valeurs dans{" "}
          <code className="text-accent2">lib/supabaseConfig.ts</code> :
        </p>
        <ol className="text-white/70 text-sm list-decimal pl-5 space-y-1">
          <li>Crée un projet sur supabase.com</li>
          <li>Project Settings → API</li>
          <li>Colle le <b>Project URL</b> et la <b>clé anon public</b></li>
        </ol>
        <Link href="/" className="text-accent2 text-sm hover:underline">
          ← Retour
        </Link>
      </div>
    );
  }

  // ----- Connecté à une room -----
  if (joined && name && code) {
    return <Room name={name} code={code} onLeave={() => setJoined(false)} />;
  }

  // ----- Lobby -----
  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 py-8">
      <h1 className="text-2xl font-extrabold text-center">🌐 Jouer à distance</h1>
      <p className="text-center text-white/50 text-sm">
        Chacun son téléphone. Créez une room, partagez le code.
      </p>

      <div>
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Ton pseudo</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        ➕ Créer une room
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

      <Link href="/" className="text-center text-sm text-white/40 hover:text-white">
        Retour
      </Link>
    </div>
  );
}

/** Room connectée : présence + démo de synchro temps réel (compteur partagé). */
function Room({ name, code, onLeave }: { name: string; code: string; onLeave: () => void }) {
  const room = useRoom(code, name);
  const [shared, setShared] = useState(0);

  useEffect(() => {
    const off = room.on("tap", () => setShared((n) => n + 1));
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = () => {
    setShared((n) => n + 1); // mon propre tap (broadcast self:false)
    room.send("tap", { by: name });
  };

  const others = room.players.filter((p) => p !== name);

  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-6 py-8 text-center">
      <div className="rounded-2xl bg-card border border-white/15 px-8 py-5">
        <p className="text-xs uppercase tracking-wide text-white/40">Code de la room</p>
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
        <p className="text-white/50 text-sm mb-2">Dans la room ({room.players.length})</p>
        <div className="flex flex-wrap justify-center gap-2">
          {room.players.map((p) => (
            <span key={p} className="rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-sm">
              {p} {p === name && "(toi)"} {room.isHost && p === name && "👑"}
            </span>
          ))}
        </div>
        {others.length === 0 && (
          <p className="text-white/40 text-xs mt-3">
            En attente d&apos;un adversaire… partage le code <b>{code}</b>
          </p>
        )}
      </div>

      {/* Démo de synchro temps réel — preuve que les 2 téléphones se parlent */}
      <div className="w-full rounded-xl border border-dashed border-white/15 p-4">
        <p className="text-white/50 text-sm">Test de synchro (compteur partagé)</p>
        <p className="text-5xl font-black my-2 tabular-nums">{shared}</p>
        <button onClick={tap} className="rounded-xl bg-accent px-6 py-3 font-bold">
          +1 (visible sur les 2 écrans)
        </button>
        <p className="text-white/30 text-xs mt-2">
          Tape ici : le chiffre monte aussi sur l&apos;autre téléphone. Les vrais duels
          synchronisés arrivent juste après.
        </p>
      </div>

      <button onClick={onLeave} className="text-sm text-white/40 hover:text-white">
        Quitter la room
      </button>
    </div>
  );
}
