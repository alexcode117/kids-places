"use client";

import { CATEGORIES, getCategory, type CategorySlug } from "@kids-place/tokens";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { distanceKm, plural } from "@/lib/format";
import type { RatingStats } from "@/lib/ratings";
import type { Ad, City, Place } from "@/lib/types";
import { AccountButton } from "./auth/AccountButton";
import { MapView } from "./map/MapView";
import { AdCard } from "./place/AdCard";
import { PlaceCard } from "./place/PlaceCard";
import { PlaceDetail } from "./place/PlaceDetail";
import { Icon } from "./ui/Icon";
import { Face, Logotype } from "./ui/Logo";

type Sort = "top" | "near";
type LatLng = { lat: number; lng: number };

const normalize = (s: string) =>
  s
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

/** Cada cuántos resultados aparece un anuncio en la lista. */
const AD_EVERY = 4;

export function Explorer({ places: initial, ads, cities, demo }: { places: Place[]; ads: Ad[]; cities: City[]; demo: boolean }) {
  const [places, setPlaces] = useState(initial);
  const [category, setCategory] = useState<CategorySlug | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("top");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  const city = cities.find((c) => c.isActive) ?? cities[0];
  const listAd = ads.find((a) => a.placement === "list");
  const detailAd = ads.find((a) => a.placement === "detail");

  const matchesQuery = useCallback(
    (p: Place) => {
      const q = normalize(query.trim());
      return !q || [p.name, p.zone, getCategory(p.category).name].some((s) => normalize(s).includes(q));
    },
    [query],
  );

  const searched = useMemo(() => places.filter(matchesQuery), [places, matchesQuery]);
  const visible = useMemo(() => {
    const list = category ? searched.filter((p) => p.category === category) : searched;
    const dist = (p: Place) => (userLocation ? distanceKm(userLocation, p) : 0);
    return [...list].sort((a, b) =>
      sort === "near" && userLocation
        ? dist(a) - dist(b)
        : b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount || a.name.localeCompare(b.name, "es"),
    );
  }, [searched, category, sort, userLocation]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of searched) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [searched]);

  const selected = selectedId ? places.find((p) => p.id === selectedId) ?? null : null;

  const select = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      const slug = id ? places.find((p) => p.id === id)?.slug : null;
      const url = new URL(window.location.href);
      if (slug) url.searchParams.set("sitio", slug);
      else url.searchParams.delete("sitio");
      window.history.replaceState(null, "", url);
    },
    [places],
  );

  // Abrir el sitio indicado en la URL (?sitio=slug), p. ej. al volver desde /sitios/[slug].
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("sitio");
    const p = slug ? initial.find((x) => x.slug === slug) : null;
    // La URL solo existe en el navegador, así que se lee tras montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (p) setSelectedId(p.id);
  }, [initial]);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !document.querySelector("dialog[open]") && select(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, select]);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocError("Tu navegador no permite compartir la ubicación.");
      return;
    }
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSort("near");
      },
      () => setLocError("No pudimos obtener tu ubicación. Revisa el permiso de ubicación del navegador."),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  const onRated = useCallback((id: string, stats: RatingStats) => {
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, ratingAvg: stats.avg, ratingCount: stats.count } : p)));
  }, []);

  const changeCategory = (slug: CategorySlug | null) => {
    setCategory(slug);
    if (selected && slug && selected.category !== slug) select(null);
  };

  const title = category ? getCategory(category).name : "Sitios kids-friendly";

  return (
    <div className="flex h-dvh flex-col max-[860px]:h-auto max-[860px]:min-h-dvh">
      <header className="flex items-center gap-4 border-b border-line bg-surface px-5 py-2.5 max-[860px]:flex-wrap max-[860px]:gap-2.5 max-[860px]:px-4">
        <Link href="/" aria-label="Kids·Place, inicio" className="shrink-0">
          <Logotype className="h-8 w-auto max-[860px]:h-7" />
        </Link>
        <label className="flex items-center gap-1.5 text-sm font-bold text-ink-2">
          <span className="max-[860px]:sr-only">Ciudad</span>
          <select
            defaultValue={city.slug}
            className="max-w-[9.5rem] rounded-[10px] border border-line bg-surface px-2 py-1.5 font-bold text-ink"
          >
            {cities.map((c) => (
              <option key={c.slug} value={c.slug} disabled={!c.isActive}>
                {c.name}
                {c.isActive ? "" : " (pronto)"}
              </option>
            ))}
          </select>
        </label>
        <div className="relative mx-auto max-w-[520px] flex-1 max-[860px]:order-3 max-[860px]:max-w-none max-[860px]:basis-full">
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-ink-2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca un parque, restaurante o zona…"
            aria-label="Buscar sitios"
            className="w-full rounded-full border-[1.5px] border-line bg-bg py-2 pr-3.5 pl-9.5 outline-none focus:border-teal"
          />
        </div>
        <div className="max-[860px]:ml-auto">
          <AccountButton />
        </div>
      </header>

      <nav aria-label="Categorías" className="flex gap-2 overflow-x-auto [scrollbar-width:thin] border-b border-line bg-surface px-5 py-2.5 max-[860px]:px-4">
        <CategoryChip label="Todos" count={searched.length} color="var(--teal)" icon="pin" active={!category} onClick={() => changeCategory(null)} />
        {CATEGORIES.map((c) => (
          <CategoryChip
            key={c.slug}
            label={c.name}
            count={counts.get(c.slug) ?? 0}
            color={c.color}
            icon={c.icon}
            active={category === c.slug}
            onClick={() => changeCategory(c.slug)}
          />
        ))}
      </nav>

      <main className="grid min-h-0 flex-1 grid-cols-[420px_1fr] max-[860px]:flex max-[860px]:flex-col">
        <section className="min-w-0 overflow-y-auto border-r border-line bg-surface max-[860px]:overflow-visible max-[860px]:border-0">
          {selected ? (
            <div className="pb-7 max-[860px]:fixed max-[860px]:inset-0 max-[860px]:z-50 max-[860px]:overflow-y-auto max-[860px]:bg-surface">
              <div className="sticky top-0 z-10 flex items-center justify-between bg-surface/95 px-3.5 py-3 backdrop-blur">
                <button
                  type="button"
                  onClick={() => select(null)}
                  className="inline-flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 font-extrabold text-brand-ink hover:bg-chip"
                >
                  <Icon name="back" /> Volver a la lista
                </button>
              </div>
              <div className="px-4">
                <PlaceDetail
                  key={selected.id}
                  place={selected}
                  ad={detailAd}
                  distanceKm={userLocation ? distanceKm(userLocation, selected) : null}
                  onRated={onRated}
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-end justify-between gap-3 px-5 pt-4.5 pb-2 max-[860px]:px-4">
                <div>
                  <h1 className="font-display text-[28px] leading-tight text-brand-ink">{title}</h1>
                  <p className="text-[13.5px] text-ink-2">
                    {plural(visible.length, "sitio", "sitios")} en {city.name}
                  </p>
                </div>
                <select
                  value={sort}
                  onChange={(e) => {
                    const v = e.target.value as Sort;
                    if (v === "near" && !userLocation) locate();
                    else setSort(v);
                  }}
                  aria-label="Ordenar"
                  className="rounded-[10px] border border-line bg-surface px-2 py-1.5 text-[13px] font-bold"
                >
                  <option value="top">Mejor puntuados</option>
                  <option value="near">Más cercanos</option>
                </select>
              </div>
              {locError ? <p className="mx-5 mb-2 rounded-xl bg-chip px-3 py-2 text-[13px] text-ink-2">{locError}</p> : null}
              {visible.length ? (
                <ul className="flex flex-col gap-1 px-2.5 pt-1.5 pb-6">
                  {visible.map((p, i) => (
                    <li key={p.id} className="contents">
                      <PlaceCard
                        place={p}
                        distanceKm={userLocation ? distanceKm(userLocation, p) : null}
                        highlighted={hoverId === p.id}
                        onSelect={select}
                        onHover={setHoverId}
                      />
                      {listAd && (i + 1) % AD_EVERY === 0 && i < visible.length - 1 ? (
                        <div className="my-1.5">
                          <AdCard ad={listAd} />
                        </div>
                      ) : null}
                    </li>
                  ))}
                  {listAd && visible.length < AD_EVERY ? (
                    <li className="my-1.5">
                      <AdCard ad={listAd} />
                    </li>
                  ) : null}
                </ul>
              ) : (
                <div className="px-6 py-10 text-center text-ink-2">
                  <Face className="mx-auto w-24" />
                  <h2 className="mt-2 mb-1 font-display text-2xl text-brand-ink">Aún no hay sitios aquí</h2>
                  <p>Estamos cargando más lugares. Prueba con otra categoría o borra la búsqueda.</p>
                </div>
              )}
            </div>
          )}
        </section>

        <section aria-label="Mapa de sitios" className="relative min-w-0 max-[860px]:order-first max-[860px]:h-[360px] max-[860px]:flex-none">
          <MapView
            places={visible}
            center={city}
            selectedId={selectedId}
            hoverId={hoverId}
            userLocation={userLocation}
            onSelect={select}
            onHover={setHoverId}
          />
          <button
            type="button"
            onClick={locate}
            className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-2 text-sm font-extrabold shadow-soft"
          >
            <Icon name="locate" /> Cerca de mí
          </button>
          {demo ? (
            <p className="absolute top-3 left-3 rounded-full bg-surface/95 px-3 py-1 text-xs font-bold text-ink-2 shadow-soft max-[520px]:top-auto max-[520px]:bottom-9">
              Modo demostración · sin base de datos
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function CategoryChip({
  label,
  count,
  color,
  icon,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color: string;
  icon: Parameters<typeof Icon>[0]["name"];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] py-1.5 pr-3 pl-1.5 text-[13.5px] font-bold whitespace-nowrap ${
        active ? "border-blue bg-blue text-white" : "border-line bg-surface hover:border-line-strong"
      }`}
    >
      <span className="grid size-6 place-items-center rounded-full text-white" style={{ background: color }}>
        <Icon name={icon} className="size-3.5" strokeWidth={2.4} />
      </span>
      {label}
      <span className={`font-semibold tabular-nums ${active ? "text-[#d5e6ea]" : "text-ink-2"}`}>{count}</span>
    </button>
  );
}
