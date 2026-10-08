import type { IconName } from "./icons";

export type CategorySlug =
  | "parques"
  | "restaurantes"
  | "juegos"
  | "piscinas"
  | "museos"
  | "naturaleza"
  | "comerciales"
  | "fiestas"
  | "deportes"
  | "cursos"
  | "hospedaje"
  | "salud";

export interface Category {
  slug: CategorySlug;
  name: string;
  color: string;
  icon: IconName;
}

/** Orden en que aparecen en los filtros. Debe coincidir con supabase/seed.sql. */
export const CATEGORIES: readonly Category[] = [
  { slug: "parques", name: "Parques y plazas", color: "#5ea15a", icon: "parques" },
  { slug: "restaurantes", name: "Restaurantes y cafés", color: "#e07a66", icon: "restaurantes" },
  { slug: "juegos", name: "Parques de juegos", color: "#f0a03c", icon: "juegos" },
  { slug: "piscinas", name: "Playas y piscinas", color: "#4b98c9", icon: "piscinas" },
  { slug: "museos", name: "Museos y cultura", color: "#395f72", icon: "museos" },
  { slug: "naturaleza", name: "Naturaleza y animales", color: "#3f8f80", icon: "naturaleza" },
  { slug: "comerciales", name: "Centros comerciales", color: "#9a7fc4", icon: "comerciales" },
  { slug: "fiestas", name: "Fiestas y eventos", color: "#da7fa2", icon: "fiestas" },
  { slug: "deportes", name: "Deportes y actividades", color: "#6f84d0", icon: "deportes" },
  { slug: "cursos", name: "Cursos y talleres", color: "#9c4f7a", icon: "cursos" },
  { slug: "hospedaje", name: "Hospedaje familiar", color: "#bf8a5b", icon: "hospedaje" },
  { slug: "salud", name: "Salud infantil", color: "#d0605a", icon: "salud" },
];

const bySlug = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategory(slug: string): Category {
  return bySlug.get(slug as CategorySlug) ?? CATEGORIES[0];
}

export function isCategorySlug(value: string): value is CategorySlug {
  return bySlug.has(value as CategorySlug);
}
