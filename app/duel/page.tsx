"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GAMES, getGame, randomGame, type Winner } from "@/lib/games";
import { shouldShowAd } from "@/lib/usePremium";
import { sfxWin, sfxDraw } from "@/lib/feedback";
import AdBanner from "@/components/AdBanner";
import RewardedAd from "@/components/RewardedAd";
import ShareResult from "@/components/ShareResult";

type Step = "loading" | "play" | "result";
type StakeType = "gage" | "argent";

export default function DuelPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [p1, setP1] = useState("Joueur 1");
  const [p2, setP2] = useState("Joueur 2");
  const [stakeType, setStakeType] = useState<StakeType>("gage");
  const [gage, setGage] = useState("");
  const [montant, setMontant] = useState("10");
  const [gameSlug, setGameSlug] = useState<string>("random");
  const [activeSlug, setActiveSlug] = useState<string>("reaction");
  const [winner, setWinner] = useState<Winner>("draw");
  const [format, setFormat] = useState<"single" | "bo3">("bo3");
  const [serie, setSerie] = useState<[number, number]>([0, 0]);
  const [showBanner, setShowBanner] = useState(false);
  const [canPickRevenge, setCanPickRevenge] = useState(false);

  const need = format === "bo3" ? 2 : 1; // manches à gagner pour remporter la série

  // Lit la config posée par l'accueil et lance le jeu directement
  useEffect(() => {
    let cfg: any = null;
    try {
      cfg = JSON.parse(sessionStorage.getItem("kiregal_duel_config") || "null");
      sessionStorage.removeItem("kiregal_duel_config");
    } catch {
      /* ignore */
    }
    if (!cfg) cfg = {}; // ouverture directe sans config → duel par défaut (aléatoire)
    setP1(cfg.p1 || "Joueur 1");
    setP2(cfg.p2 || "Joueur 2");
    setStakeType(cfg.stakeType || "gage");
    setGage(cfg.gage || "");
    setMontant(cfg.montant || "10");
    setFormat(cfg.format || "bo3");
    setGameSlug(cfg.game || "random");
    const g = !cfg.game || cfg.game === "random" ? randomGame() : getGame(cfg.game) || randomGame();
    setActiveSlug(g.slug);
    setSerie([0, 0]);
    setWinner("draw");
    setStep("play");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onResult = (w: Winner) => {
    setWinner(w);
    if (w === "draw") sfxDraw();
    else sfxWin();

    const ns: [number, number] =
      w === "draw" ? serie : [serie[0] + (w === 0 ? 1 : 0), serie[1] + (w === 1 ? 1 : 0)];
    setSerie(ns);

    const over = ns[0] >= need || ns[1] >= need;
    setShowBanner(over ? shouldShowAd() : false); // bannière seulement en fin de série
    setCanPickRevenge(false);
    setStep("result");
  };

  const replay = (slug?: string) => {
    const g = slug ? getGame(slug)! : gameSlug === "random" ? randomGame() : getGame(gameSlug)!;
    setActiveSlug(g.slug);
    setStep("play");
  };

  const newSeries = () => {
    setSerie([0, 0]);
    replay();
  };

  // ---- LOADING (lecture de la config) ----
  if (step === "loading") {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">Chargement…</div>
    );
  }

  // ---- PLAY ----
  if (step === "play") {
    const Game = getGame(activeSlug)!.Component;
    return <Game players={[p1, p2]} onResult={onResult} />;
  }

  // ---- RESULT ----
  if (step === "result") {
    const seriesOver = serie[0] >= need || serie[1] >= need;
    const roundDraw = winner === "draw";

    // ----- INTER-MANCHE (Best-of-3 en cours) -----
    if (!seriesOver) {
      const roundWinnerName = winner === 0 ? p1 : winner === 1 ? p2 : null;
      const mancheNo = serie[0] + serie[1] + (roundDraw ? 1 : 0);
      return (
        <div className="text-center py-12 flex flex-col items-center gap-6">
          <div className="text-5xl">{roundDraw ? "🤝" : "✅"}</div>
          <h1 className="text-2xl font-extrabold">
            {roundDraw ? "Égalité sur la manche" : `Manche pour ${roundWinnerName}`}
          </h1>

          <div className="flex items-center gap-4 text-xl font-bold">
            <span>{p1}</span>
            <span className="rounded-xl bg-card border border-white/15 px-4 py-2 text-2xl tabular-nums">
              {serie[0]} – {serie[1]}
            </span>
            <span>{p2}</span>
          </div>
          <p className="text-white/40 text-sm">Série en {need * 2 - 1} manches · premier à {need}</p>

          <button
            onClick={() => replay()}
            className="rounded-xl bg-accent px-8 py-4 text-lg font-bold"
          >
            {roundDraw ? "Rejouer la manche" : `Manche ${mancheNo + 1} →`}
          </button>
          <button onClick={() => router.push("/")} className="text-sm text-white/40 hover:text-white">
            Abandonner le duel
          </button>
        </div>
      );
    }

    // ----- FIN DE SÉRIE : verdict de l'enjeu -----
    const sWinner: 0 | 1 = serie[0] > serie[1] ? 0 : 1;
    const winnerName = sWinner === 0 ? p1 : p2;
    const loserName = sWinner === 0 ? p2 : p1;
    const verdict =
      stakeType === "gage"
        ? gage.trim()
          ? `${loserName} doit : ${gage.trim()}`
          : `${loserName} a perdu le gage.`
        : `${loserName} doit ${montant || "?"} € à ${winnerName}`;

    return (
      <div className="text-center py-10 flex flex-col items-center gap-6">
        <div className="text-6xl">🏆</div>
        <div>
          <p className="text-white/50">Vainqueur{format === "bo3" ? ` de la série (${serie[0]}–${serie[1]})` : ""}</p>
          <h1 className="text-3xl font-extrabold">{winnerName}</h1>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-amber-400/40 bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-amber-300/80">L&apos;enjeu</p>
          <p className="mt-2 text-lg font-semibold">{verdict}</p>
          {stakeType === "argent" && (
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
                    onClick={() => {
                      setSerie([0, 0]);
                      replay(g.slug);
                    }}
                    className="rounded-lg bg-card border border-white/10 py-2 text-xl"
                    title={g.title}
                  >
                    {g.emoji}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button onClick={newSeries} className="rounded-xl bg-accent px-6 py-3 font-bold">
              🔁 Revanche
            </button>
          )}

          {!canPickRevenge && (
            <RewardedAd
              reward="choisis le jeu de la revanche"
              onReward={() => setCanPickRevenge(true)}
            />
          )}

          <ShareResult
            text={`🍻 Kirégal — ${winnerName} a battu ${loserName} ${format === "bo3" ? `(${serie[0]}–${serie[1]})` : ""}. ${loserName} : ${stakeType === "gage" ? (gage.trim() || "gage perdu") : `doit ${montant}€`} 😏`}
          />

          <button
            onClick={() => router.push("/")}
            className="rounded-xl border border-white/20 px-6 py-3 font-semibold"
          >
            🏠 Nouveau pari
          </button>
        </div>

        {showBanner && <AdBanner label="Publicité" />}
      </div>
    );
  }

}
