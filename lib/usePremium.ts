"use client";

import { useEffect, useState } from "react";

/**
 * État Premium léger (localStorage) — à remplacer par Stripe + Supabase.
 * Premium = zéro pub. La pub est l'argument de vente du Premium.
 */
export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setIsPremium(localStorage.getItem("faceoff_premium") === "1");
  }, []);

  const setPremium = (v: boolean) => {
    if (v) localStorage.setItem("faceoff_premium", "1");
    else localStorage.removeItem("faceoff_premium");
    setIsPremium(v);
  };

  return { isPremium, setPremium };
}

/**
 * Plafonnement de fréquence : une bannière tous les N duels seulement.
 * Jamais deux d'affilée, jamais pendant l'action.
 */
const FREQ = 3;
export function shouldShowAd(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem("faceoff_premium") === "1") return false;
  const n = Number(localStorage.getItem("faceoff_duel_count") || "0") + 1;
  localStorage.setItem("faceoff_duel_count", String(n));
  return n % FREQ === 0;
}
