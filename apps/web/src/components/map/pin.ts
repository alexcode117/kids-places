import { ICONS, PIN_PATH, getCategory, type CategorySlug } from "@kids-place/tokens";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Contenido HTML del pin de un sitio: gota del color de la categoría con su ícono. */
export function pinHtml(category: CategorySlug, name: string): string {
  const { color } = getCategory(category);
  return `<svg viewBox="0 0 40 50" aria-hidden="true">
  <path class="ring" d="${PIN_PATH}" fill="none" stroke="#f4a546" stroke-width="7"/>
  <path d="${PIN_PATH}" fill="${color}" stroke="#fff" stroke-width="2.5"/>
  <circle cx="20" cy="19" r="11" fill="#fff"/>
  <g transform="translate(12 11) scale(.667)" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[category]}"/></g>
</svg><span class="lbl">${escapeHtml(name)}</span>`;
}

/** Ubicación del usuario: la carita del logo con un pulso naranja. */
export function meHtml(): string {
  return `<div class="pulse"></div><div class="face"><img src="/brand/kids-place-carita.svg" alt=""></div>`;
}
