/** Paleta de marca. Ver docs/05-guia-de-marca.md */
export const brand = {
  orange: "#f4a546",
  blue: "#395f72",
  teal: "#90c7c1",
  onOrange: "#3b2608",
} as const;

export const light = {
  bg: "#f3f7f6",
  surface: "#ffffff",
  ink: "#23404c",
  ink2: "#5d7682",
  line: "#dfe9e7",
  lineStrong: "#c4d6d3",
  chip: "#eaf4f2",
  brandInk: "#395f72",
} as const;

export const dark = {
  bg: "#12201f",
  surface: "#182a2f",
  ink: "#e6f0ee",
  ink2: "#9db4b6",
  line: "#28403f",
  lineStrong: "#3a5655",
  chip: "#20363a",
  brandInk: "#90c7c1",
} as const;

/** Colores aplicados al estilo del mapa base. */
export const mapColors = {
  light: {
    land: "#eef3ea",
    building: "#e3eae0",
    water: "#b9dde4",
    park: "#c6e3bd",
    road: "#ffffff",
    roadMajor: "#fbe2bd",
    rail: "#c4d6d3",
    label: "#5d7682",
  },
  dark: {
    land: "#172629",
    building: "#1d2f33",
    water: "#1b3f4c",
    park: "#214432",
    road: "#27393d",
    roadMajor: "#4a3c27",
    rail: "#3a5655",
    label: "#9db4b6",
  },
} as const;
