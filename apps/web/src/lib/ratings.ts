"use client";

import { getBrowserClient } from "./supabase/client";

export interface RatingStats {
  avg: number;
  count: number;
}

const DEMO_KEY = "kp-demo-votes";

function readDemoVotes(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Puntuación que el usuario actual le dio a un sitio, o 0 si no ha votado. */
export async function getMyRating(placeId: string): Promise<number> {
  const supabase = getBrowserClient();
  if (!supabase) return readDemoVotes()[placeId] ?? 0;
  const { data } = await supabase.from("ratings").select("stars").eq("place_id", placeId).maybeSingle();
  return data?.stars ?? 0;
}

/**
 * Guarda (o cambia) el voto del usuario y devuelve el promedio actualizado.
 * La base de datos garantiza un voto por usuario y sitio.
 */
export async function submitRating(placeId: string, stars: number, previous: number, current: RatingStats): Promise<RatingStats> {
  const supabase = getBrowserClient();
  if (!supabase) {
    const votes = readDemoVotes();
    votes[placeId] = stars;
    try {
      localStorage.setItem(DEMO_KEY, JSON.stringify(votes));
    } catch {}
    const sum = current.avg * current.count + stars - previous;
    const count = current.count + (previous ? 0 : 1);
    return { avg: sum / count, count };
  }

  const { error } = await supabase.from("ratings").upsert({ place_id: placeId, stars }, { onConflict: "place_id,user_id" });
  if (error) throw new Error(error.message);
  const { data } = await supabase.from("places").select("rating_avg, rating_count").eq("id", placeId).single();
  return data ? { avg: Number(data.rating_avg), count: data.rating_count } : current;
}
