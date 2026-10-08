// Importador del dataset de sitios.
//
// Une el archivo original (data/dataset/PLANES VACACIONALES 2026.xlsx - Hoja1.csv)
// con los ajustes editables por el administrador (data/dataset/ajustes.csv:
// categoría, zona y coordenadas) y genera:
//   - supabase/datos/sitios-dataset.sql  → para ejecutar en el SQL Editor de Supabase
//   - apps/web/src/data/dataset.json     → datos del modo demostración
//
// Uso: npm run importar

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(root, "data/dataset/PLANES VACACIONALES 2026.xlsx - Hoja1.csv");
const ADJUSTMENTS = join(root, "data/dataset/ajustes.csv");
const OUT_SQL = join(root, "supabase/datos/sitios-dataset.sql");
const OUT_JSON = join(root, "apps/web/src/data/dataset.json");

const CITY = { slug: "barquisimeto", name: "Barquisimeto" };
const CATEGORIES = new Set([
  "parques", "restaurantes", "juegos", "piscinas", "museos", "naturaleza",
  "comerciales", "fiestas", "deportes", "cursos", "hospedaje", "salud",
]);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') (cell += '"'), i++;
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") row.push(cell), (cell = "");
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell), rows.push(row), (row = []), (cell = "");
    } else cell += c;
  }
  if (cell || row.length) row.push(cell), rows.push(row);
  return rows;
}

function readTable(path) {
  const [head, ...rows] = parseCsv(readFileSync(path, "utf8").replace(/^﻿/, ""));
  const keys = head.map((h) => h.trim().toLowerCase());
  return rows.filter((r) => r.some((c) => c.trim())).map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

const clean = (s) => (s && s !== "-" ? s.replace(/\s+/g, " ").trim() : "");
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** "ig: kabe.bqto / 04125030702" → { instagram: "@kabe.bqto", phone: "0412-5030702" } */
function parseContacts(text) {
  const ig = text.match(/ig:\s*([\w.]+)/i)?.[1];
  const digits = text.replace(/ig:\s*[\w.]+/i, "").replace(/\D/g, "");
  const phone = digits.length === 11 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : null;
  return { instagram: ig ? `@${ig}` : null, phone };
}

function describe(summary, ages) {
  const parts = [];
  const s = clean(summary).replace(/[.\s]+$/, "");
  if (s) parts.push(`${capitalize(s)}.`);
  const a = clean(ages).replace(/[.\s]+$/, "");
  if (a) parts.push(`Edades: ${a.charAt(0).toLowerCase()}${a.slice(1)}.`);
  return parts.join(" ");
}

/** Separa un poco los sitios que comparten la misma coordenada aproximada para que no se tapen en el mapa. */
function spread(places) {
  const groups = new Map();
  for (const p of places) {
    if (p.lat == null) continue;
    const key = `${p.lat},${p.lng}`;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    group.forEach((p, i) => {
      const angle = (2 * Math.PI * i) / group.length;
      p.lat = +(p.lat + 0.0007 * Math.sin(angle)).toFixed(6);
      p.lng = +(p.lng + 0.0007 * Math.cos(angle)).toFixed(6);
    });
  }
}

const sql = (v) => (v == null || v === "" ? "null" : `'${String(v).replace(/'/g, "''")}'`);

// --- Unir dataset y ajustes ---------------------------------------------------

const source = readTable(SOURCE);
const adjustments = new Map(readTable(ADJUSTMENTS).map((a) => [a.fila, a]));
const errors = [];
const places = [];

for (const row of source) {
  const n = row[""] || row["#"];
  const name = clean(row["lugar"]);
  if (!n || !name) continue;
  const adj = adjustments.get(n);
  if (!adj) {
    errors.push(`Fila ${n} (${name}): no está en ajustes.csv`);
    continue;
  }
  if (!CATEGORIES.has(adj.categoria)) {
    errors.push(`Fila ${n} (${name}): categoría "${adj.categoria}" no existe`);
    continue;
  }
  const lat = adj.latitud ? Number(adj.latitud) : null;
  const lng = adj.longitud ? Number(adj.longitud) : null;
  if ((lat == null) !== (lng == null) || Number.isNaN(lat) || Number.isNaN(lng)) {
    errors.push(`Fila ${n} (${name}): coordenadas incompletas o inválidas`);
    continue;
  }
  const { instagram, phone } = parseContacts(row["redes y contactos"] ?? "");
  places.push({
    slug: adj.slug,
    name,
    category: adj.categoria,
    zone: adj.zona || CITY.name,
    address: clean(row["ubicación"]) || "Por confirmar",
    description: describe(row["resumen de actividades"], row["edades"]),
    instagram,
    phone,
    lat,
    lng,
    verified: adj.ubicacion === "verificada",
  });
}

if (errors.length) {
  console.error("Hay problemas en el dataset:\n- " + errors.join("\n- "));
  process.exit(1);
}

spread(places.filter((p) => !p.verified));

// --- SQL para Supabase ----------------------------------------------------------

const values = places
  .map((p) =>
    [
      sql(p.slug),
      sql(p.name),
      sql(p.description),
      `(select id from public.categories where slug = ${sql(p.category)})`,
      `(select id from public.cities where slug = ${sql(CITY.slug)})`,
      sql(p.zone),
      sql(p.address),
      p.lat == null ? "null" : `extensions.st_point(${p.lng}, ${p.lat})::extensions.geography`,
      p.verified,
      sql(p.phone),
      sql(p.instagram),
      p.lat != null,
    ].join(", "),
  )
  .map((v) => `  (${v})`)
  .join(",\n");

const out = `-- Generado por scripts/importar-dataset.mjs. No editar a mano:
-- cambia data/dataset/ajustes.csv y vuelve a ejecutar \`npm run importar\`.
-- Ejecutar en el SQL Editor de Supabase después de las migraciones y seed.sql.
-- Los sitios sin coordenadas quedan como borrador (no se ven en el mapa).

insert into public.places
  (slug, name, description, category_id, city_id, zone, address, location, location_verified, phone, instagram, is_published)
values
${values}
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category_id = excluded.category_id,
  city_id = excluded.city_id,
  zone = excluded.zone,
  address = excluded.address,
  location = excluded.location,
  location_verified = excluded.location_verified,
  phone = excluded.phone,
  instagram = excluded.instagram,
  is_published = excluded.is_published;
`;

mkdirSync(dirname(OUT_SQL), { recursive: true });
writeFileSync(OUT_SQL, out);

// --- JSON para el modo demostración --------------------------------------------

const demo = places
  .filter((p) => p.lat != null)
  .map((p) => ({
    id: `demo-${p.slug}`,
    slug: p.slug,
    name: p.name,
    description: p.description,
    category: p.category,
    city: CITY.slug,
    cityName: CITY.name,
    zone: p.zone,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    locationVerified: p.verified,
    phone: p.phone,
    instagram: p.instagram,
    website: null,
    schedule: null,
    priceRange: null,
    ratingAvg: 0,
    ratingCount: 0,
    isFeatured: false,
    tags: [],
    photos: [],
  }));
writeFileSync(OUT_JSON, JSON.stringify(demo, null, 2) + "\n");

const drafts = places.length - demo.length;
console.log(`✓ ${places.length} sitios: ${demo.length} con ubicación (se publican), ${drafts} sin ubicación (borrador).`);
console.log(`  SQL:  ${OUT_SQL.replace(root, ".")}`);
console.log(`  Demo: ${OUT_JSON.replace(root, ".")}`);
