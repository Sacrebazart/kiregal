"use client";

import Link from "next/link";
import { useState } from "react";
import { GAMES, getGame, randomGame, type Winner } from "@/lib/games";
import { shouldShowAd } from "@/lib/usePremium";
import { sfxWin, sfxDraw } from "@/lib/feedback";
import AdBanner from "@/components/AdBanner";
import RewardedAd from "@/components/RewardedAd";

type Step = "setup" | "play" | "result";
type StakeType = "gage" | "argent";

const GAGES_SUGGERES = [
  "🍻 régale ce soir",
  "🍽️ paie le resto",
  "☕ paie le café",
  "🧽 fait la vaisselle",
  "🍺 tournée générale",
  "💪 10 pompes",
  "🚮 sort la poubelle",
  "🚗 conduit au retour",
];

export default function DuelPage() {
  const [step, setStep] = useState<Step>("setup");
  const [p1, setP1] = useState("Joueur 1");
  const [p2, setP2] = useState("Joueur 2");
  const [stakeType, setStakeType] = useState<StakeType>("gage");
  const [gage, setGage] = useState("");
  const [montant, setMontant] = useState("10");
  const [gameSlug, setGameSlug] = useState<string>("random");
  const [activeSlug, setActiveSlug] = useState<string>("reaction");
  const [winner, setWinner] = useState<Winner>("draw");
  const [showBanner, setShowBanner] = useState(false);
  const [canPickRevenge, setCanPickRevenge] = useState(false);

  const start = () => {
    const g = gameSlug === "random" ? randomGame() : getGame(gameSlug)!;
    setActiveSlug(g.slug);
    setWinner("draw");
    setStep("play");
  };

  const onResult = (w: Winner) => {
    setWinner(w);
    if (w === "draw") sfxDraw();
    else sfxWin();
    setShowBanner(shouldShowAd()); // plafonné : 1 bannière tous les 3 duels
    setCanPickRevenge(false);
    setStep("result");
  };

  const replay = (slug?: string) => {
    const g = slug ? getGame(slug)! : gameSlug === "random" ? randomGame() : getGame(gameSlug)!;
    setActiveSlug(g.slug);
    setStep("play");
  };

  // ---- PLAY ----
  if (step === "play") {
    const Game = getGame(activeSlug)!.Component;
    return <Game players={[p1, p2]} onResult={onResult} />;
  }

  // ---- RESULT ----
  if (step === "result") {
    const draw = winner === "draw";
    const winnerName = winner === 0 ? p1 : winner === 1 ? p2 : null;
    const loserName = winner === 0 ? p2 : winner === 1 ? p1 : null;
    const verdict = draw
      ? "Égalité ! On remet ça."
      : stakeType === "gage"
      ? gage.trim()
        ? `${loserName} doit : ${gage.trim()}`
        : `${loserName} a perdu le gage.`
      : `${loserName} doit ${montant || "?"} € à ${winnerName}`;

    return (
      <div className="text-center py-10 flex flex-col items-center gap-6">
        <div className="text-6xl">{draw ? "🤝" : "🏆"}</div>
        <div>
          {!draw && <p className="text-white/50">Vainqueur</p>}
          <h1 className="text-3xl font-extrabold">{draw ? "Match nul" : winnerName}</h1>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-amber-400/40 bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-amber-300/80">L&apos;enjeu</p>
          <p className="mt-2 text-lg font-semibold">{verdict}</p>
          {stakeType === "argent" && !draw && (
            <p className="mt-2 text-xs text-white/40">
              Kirégal ne gère pas l&apos;argent — réglez ça entre vous 😉
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          {canPickRevenge ? (
            <div className="rounded-xl border border-accent/40 bg-accent/10 p-3">
              <p className="text-sm text-white/70 mb-2">Choisis le duel de la revanche :</p>
              <div className="grid grid-cols-4 gap-2">
                {GAMES.map((g) => (
                  <button
                    key={g.slug}
                    onClick={() => replay(g.slug)}
                    className="rounded-lg bg-card border border-white/10 py-2 text-xl"
                    title={g.title}
                  >
                    {g.emoji}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button onClick={() => replay()} className="rounded-xl bg-accent px-6 py-3 font-bold">
              🔁 Revanche
            </button>
          )}

          {!canPickRevenge && (
            <RewardedAd
              reward="choisis le jeu de la revanche"
              onReward={() => setCanPickRevenge(true)}
            />
          )}

          <button
            onClick={() => setStep("setup")}
            className="rounded-xl border border-white/20 px-6 py-3 font-semibold"
          >
            Nouveau duel
          </button>
          <Link href="/" className="text-sm text-white/40 hover:text-white">
            Accueil
          </Link>
        </div>

        {showBanner && <AdBanner label="Publicité" />}
      </div>
    );
  }

  // ---- SETUP ----
  return (
    <div className="flex flex-col gap-7 max-w-md mx-auto">
      <h1 className="text-2xl font-extrabold text-center">Nouveau duel</h1>

      <Field label="Les adversaires">
        <div className="flex items-center gap-3">
          <input
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            className="flex-1 rounded-xl bg-card border border-white/10 px-4 py-3 text-center"
          />
          <span className="text-white/30 font-bold">VS</span>
          <input
            value={p2}
            onChange={(e) => setP2(e.target.value)}
            className="flex-1 rounded-xl bg-card border border-white/10 px-4 py-3 text-center"
          />
        </div>
      </Field>

      <Field label="L'enjeu">
        <div className="flex gap-2 mb-3">
          <Toggle active={stakeType === "gage"} onClick={() => setStakeType("gage")}>
            🎭 Gage
          </Toggle>
          <Toggle active={stakeType === "argent"} onClick={() => setStakeType("argent")}>
            💸 Argent
          </Toggle>
        </div>
        {stakeType === "gage" ? (
          <>
            <input
              value={gage}
              onChange={(e) => setGage(e.target.value)}
              placeholder="ex : fait la vaisselle, paie le café…"
              className="w-full rounded-xl bg-card border border-white/10 px-4 py-3"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {GAGES_SUGGERES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGage(g)}
                  className={`rounded-full px-3 py-1.5 text-sm border ${
                    gage === g
                      ? "bg-accent border-accent"
                      : "bg-card border-white/10 text-white/70 hover:border-white/30"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-32 rounded-xl bg-card border border-white/10 px-4 py-3 text-center"
            />
            <span className="text-white/60">€ — le perdant doit au gagnant</span>
          </div>
        )}
      </Field>

      <Field label="Le duel">
        <div className="grid grid-cols-3 gap-2">
          <GameChip active={gameSlug === "random"} onClick={() => setGameSlug("random")} emoji="🎲" name="Au hasard" />
          {GAMES.map((g) => (
            <GameChip
              key={g.slug}
              active={gameSlug === g.slug}
              onClick={() => setGameSlug(g.slug)}
              emoji={g.emoji}
              name={g.title}
            />
          ))}
        </div>
      </Field>

      <button onClick={start} className="rounded-xl bg-accent px-6 py-4 text-lg font-bold">
        Affrontez-vous ⚔️
      </button>
      <Link href="/" className="text-center text-sm text-white/40 hover:text-white">
        Annuler
      </Link>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-white/40 mb-2">{label}</p>
      {children}
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl px-4 py-2 font-semibold border ${
        active ? "bg-accent border-accent" : "bg-card border-white/10 text-white/60"
      }`}
    >
      {children}
    </button>
  );
}

function GameChip({
  active,
  onClick,
  emoji,
  name,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  name: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-2 py-3 border text-center ${
        active ? "bg-accent/20 border-accent" : "bg-card border-white/10"
      }`}
    >
      <div className="text-2xl">{emoji}</div>
      <div className="text-xs mt-1">{name}</div>
    </button>
  );
}
