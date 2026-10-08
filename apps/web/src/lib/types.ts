import type { CategorySlug, TagSlug } from "@kids-place/tokens";

export interface PlacePhoto {
  /** URL pública lista para mostrar. */
  url: string;
  caption: string | null;
}

export interface Place {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: CategorySlug;
  city: string;
  cityName: string;
  zone: string;
  address: string;
  lat: number;
  lng: number;
  /** false mientras la ubicación sea aproximada y no la haya verificado un administrador. */
  locationVerified: boolean;
  phone: string | null;
  instagram: string | null;
  website: string | null;
  schedule: string | null;
  priceRange: number | null;
  ratingAvg: number;
  ratingCount: number;
  isFeatured: boolean;
  tags: TagSlug[];
  photos: PlacePhoto[];
}

export interface Ad {
  id: string;
  advertiser: string;
  title: string;
  body: string;
  imageUrl: string | null;
  linkUrl: string | null;
  placement: "list" | "detail" | "home";
}

export interface City {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  isActive: boolean;
}
