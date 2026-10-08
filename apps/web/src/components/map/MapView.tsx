"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { mapColors } from "@kids-place/tokens";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import type { Place } from "@/lib/types";
import { meHtml, pinHtml } from "./pin";

/** OpenFreeMap: gratis y sin clave. Se puede cambiar por MapTiler con NEXT_PUBLIC_MAP_STYLE_URL. */
const STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/positron";
const DARK_QUERY = "(prefers-color-scheme: dark)";

type LatLng = { lat: number; lng: number };

/** Lleva el mapa base a la paleta de Kids·Place (agua, parques, calles y etiquetas). */
function applyBrandColors(map: MapLibreMap) {
  const c = mapColors[window.matchMedia(DARK_QUERY).matches ? "dark" : "light"];
  const set = (id: string, prop: Parameters<MapLibreMap["setPaintProperty"]>[1], value: string) => {
    try {
      map.setPaintProperty(id, prop, value);
    } catch {}
  };
  for (const layer of map.getStyle().layers ?? []) {
    const id = layer.id.toLowerCase();
    if (layer.type === "background") set(layer.id, "background-color", c.land);
    else if (layer.type === "fill") {
      if (/water|ocean|lake|river/.test(id)) set(layer.id, "fill-color", c.water);
      else if (/park|wood|forest|grass|green|landcover|national|pitch|garden/.test(id)) set(layer.id, "fill-color", c.park);
      else if (/building/.test(id)) {
        set(layer.id, "fill-color", c.building);
        set(layer.id, "fill-outline-color", c.building);
      } else if (/aeroway|runway|taxiway/.test(id)) set(layer.id, "fill-color", c.road);
      else if (/landuse|residential|land/.test(id)) set(layer.id, "fill-color", c.land);
    } else if (layer.type === "line") {
      if (/water|river|stream|canal/.test(id)) set(layer.id, "line-color", c.water);
      else if (/aeroway|runway|taxiway/.test(id)) set(layer.id, "line-color", c.road);
      else if (/rail/.test(id)) set(layer.id, "line-color", c.rail);
      else if (/casing/.test(id)) set(layer.id, "line-color", c.land);
      else if (/motorway|trunk|primary|major/.test(id)) set(layer.id, "line-color", c.roadMajor);
      else if (/road|street|highway|transport|bridge|tunnel|minor|service|secondary|tertiary/.test(id)) set(layer.id, "line-color", c.road);
    } else if (layer.type === "symbol" && layer.layout && "text-field" in layer.layout) {
      set(layer.id, "text-color", c.label);
      set(layer.id, "text-halo-color", c.land);
    }
  }
}

export function MapView({
  places,
  center,
  selectedId,
  hoverId,
  userLocation,
  onSelect,
  onHover,
}: {
  places: Place[];
  center: LatLng & { zoom: number };
  selectedId: string | null;
  hoverId: string | null;
  userLocation: LatLng | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const libRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markers = useRef(new Map<string, { marker: Marker; el: HTMLButtonElement }>());
  const meMarker = useRef<Marker | null>(null);
  const handlers = useRef({ onSelect, onHover });
  const initialCenter = useRef(center);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    handlers.current = { onSelect, onHover };
  }, [onSelect, onHover]);

  // Crear el mapa una sola vez.
  useEffect(() => {
    let cancelled = false;
    const markerMap = markers.current;
    const mq = window.matchMedia(DARK_QUERY);
    const onScheme = () => mapRef.current && applyBrandColors(mapRef.current);

    (async () => {
      try {
        const lib = await import("maplibre-gl");
        if (cancelled || !container.current) return;
        lib.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
        libRef.current = lib;
        const c = initialCenter.current;
        const map = new lib.Map({
          container: container.current,
          style: STYLE_URL,
          center: [c.lng, c.lat],
          zoom: c.zoom,
          minZoom: 5,
          maxZoom: 18,
          attributionControl: { compact: true },
          dragRotate: false,
          pitchWithRotate: false,
        });
        map.touchZoomRotate.disableRotation();
        map.addControl(new lib.NavigationControl({ showCompass: false }), "bottom-right");
        map.on("style.load", () => applyBrandColors(map));
        map.on("error", (e) => console.warn("Mapa:", e.error?.message));
        mapRef.current = map;
        mq.addEventListener("change", onScheme);
        setReady(true);
      } catch (err) {
        console.error(err);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      mq.removeEventListener("change", onScheme);
      mapRef.current?.remove();
      mapRef.current = null;
      markerMap.clear();
      meMarker.current = null;
    };
  }, []);

  // Sincronizar pines con los sitios visibles.
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!ready || !map || !lib) return;
    const visible = new Set(places.map((p) => p.id));
    for (const [id, { marker }] of markers.current) {
      if (!visible.has(id)) {
        marker.remove();
        markers.current.delete(id);
      }
    }
    for (const p of places) {
      if (markers.current.has(p.id)) continue;
      const el = document.createElement("button");
      el.type = "button";
      el.className = "kp-marker";
      el.setAttribute("aria-label", p.name);
      el.innerHTML = pinHtml(p.category, p.name);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        handlers.current.onSelect(p.id);
      });
      el.addEventListener("mouseenter", () => handlers.current.onHover(p.id));
      el.addEventListener("mouseleave", () => handlers.current.onHover(null));
      const marker = new lib.Marker({ element: el, anchor: "bottom" }).setLngLat([p.lng, p.lat]).addTo(map);
      markers.current.set(p.id, { marker, el });
    }
  }, [ready, places]);

  // Encuadrar todos los sitios al cargar.
  const fitted = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!ready || !map || !lib || fitted.current || places.length < 2) return;
    fitted.current = true;
    const bounds = new lib.LngLatBounds();
    for (const p of places) bounds.extend([p.lng, p.lat]);
    map.fitBounds(bounds, { padding: 70, maxZoom: 14, duration: 0 });
  }, [ready, places]);

  // Estados de selección y hover.
  useEffect(() => {
    for (const [id, { el }] of markers.current) {
      el.classList.toggle("is-active", id === selectedId);
      el.classList.toggle("is-hover", id === hoverId);
      el.style.setProperty("z-index", id === selectedId ? "3" : id === hoverId ? "2" : "");
    }
  }, [selectedId, hoverId, places, ready]);

  // Centrar el sitio seleccionado.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !selectedId) return;
    const p = places.find((x) => x.id === selectedId);
    if (!p) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 14), essential: true, duration: reduce ? 0 : 900 });
  }, [ready, selectedId, places]);

  // Ubicación del usuario.
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!ready || !map || !lib || !userLocation) return;
    if (!meMarker.current) {
      const el = document.createElement("div");
      el.className = "kp-me";
      el.innerHTML = meHtml();
      el.setAttribute("aria-label", "Tu ubicación");
      meMarker.current = new lib.Marker({ element: el }).setLngLat([userLocation.lng, userLocation.lat]).addTo(map);
    } else {
      meMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
    }
    map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: Math.max(map.getZoom(), 13), essential: true });
  }, [ready, userLocation]);

  return (
    <div className="absolute inset-0">
      <div ref={container} className="size-full" />
      {failed ? (
        <div className="absolute inset-0 grid place-items-center bg-chip p-6 text-center text-ink-2">
          No pudimos cargar el mapa. Revisa tu conexión y recarga la página.
        </div>
      ) : null}
    </div>
  );
}
