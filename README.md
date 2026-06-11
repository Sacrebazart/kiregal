# ⚔️ Faceoff

Réglez vos paris en 10 secondes. Un mini-duel 1v1 entre potes, un enjeu (gage ou argent), un perdant.

## Concept
Le but : **on ne veut plus prendre de décision** — Faceoff tranche. Qui paie le resto ? Qui fait la vaisselle ? On parie 10 balles ? Choisissez un enjeu, affrontez-vous sur un mini-duel débile mais tendu, et que le meilleur gagne.

## Les duels
Réflexe · Tap Battle · Cible · Bras de fer · Calcul éclair · Pile-poil · Simon · Morpion · Chifoumi · Bonne Couleur.

Architecture *plug-in* : ajouter un duel = un fichier dans `games/<slug>/index.tsx` (composant recevant `DuelGameProps`) + une entrée dans `lib/games.ts`.

## Stack
Next.js 15 (export statique) · TypeScript · Tailwind. Hébergé sur GitHub Pages (déploiement auto via GitHub Actions).

## Dév local
```bash
npm install
npm run dev
```

## Build statique
```bash
npm run build   # génère ./out
```
