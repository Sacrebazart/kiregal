"use client";

import { usePremium } from "@/lib/usePremium";

/**
 * Bannière non-invasive. Placée UNIQUEMENT sur les écrans "temps mort"
 * (verdict, accueil), jamais pendant un duel.
 * Rend `null` pour les membres Premium.
 *
 * En prod : remplacer le placeholder par <ins class="adsbygoogle" .../>
 * (Google AdSense) ou un composant AdMob.
 */
export default function AdBanner({ label = "Publicité" }: { label?: string }) {
  const { isPremium } = usePremium();
  if (isPremium) return null;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-widest text-white/30">{label}</p>
        <p className="text-sm text-white/40 mt-1">Emplacement pub — discret, non bloquant</p>
      </div>
      <p className="text-center text-[11px] text-white/30 mt-1">
        Sans pub avec Premium ✨
      </p>
    </div>
  );
}
