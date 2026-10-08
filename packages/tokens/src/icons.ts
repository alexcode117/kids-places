/**
 * Íconos lineales (viewBox 0 0 24 24, trazo 2, extremos redondos),
 * en sintonía con el trazo del logo. Se dibujan con stroke, sin relleno.
 */
export const ICONS = {
  parques: "M12 22v-7M12 15c-4 0-6.5-2.6-6.5-5.6S8.5 4 12 2c3.5 2 6.5 4.4 6.5 7.4S16 15 12 15z",
  restaurantes: "M7 2v20M4 2v6a3 3 0 0 0 6 0V2M17 22V2c-2.6 1.5-3.6 4-3.6 7.2 0 2.6 1.2 4 3.6 4",
  juegos: "M5 21V5M9 21V5M5 9h4M5 13h4M9 5l10 12.5M17 18h4",
  piscinas:
    "M2 16c2.5 0 2.5-1.6 5-1.6s2.5 1.6 5 1.6 2.5-1.6 5-1.6 2.5 1.6 5 1.6M2 20.5c2.5 0 2.5-1.6 5-1.6s2.5 1.6 5 1.6 2.5-1.6 5-1.6 2.5 1.6 5 1.6M8 8a4 4 0 1 0 8 0 4 4 0 1 0-8 0",
  museos: "M3 21h18M4 10h16M12 3l9 5H3zM6 10v8M10 10v8M14 10v8M18 10v8",
  naturaleza: "M2 20l7-12 4 6.5 3-4L22 20z",
  comerciales: "M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2",
  fiestas: "M12 2.5c3.4 0 6 2.6 6 6 0 3.9-3 7-6 7s-6-3.1-6-7c0-3.4 2.6-6 6-6zM11 17.5h2M12 17.5c0 2-2 2.2-2 4",
  deportes: "M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0M12 7.5l4 3-1.5 4.8h-5L8 10.5z",
  cursos: "M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5zM12 6v13.5",
  hospedaje: "M3 19V6M3 15h18v4M21 15v-2.5A3.5 3.5 0 0 0 17.5 9H11v6M7 10.5a1.8 1.8 0 1 0 0 .1",
  salud: "M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20zM12 10v5M9.5 12.5h5",
  pin: "M12 21s-7-6.3-7-11.5a7 7 0 0 1 14 0C19 14.7 12 21 12 21zM12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5V12l3 2",
  phone: "M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z",
  instagram:
    "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM17.5 6.5h0",
  check: "M5 12.5l4.5 4.5L19 7.5",
  back: "M15 5l-7 7 7 7",
  next: "M9 5l7 7-7 7",
  navigate: "M3 11l18-8-8 18-2-8z",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.6-3.6",
  locate: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3",
  close: "M6 6l12 12M18 6L6 18",
  share: "M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6",
} as const;

export type IconName = keyof typeof ICONS;

/** Silueta del pin del mapa (viewBox 0 0 40 50). */
export const PIN_PATH = "M20 49C20 49 3 30.5 3 19a17 17 0 0 1 34 0c0 11.5-17 30-17 30z";
