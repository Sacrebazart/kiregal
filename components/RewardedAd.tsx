"use client";

import { useEffect, useState } from "react";
import { usePremium } from "@/lib/usePremium";

/**
 * Pub récompensée — format VOLONTAIRE, le plus rentable et le mieux accepté.
 * L'utilisateur choisit de regarder une pub en échange d'un bonus.
 * Ici simulé (compte à rebours) ; en prod = AdMob/Unity Rewarded.
 */
export default function RewardedAd({
  reward,
  onReward,
}: {
  reward: string;
  onReward: () => void;
}) {
  const { isPremium } = usePremium();
  const [state, setState] = useState<"idle" | "playing" | "done">("idle");
  const [left, setLeft] = useState(5);

  // Compte à rebours piloté par effet (onReward hors d'un updater de state)
  useEffect(() => {
    if (state !== "playing") return;
    if (left <= 0) {
      setState("done");
      onReward();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [state, left, onReward]);

  if (isPremium) return null;

  const watch = () => {
    setLeft(5);
    setState("playing");
  };

  if (state === "done") {
    return <p className="text-sm text-emerald-400 font-semibold">✅ Bonus débloqué !</p>;
  }

  if (state === "playing") {
    return (
      <div className="rounded-xl bg-black/40 px-5 py-3 text-center">
        <p className="text-white/70 text-sm">🎬 Pub… {left}s</p>
      </div>
    );
  }

  return (
    <button
      onClick={watch}
      className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold hover:bg-white/5"
    >
      🎬 Regarde une pub → {reward}
    </button>
  );
}
