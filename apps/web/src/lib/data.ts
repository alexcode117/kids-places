import "server-only";

import { isCategorySlug, isTagSlug, type TagSlug } from "@kids-place/tokens";
import { cacheLife, cacheTag } from "next/cache";
import { SAMPLE_ADS, SAMPLE_CITIES, SAMPLE_PLACES } from "@/data/sample";
import { isSupabaseConfigured, publicPhotoUrl } from "./supabase/config";
import { createPublicClient } from "./supabase/server";
import type { Ad, City, Place } from "./types";

interface PlaceCardRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  city: string;
  city_name: string;
  zone: string;
  address: string;
  lat: number;
  lng: number;
  location_verified: boolean;
  phone: string | null;
  instagram: string | null;
  website: string | null;
  schedule: string | null;
  price_range: number | null;
  rating_avg: number | string;
  rating_count: number;
  is_featured: boolean;
  tags: string[];
  photos: { path: string; caption: string | null }[];
}

function toPlace(row: PlaceCardRow): Place | null {
  if (!isCategorySlug(row.category)) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    city: row.city,
    cityName: row.city_name,
    zone: row.zone,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    locationVerified: row.location_verified,
    phone: row.phone,
    instagram: row.instagram,
    website: row.website,
    schedule: row.schedule,
    priceRange: row.price_range,
    ratingAvg: Number(row.rating_avg),
    ratingCount: row.rating_count,
    isFeatured: row.is_featured,
    tags: row.tags.filter(isTagSlug) as TagSlug[],
    photos: row.photos.map((p) => ({ url: publicPhotoUrl(p.path), caption: p.caption })),
  };
}

/** Todos los sitios publicados de una ciudad. */
export async function getPlaces(city: string): Promise<Place[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("places");

  if (!isSupabaseConfigured) return SAMPLE_PLACES.filter((p) => p.city === city);

  const { data, error } = await createPublicClient()
    .from("place_cards")
    .select("*")
    .eq("city", city)
    .order("name");
  if (error) throw new Error(`No se pudieron cargar los sitios: ${error.message}`);
  return (data as PlaceCardRow[]).map(toPlace).filter((p): p is Place => p !== null);
}

export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("places", `place:${slug}`);

  if (!isSupabaseConfigured) return SAMPLE_PLACES.find((p) => p.slug === slug) ?? null;

  const { data, error } = await createPublicClient().from("place_cards").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`No se pudo cargar el sitio: ${error.message}`);
  return data ? toPlace(data as PlaceCardRow) : null;
}

/** Slugs de todos los sitios publicados, para prerenderizar sus páginas. */
export async function getPlaceSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("places");

  if (!isSupabaseConfigured) return SAMPLE_PLACES.map((p) => p.slug);

  const { data, error } = await createPublicClient().from("place_cards").select("slug");
  if (error) throw new Error(`No se pudieron cargar los sitios: ${error.message}`);
  return (data as { slug: string }[]).map((r) => r.slug);
}

export async function getAds(): Promise<Ad[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("ads");

  if (!isSupabaseConfigured) return SAMPLE_ADS;

  const { data, error } = await createPublicClient()
    .from("ads")
    .select("id, advertiser, title, body, image_path, link_url, placement");
  if (error) return [];
  return data.map((a) => ({
    id: a.id,
    advertiser: a.advertiser,
    title: a.title,
    body: a.body,
    imageUrl: a.image_path ? publicPhotoUrl(a.image_path) : null,
    linkUrl: a.link_url,
    placement: a.placement,
  }));
}

export async function getCities(): Promise<City[]> {
  "use cache";
  cacheLife("days");
  cacheTag("cities");
  // Las ciudades cambian muy poco; se leen de los datos locales hasta que el panel admin las gestione.
  return SAMPLE_CITIES;
}
