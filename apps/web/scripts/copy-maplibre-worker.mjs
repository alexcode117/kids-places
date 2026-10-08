// MapLibre 6 carga su worker como un archivo aparte. Lo copiamos a public/
// para servirlo desde nuestro propio dominio (ver src/components/map/MapView.tsx).
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const pkgDir = dirname(require.resolve("maplibre-gl/package.json"));
const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "maplibre");
mkdirSync(outDir, { recursive: true });
copyFileSync(join(pkgDir, "dist", "maplibre-gl-worker.mjs"), join(outDir, "maplibre-gl-worker.mjs"));
