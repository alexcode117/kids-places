import type { Ad, City, Place } from "@/lib/types";
import dataset from "./dataset.json";

/**
 * Datos del modo demostración (sin Supabase configurado).
 * Los sitios vienen del dataset real (generado con `npm run importar`);
 * los anuncios son ficticios.
 */
export const SAMPLE_PLACES = dataset as Place[];

export const SAMPLE_ADS: Ad[] = [
  {
    id: "demo-ad-list",
    advertiser: "Juguetería Mundo Mágico",
    title: "Juegos educativos para todas las edades",
    body: "Anuncio de ejemplo.",
    imageUrl: null,
    linkUrl: null,
    placement: "list",
  },
  {
    id: "demo-ad-detail",
    advertiser: "Heladería Polito",
    title: "Helados artesanales sin colorantes",
    body: "Anuncio de ejemplo.",
    imageUrl: null,
    linkUrl: null,
    placement: "detail",
  },
];

/** Debe coincidir con supabase/seed.sql. */
export const SAMPLE_CITIES: City[] = [
  { slug: "barquisimeto", name: "Barquisimeto", lat: 10.065, lng: -69.32, zoom: 12.5, isActive: true },
  { slug: "caracas", name: "Caracas", lat: 10.488, lng: -66.8792, zoom: 12.5, isActive: false },
  { slug: "valencia", name: "Valencia", lat: 10.162, lng: -68.0077, zoom: 12, isActive: false },
  { slug: "maracaibo", name: "Maracaibo", lat: 10.6427, lng: -71.6125, zoom: 12, isActive: false },
  { slug: "lecheria", name: "Lechería", lat: 10.188, lng: -64.69, zoom: 13, isActive: false },
  { slug: "margarita", name: "Margarita", lat: 10.997, lng: -63.85, zoom: 11, isActive: false },
];
