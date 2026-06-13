"use client";

import { useRouter } from "next/navigation";

export default function Intro() {
  const router = useRouter();

  return (
    <div className="relative -mx-4 -my-8 min-h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col">
      {/* fonds colorés flous */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute bottom-0 -right-20 h-80 w-80 rounded-full bg-accent2/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />
      </div>

      {/* LOGO */}
      <div className="relative pt-10 pb-6 text-center">
        <div className="text-6xl">🍻</div>
        <h1 className="mt-2 text-5xl font-bold tracking-tight">
          Ki<span className="text-accent">régal</span>
        </h1>
        <p className="mt-2 text-white/60">Qui régale ce soir ? On tranche en un duel.</p>
      </div>

      {/* 2 BOUTONS CARRÉS */}
      <div className="relative flex-1 flex flex-col gap-4 px-5 pb-8 max-w-md w-full mx-auto">
        {/* HAUT — Duo local */}
        <ModeButton
          onClick={() => router.push("/jouer")}
          gradient={["#7c5cff", "#db2777"]}
          emoji="👥"
          title="En duo"
          subtitle="Sur ce téléphone, passez-vous l'appareil"
        />
        {/* BAS — Réseau */}
        <ModeButton
          onClick={() => router.push("/room")}
          gradient={["#22d3ee", "#2563eb"]}
          emoji="🌐"
          title="En réseau"
          subtitle="Chacun son téléphone, jusqu'à 10 joueurs"
        />
      </div>
    </div>
  );
}

function ModeButton({
  onClick,
  gradient,
  emoji,
  title,
  subtitle,
}: {
  onClick: () => void;
  gradient: [string, string];
  emoji: string;
  title: string;
  subtitle: string;
}) {
  const [c1, c2] = gradient;
  return (
    <button
      onClick={onClick}
      className="group relative flex-1 w-full overflow-hidden rounded-[2rem] p-6 text-left shadow-2xl active:scale-[0.98] transition-transform"
      style={{
        background: `linear-gradient(150deg, ${c1}, ${c2})`,
        boxShadow: `0 25px 50px -12px ${c2}88`,
      }}
    >
      {/* gros emoji décoratif */}
      <span className="pointer-events-none absolute -right-4 -bottom-6 text-[9rem] opacity-25 drop-shadow-lg">
        {emoji}
      </span>
      <div className="relative flex h-full flex-col justify-center">
        <span className="text-5xl drop-shadow">{emoji}</span>
        <h2 className="mt-3 text-3xl font-bold text-white drop-shadow">{title}</h2>
        <p className="mt-1 max-w-[14rem] text-sm text-white/90">{subtitle}</p>
        <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold" style={{ color: c2 }}>
          Choisir ▶
        </span>
      </div>
    </button>
  );
}
