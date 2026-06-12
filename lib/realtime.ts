"use client";

import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabaseConfig";

let client: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

export type RoomStatus = "connecting" | "connected" | "error" | "disabled";

export type RoomApi = {
  status: RoomStatus;
  /** Pseudos présents dans la room (présence). */
  players: string[];
  /** true si je suis le premier arrivé (l'hôte = autorité de jeu). */
  isHost: boolean;
  /** Diffuse un événement à toute la room. */
  send: (event: string, payload: unknown) => void;
  /** Abonne un handler à un type d'événement. Renvoie une fonction de désabonnement. */
  on: (event: string, handler: (payload: unknown) => void) => () => void;
};

/**
 * Rejoint une room (canal temps réel) identifiée par un code.
 * Présence pour savoir qui est là + broadcast pour synchroniser le jeu.
 */
export function useRoom(code: string, name: string): RoomApi {
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const handlers = useRef<Map<string, Set<(p: unknown) => void>>>(new Map());

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !code || !name) {
      setStatus("disabled");
      return;
    }

    const channel = supabase.channel(`kiregal:${code}`, {
      config: { presence: { key: name }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const names = Object.keys(state);
      setPlayers(names);
      // l'hôte = celui dont le pseudo est le plus "petit" (ordre stable et déterministe)
      setIsHost(names.length > 0 && [...names].sort()[0] === name);
    });

    channel.on("broadcast", { event: "msg" }, ({ payload }) => {
      const { event, data } = payload as { event: string; data: unknown };
      handlers.current.get(event)?.forEach((h) => h(data));
    });

    channel.subscribe(async (s) => {
      if (s === "SUBSCRIBED") {
        await channel.track({ name, at: Date.now() });
        setStatus("connected");
      } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") {
        setStatus("error");
      }
    });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [code, name]);

  const send = (event: string, data: unknown) => {
    channelRef.current?.send({ type: "broadcast", event: "msg", payload: { event, data } });
  };

  const on = (event: string, handler: (p: unknown) => void) => {
    if (!handlers.current.has(event)) handlers.current.set(event, new Set());
    handlers.current.get(event)!.add(handler);
    return () => handlers.current.get(event)?.delete(handler);
  };

  return { status, players, isHost, send, on };
}
