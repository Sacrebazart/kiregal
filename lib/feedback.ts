"use client";

/**
 * Retour sensoriel : sons (Web Audio, zéro fichier) + vibration mobile.
 * Tout est SSR-safe et silencieux si l'API n'existe pas.
 */

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "square", vol = 0.15) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, a.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  osc.connect(gain);
  gain.connect(a.destination);
  osc.start(a.currentTime + start);
  osc.stop(a.currentTime + start + dur);
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}

/** Bip court — ex. décompte 3-2-1. */
export function sfxTick() {
  tone(660, 0, 0.08, "square", 0.12);
  vibrate(15);
}

/** Signal "GO !" / cible verte — vif et aigu. */
export function sfxGo() {
  tone(880, 0, 0.12, "sawtooth", 0.18);
  vibrate(40);
}

/** Victoire — petit arpège ascendant + vibration franche. */
export function sfxWin() {
  tone(523, 0, 0.12, "square", 0.16);
  tone(659, 0.1, 0.12, "square", 0.16);
  tone(784, 0.2, 0.18, "square", 0.16);
  vibrate([60, 40, 120]);
}

/** Défaite / erreur — note grave descendante. */
export function sfxLose() {
  tone(300, 0, 0.18, "sawtooth", 0.14);
  tone(180, 0.14, 0.22, "sawtooth", 0.14);
  vibrate(200);
}

/** Égalité — note neutre. */
export function sfxDraw() {
  tone(440, 0, 0.15, "triangle", 0.14);
  vibrate([40, 40, 40]);
}
