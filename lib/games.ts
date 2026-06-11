import type { ComponentType } from "react";

/**
 * Duel game registry — plug-in architecture.
 * Ajouter un duel = créer games/<slug>/index.tsx exportant un composant
 * qui reçoit DuelGameProps, puis ajouter une entrée ici.
 */
export type Winner = 0 | 1 | "draw";

export type DuelGameProps = {
  players: [string, string];
  /** Appelé par le jeu quand le duel est tranché. */
  onResult: (winner: Winner) => void;
};

export type GameMeta = {
  slug: string;
  title: string;
  tagline: string;
  emoji: string;
  accent: string;
};

export type GameModule = GameMeta & {
  Component: ComponentType<DuelGameProps>;
};

import ReactionDuel from "@/games/reaction";
import TapBattle from "@/games/tapbattle";
import Target from "@/games/target";
import Tug from "@/games/tug";
import MathDuel from "@/games/math";
import StopTimer from "@/games/stop";
import Simon from "@/games/simon";
import Morpion from "@/games/morpion";
import Chifoumi from "@/games/chifoumi";
import Couleur from "@/games/couleur";

export const GAMES: GameModule[] = [
  {
    slug: "reaction",
    title: "Réflexe",
    tagline: "Attendez le vert. Le premier qui tape gagne. Mais tapez trop tôt et c'est perdu.",
    emoji: "⚡",
    accent: "#22d3ee",
    Component: ReactionDuel,
  },
  {
    slug: "tapbattle",
    title: "Tap Battle",
    tagline: "5 secondes. Tapez comme un dingue. Le plus de taps gagne.",
    emoji: "👊",
    accent: "#f59e0b",
    Component: TapBattle,
  },
  {
    slug: "target",
    title: "Cible",
    tagline: "Une cible apparaît dans ta zone. Le premier à la toucher gagne.",
    emoji: "🎯",
    accent: "#10b981",
    Component: Target,
  },
  {
    slug: "tug",
    title: "Bras de fer",
    tagline: "Tape ta zone pour tirer la corde de ton côté. Le plus rapide l'emporte.",
    emoji: "🪢",
    accent: "#a855f7",
    Component: Tug,
  },
  {
    slug: "math",
    title: "Calcul éclair",
    tagline: "Premier à toucher la bonne réponse. Une erreur et c'est perdu.",
    emoji: "🧮",
    accent: "#ef4444",
    Component: MathDuel,
  },
  {
    slug: "stop",
    title: "Pile-poil",
    tagline: "Arrête le chrono au plus près de la cible, sans le voir. Le plus précis gagne.",
    emoji: "⏱️",
    accent: "#eab308",
    Component: StopTimer,
  },
  {
    slug: "simon",
    title: "Simon",
    tagline: "Répète la séquence de couleurs. Le premier qui se trompe perd.",
    emoji: "🧠",
    accent: "#ec4899",
    Component: Simon,
  },
  {
    slug: "morpion",
    title: "Morpion",
    tagline: "Le classique. Aligne 3 symboles avant l'autre. Chacun son tour.",
    emoji: "⭕",
    accent: "#06b6d4",
    Component: Morpion,
  },
  {
    slug: "chifoumi",
    title: "Chifoumi",
    tagline: "Pierre-feuille-ciseaux. Chacun choisit en secret, puis on révèle.",
    emoji: "✊",
    accent: "#8b5cf6",
    Component: Chifoumi,
  },
  {
    slug: "couleur",
    title: "Bonne Couleur",
    tagline: "Tape le carré de la couleur affichée, le plus vite. Une erreur = perdu.",
    emoji: "🎨",
    accent: "#f43f5e",
    Component: Couleur,
  },
];

export function getGame(slug: string): GameModule | undefined {
  return GAMES.find((g) => g.slug === slug);
}

export function randomGame(): GameModule {
  return GAMES[Math.floor(Math.random() * GAMES.length)];
}
