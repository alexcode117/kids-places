export type TagSlug =
  | "juegos"
  | "cambiador"
  | "lactancia"
  | "menu"
  | "estacionamiento"
  | "accesible"
  | "gratis"
  | "sombra"
  | "banos"
  | "aire"
  | "pet"
  | "comida";

/** Servicios filtrables. Debe coincidir con supabase/seed.sql. */
export const TAGS: Readonly<Record<TagSlug, string>> = {
  juegos: "Área de juegos",
  cambiador: "Cambiador",
  lactancia: "Sala de lactancia",
  menu: "Menú infantil",
  estacionamiento: "Estacionamiento",
  accesible: "Accesible",
  gratis: "Entrada gratuita",
  sombra: "Zonas de sombra",
  banos: "Baños",
  aire: "Aire acondicionado",
  pet: "Pet-friendly",
  comida: "Venta de comida",
};

export function isTagSlug(value: string): value is TagSlug {
  return value in TAGS;
}
