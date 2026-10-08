"use client";

import { CATEGORIES, getCategory, type CategorySlug, type IconName } from "@kids-place/tokens";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { distanceKm, plural } from "@/lib/format";
import type { RatingStats } from "@/lib/ratings";
import type { Ad, City, Place } from "@/lib/types";
import { useIsMobile } from "@/lib/useIsMobile";
import { AccountButton } from "./auth/AccountButton";
import { MapView } from "./map/MapView";
import { AdCard } from "./place/AdCard";
import { PlaceCard } from "./place/PlaceCard";
import { PlaceDetail } from "./place/PlaceDetail";
import { Icon } from "./ui/Icon";
import { Face, Logotype } from "./ui/Logo";

type Sort = "top" | "near";
type LatLng = { lat: number; lng: number };
/** En celular se ve una cosa a la vez: el mapa o la lista. */
type MobileView = "map" | "list";

const normalize = (s: string) =>
  s
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

/** Cada cuántos resultados aparece un anuncio en la lista. */
const AD_EVERY = 4;

/** Marca las entradas del historial que abrimos al mostrar un detalle, para que "atrás" lo cierre. */
const DETAIL_STATE = "kpDetail";

export function Explorer({ places: initial, ads, cities, demo }: { places: Place[]; ads: Ad[]; cities: City[]; demo: boolean }) {
  const isMobile = useIsMobile();
  const [places, setPlaces] = useState(initial);
  const [category, setCategory] = useState<CategorySlug | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("top");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("map");
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

  const byId = useCallback((id: string | null) => (id ? places.find((p) => p.id === id) ?? null : null), [places]);
  const selected = byId(selectedId);
  const preview = byId(previewId);
  const distanceTo = (p: Place) => (userLocation ? distanceKm(userLocation, p) : null);

  // --- Detalle y URL (?sitio=slug) ---------------------------------------------

  const openDetail = useCallback(
    (id: string) => {
      const slug = places.find((p) => p.id === id)?.slug;
      if (!slug) return;
      const url = new URL(window.location.href);
      url.searchParams.set("sitio", slug);
      // Una sola entrada de historial por detalle abierto: cambiar de sitio la reemplaza.
      if (window.history.state?.[DETAIL_STATE]) window.history.replaceState({ [DETAIL_STATE]: true }, "", url);
      else window.history.pushState({ [DETAIL_STATE]: true }, "", url);
      setSelectedId(id);
    },
    [places],
  );

  const closeDetail = useCallback(() => {
    if (window.history.state?.[DETAIL_STATE]) {
      window.history.back(); // el evento popstate limpia la selección
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("sitio");
    window.history.replaceState(null, "", url);
    setSelectedId(null);
  }, []);

  // Sincronizar con la URL al cargar (enlace compartido) y con el botón "atrás".
  useEffect(() => {
    const syncFromUrl = () => {
      const slug = new URLSearchParams(window.location.search).get("sitio");
      setSelectedId(slug ? (initial.find((p) => p.slug === slug)?.id ?? null) : null);
    };
    // La URL solo existe en el navegador, así que se lee tras montar.
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [initial]);

  useEffect(() => {
    if (!selectedId && !previewId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("dialog[open]")) return;
      if (selectedId) closeDetail();
      else setPreviewId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, previewId, closeDetail]);

  // En celular, tocar un pin muestra una vista previa; en escritorio abre el detalle.
  const onMarkerSelect = useCallback(
    (id: string) => {
      if (isMobile) setPreviewId(id);
      else openDetail(id);
    },
    [isMobile, openDetail],
  );

  // --- Ubicación y puntuaciones ------------------------------------------------

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
    if (preview && slug && preview.category !== slug) setPreviewId(null);
    if (selected && slug && selected.category !== slug && !isMobile) closeDetail();
  };

  // --- Vista --------------------------------------------------------------------

  const title = category ? getCategory(category).name : "Sitios kids-friendly";
  const detail = selected ? (
    <PlaceDetail key={selected.id} place={selected} ad={detailAd} distanceKm={distanceTo(selected)} onRated={onRated} />
  ) : null;

  const list = (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2 px-5 pt-4.5 pb-2 mobile:px-4">
        <div>
          <h1 className="font-display text-[28px] leading-tight text-brand-ink">{title}</h1>
          <p className="flex items-center gap-1 text-[13.5px] whitespace-nowrap text-ink-2">
            {plural(visible.length, "sitio", "sitios")} en <span className="mobile:hidden">{city.name}</span>
            <span className="desktop:hidden">
              <CitySelect cities={cities} value={city.slug} />
            </span>
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
          className="rounded-[10px] border border-line bg-surface px-2 py-1.5 text-[13px] font-bold mobile:text-base"
        >
          <option value="top">Mejor puntuados</option>
          <option value="near">Más cercanos</option>
        </select>
      </div>
      {locError ? <p className="mx-5 mb-2 rounded-xl bg-chip px-3 py-2 text-[13px] text-ink-2 mobile:mx-4">{locError}</p> : null}
      {visible.length ? (
        <ul className="flex flex-col gap-1 px-2.5 pt-1.5 pb-6 mobile:px-1.5 mobile:pb-24">
          {visible.map((p, i) => (
            <li key={p.id} className="contents">
              <PlaceCard place={p} distanceKm={distanceTo(p)} highlighted={hoverId === p.id} onSelect={openDetail} onHover={setHoverId} />
              {listAd && (i + 1) % AD_EVERY === 0 && i < visible.length - 1 ? (
                <div className="my-1.5 px-1">
                  <AdCard ad={listAd} />
                </div>
              ) : null}
            </li>
          ))}
          {listAd && visible.length < AD_EVERY ? (
            <li className="my-1.5 px-1">
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
  );

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b border-line bg-surface px-5 pt-[calc(0.625rem+env(safe-area-inset-top))] pb-2.5 mobile:gap-x-2.5 mobile:px-4">
        <Link href="/" aria-label="Kids·Place, inicio" className="shrink-0">
          <Logotype className="h-8 w-auto mobile:h-7" />
        </Link>
        <div className="mobile:hidden">
          <CitySelect cities={cities} value={city.slug} withLabel />
        </div>
        <div className="relative mx-auto max-w-[520px] flex-1 mobile:order-3 mobile:max-w-none mobile:basis-full">
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-ink-2" />
          <input
            type="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca un parque, curso o zona…"
            aria-label="Buscar sitios"
            className="w-full rounded-full border-[1.5px] border-line bg-bg py-2 pr-3.5 pl-9.5 outline-none focus:border-teal mobile:py-2.5 mobile:text-base"
          />
        </div>
        <div className="mobile:ml-auto">
          <AccountButton />
        </div>
      </header>

      <nav
        aria-label="Categorías"
        className="flex gap-2 overflow-x-auto border-b border-line bg-surface px-5 py-2.5 [scrollbar-width:thin] mobile:px-4 mobile:[scrollbar-width:none]"
      >
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

      <main className="relative grid min-h-0 flex-1 grid-cols-[420px_1fr] mobile:block">
        {/* Escritorio: panel izquierdo con lista o detalle. Celular: la lista ocupa toda la pantalla. */}
        <section
          aria-label="Lista de sitios"
          className={`min-w-0 overflow-y-auto overscroll-contain border-r border-line bg-surface mobile:absolute mobile:inset-0 mobile:z-10 mobile:border-0 ${
            mobileView === "list" ? "" : "mobile:hidden"
          }`}
        >
          {selected && !isMobile ? (
            <div className="pb-7">
              <div className="sticky top-0 z-10 flex items-center bg-surface/95 px-3.5 py-3 backdrop-blur">
                <BackButton onClick={closeDetail} />
              </div>
              <div className="px-4">{detail}</div>
            </div>
          ) : (
            list
          )}
        </section>

        <section aria-label="Mapa de sitios" className="relative min-w-0 mobile:absolute mobile:inset-0">
          <MapView
            places={visible}
            center={city}
            selectedId={selectedId ?? previewId}
            hoverId={hoverId}
            userLocation={userLocation}
            bottomInset={isMobile && preview ? 170 : 0}
            onSelect={onMarkerSelect}
            onHover={setHoverId}
            onBackgroundClick={() => setPreviewId(null)}
          />
          <button
            type="button"
            onClick={locate}
            aria-label="Sitios cerca de mí"
            className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-2 text-sm font-extrabold shadow-soft mobile:size-11 mobile:justify-center mobile:p-0"
          >
            <Icon name="locate" className="size-[18px] mobile:size-5" />
            <span className="mobile:hidden">Cerca de mí</span>
          </button>
          {demo ? (
            <p className="absolute top-3 left-3 rounded-full bg-surface/95 px-3 py-1 text-xs font-bold text-ink-2 shadow-soft">
              Modo demostración
            </p>
          ) : null}
          {locError && mobileView === "map" ? (
            <p className="absolute top-16 right-3 left-3 rounded-xl bg-surface px-3 py-2 text-[13px] text-ink-2 shadow-soft desktop:hidden">
              {locError}
            </p>
          ) : null}

          {/* Celular: vista previa del pin tocado */}
          {preview && isMobile && mobileView === "map" ? (
            <div className="absolute inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 rounded-2xl bg-surface p-1 shadow-soft">
              <PlaceCard place={preview} distanceKm={distanceTo(preview)} highlighted={false} onSelect={openDetail} onHover={() => {}} />
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                aria-label="Cerrar vista previa"
                className="absolute top-1 right-1 grid size-10 place-items-center rounded-full text-ink-2"
              >
                <Icon name="close" />
              </button>
            </div>
          ) : null}
        </section>

        {/* Celular: alternar entre mapa y lista */}
        <button
          type="button"
          onClick={() => setMobileView(mobileView === "map" ? "list" : "map")}
          className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-blue px-5 py-3 font-extrabold text-white shadow-soft desktop:hidden"
        >
          <Icon name={mobileView === "map" ? "list" : "map"} />
          {mobileView === "map" ? `Ver lista · ${visible.length}` : "Ver mapa"}
        </button>
      </main>

      {/* Celular: detalle a pantalla completa; el botón "atrás" del teléfono lo cierra */}
      {selected && isMobile ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.name}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-surface pt-[env(safe-area-inset-top)]"
        >
          <div className="sticky top-0 z-10 flex items-center bg-surface/95 px-2 py-2 backdrop-blur">
            <BackButton onClick={closeDetail} label="Volver" />
          </div>
          <div className="px-4">{detail}</div>
        </div>
      ) : null}
    </div>
  );
}

function CitySelect({ cities, value, withLabel = false }: { cities: City[]; value: string; withLabel?: boolean }) {
  // Por ahora solo hay una ciudad activa; las demás se muestran como "pronto".
  return (
    <label className="flex items-center gap-1.5 text-sm font-bold text-ink-2">
      <span className={withLabel ? "" : "sr-only"}>Ciudad</span>
      <select
        defaultValue={value}
        className="max-w-[9.5rem] rounded-[10px] border border-line bg-surface px-2 py-1.5 font-bold text-ink mobile:py-1 mobile:text-base"
      >
        {cities.map((c) => (
          <option key={c.slug} value={c.slug} disabled={!c.isActive}>
            {c.name}
            {c.isActive ? "" : " (pronto)"}
          </option>
        ))}
      </select>
    </label>
  );
}

function BackButton({ onClick, label = "Volver a la lista" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] px-2 py-1.5 font-extrabold text-brand-ink hover:bg-chip"
    >
      <Icon name="back" /> {label}
    </button>
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
  icon: IconName;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] py-1.5 pr-3 pl-1.5 text-[13.5px] font-bold whitespace-nowrap mobile:min-h-10 ${
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
