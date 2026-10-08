"use client";

import { useEffect, useState } from "react";
import { formatRating, plural } from "@/lib/format";
import { getMyRating, submitRating, type RatingStats } from "@/lib/ratings";
import type { Place } from "@/lib/types";
import { useAuth } from "../auth/AuthProvider";
import { Stars } from "../ui/Stars";

const STAR = "M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z";

export function RatingSection({
  place,
  onRated,
}: {
  place: Place;
  /** Avisa al contenedor (lista y mapa) del nuevo promedio. */
  onRated?: (placeId: string, stats: RatingStats) => void;
}) {
  const { user, requestLogin } = useAuth();
  const [stats, setStats] = useState<RatingStats>({ avg: place.ratingAvg, count: place.ratingCount });
  const [myVote, setMine] = useState(0);
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // El contenedor monta un RatingSection por sitio (key={place.id}), así que el estado no se mezcla entre sitios.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getMyRating(place.id).then((v) => !cancelled && setMine(v));
    return () => {
      cancelled = true;
    };
  }, [place.id, user]);

  const mine = user ? myVote : 0;

  const vote = async (stars: number) => {
    setSaving(true);
    setMessage(null);
    try {
      const next = await submitRating(place.id, stars, mine, stats);
      setStats(next);
      setMessage(
        mine
          ? `Actualizamos tu puntuación a ${plural(stars, "estrella", "estrellas")}.`
          : `Gracias, guardamos tu puntuación de ${plural(stars, "estrella", "estrellas")}.`,
      );
      setMine(stars);
      onRated?.(place.id, next);
    } catch {
      setMessage("No pudimos guardar tu puntuación. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const onStar = (stars: number) => {
    if (user) void vote(stars);
    else requestLogin(() => void vote(stars));
  };

  const shown = hover || mine;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3.5">
        <div className="text-[40px] leading-none font-extrabold tabular-nums">
          {stats.count ? formatRating(stats.avg) : "—"}
        </div>
        <div>
          <Stars value={stats.avg} className="text-xl" />
          <small className="mt-0.5 block text-[13px] text-ink-2">
            {stats.count ? `${plural(stats.count, "voto", "votos")} de familias` : "Todavía nadie ha votado"}
          </small>
        </div>
      </div>
      <div className="rounded-2xl bg-chip px-4 py-3.5">
        <h3 className="text-sm font-extrabold">{mine ? "Tu puntuación" : "¿Qué tal te fue aquí?"}</h3>
        <p className="text-[13px] text-ink-2">
          {!user
            ? "Inicia sesión para puntuar este sitio."
            : mine
              ? "Puedes cambiarla cuando quieras."
              : "Toca las estrellas para puntuar."}
        </p>
        <div className="mt-2 flex gap-1" role="group" aria-label="Tu puntuación" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={saving}
              onMouseEnter={() => setHover(n)}
              onClick={() => onStar(n)}
              aria-label={`Puntuar con ${plural(n, "estrella", "estrellas")}`}
              aria-pressed={mine === n}
              className={`rounded-lg p-0.5 disabled:opacity-60 ${n <= shown ? "text-orange" : "text-line-strong"}`}
            >
              <svg viewBox="0 0 24 24" className="size-[34px]" fill="currentColor" aria-hidden="true">
                <path d={STAR} />
              </svg>
            </button>
          ))}
        </div>
        {message ? (
          <p className="mt-1.5 text-[13px] font-bold text-brand-ink" role="status">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
