const ratingFmt = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const kmFmt = new Intl.NumberFormat("es-VE", { maximumFractionDigits: 1 });

export function formatRating(value: number): string {
  return ratingFmt.format(value);
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${kmFmt.format(km)} km`;
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Distancia en km entre dos puntos (fórmula del haversine). */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export const PRICE_LABELS = ["Gratis", "$", "$$", "$$$"] as const;
