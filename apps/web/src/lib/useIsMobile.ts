"use client";

import { useSyncExternalStore } from "react";

/** Debe coincidir con la variante `mobile` de globals.css. */
const QUERY = "(width < 860px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** true en pantallas de celular. En el servidor siempre es false. */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
