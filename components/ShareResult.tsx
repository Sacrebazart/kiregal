"use client";

import { useState } from "react";

const APP_URL = "https://sacrebazart.github.io/kiregal/";

/**
 * Partage du résultat. Sur mobile : ouvre la feuille de partage native
 * (Instagram, WhatsApp, X, Messages…). Sur desktop / navigateurs sans
 * Web Share : liens directs + copie dans le presse-papier.
 */
export default function ShareResult({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const full = `${text} ${APP_URL}`;

  const share = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: "Kirégal", text, url: APP_URL });
        return;
      } catch {
        /* annulé ou indisponible → on bascule sur les liens */
      }
    }
    setOpen((o) => !o);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(full)}` },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(APP_URL)}`,
    },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}` },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <button
        onClick={share}
        className="w-full rounded-xl bg-accent2 px-6 py-3 font-bold text-black hover:opacity-90"
      >
        📲 Partager mon résultat
      </button>

      {open && (
        <div className="w-full flex flex-col gap-2">
          <div className="flex gap-2">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-card border border-white/15 px-3 py-2 text-center text-sm font-semibold hover:border-white/30"
              >
                {l.label}
              </a>
            ))}
          </div>
          <button
            onClick={copy}
            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            {copied ? "✅ Copié !" : "🔗 Copier le texte + lien"}
          </button>
        </div>
      )}
    </div>
  );
}
