"use client";

import { TAGS, getCategory, type IconName } from "@kids-place/tokens";
import { useState } from "react";
import { PRICE_LABELS, formatDistance } from "@/lib/format";
import type { RatingStats } from "@/lib/ratings";
import type { Ad, Place } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { AdCard } from "./AdCard";
import { Gallery } from "./Gallery";
import { RatingSection } from "./RatingSection";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-extrabold tracking-[0.12em] text-ink-2 uppercase">{title}</h3>
      {children}
    </section>
  );
}

export function PlaceDetail({
  place,
  ad,
  distanceKm,
  onRated,
}: {
  place: Place;
  ad?: Ad;
  distanceKm?: number | null;
  onRated?: (placeId: string, stats: RatingStats) => void;
}) {
  const cat = getCategory(place.category);
  const [copied, setCopied] = useState(false);

  const info: [IconName, string, string][] = [
    ["pin", "Dirección", `${place.address}, ${place.cityName}`],
    ...(place.schedule ? [["clock", "Horario", place.schedule] as [IconName, string, string]] : []),
    ...(place.phone ? [["phone", "Teléfono", place.phone] as [IconName, string, string]] : []),
    ...(place.instagram ? [["instagram", "Instagram", place.instagram] as [IconName, string, string]] : []),
  ];

  const share = async () => {
    const url = `${window.location.origin}/sitios/${place.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: place.name, text: `${place.name} en Kids·Place`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <article className="flex flex-col gap-5">
      <Gallery place={place} />

      <header>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-2">
          <i className="size-[9px] rounded-full" style={{ background: cat.color }} />
          {cat.name}
          {place.priceRange != null ? <span className="ml-1">· {PRICE_LABELS[place.priceRange]}</span> : null}
        </span>
        <h2 className="mt-1.5 font-display text-4xl leading-[1.05] text-brand-ink">{place.name}</h2>
        <p className="text-ink-2">
          {place.zone}, {place.cityName}
          {distanceKm != null ? ` · a ${formatDistance(distanceKm)} de ti` : ""}
        </p>
      </header>

      <RatingSection place={place} onRated={onRated} />

      <Section title="Sobre el lugar">
        <p className="max-w-[62ch]">{place.description}</p>
      </Section>

      {place.tags.length ? (
        <Section title="Servicios">
          <ul className="flex flex-wrap gap-1.5">
            {place.tags.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-chip px-3 py-1 text-[13px] font-bold">
                <Icon name="check" className="size-[15px] text-brand-ink" />
                {TAGS[t]}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {ad ? <AdCard ad={ad} /> : null}

      <Section title="Información">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2.5 text-sm">
          {info.map(([icon, label, value]) => (
            <div key={label} className="contents">
              <dt className="flex items-start pt-0.5 text-brand-ink" title={label}>
                <Icon name={icon} />
              </dt>
              <dd className="min-w-0">
                <small className="block text-xs text-ink-2">{label}</small>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <div className="flex flex-wrap gap-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 rounded-full bg-orange px-4 py-2.5 text-sm font-extrabold text-on-orange"
        >
          <Icon name="navigate" /> Cómo llegar
        </a>
        <a
          href={`https://waze.com/ul?ll=${place.lat},${place.lng}&navigate=yes`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-line-strong px-4 py-2.5 text-sm font-extrabold hover:bg-chip"
        >
          Abrir en Waze
        </a>
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-line-strong px-4 py-2.5 text-sm font-extrabold hover:bg-chip"
        >
          <Icon name="share" /> {copied ? "Enlace copiado" : "Compartir"}
        </button>
      </div>
    </article>
  );
}
