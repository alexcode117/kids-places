# Kids·Place

Geolocalizador de sitios kids-friendly en Venezuela. Primero como app web (Next.js) y más adelante como app móvil (Expo).

## Empezar

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Sin Supabase configurado, la app corre en **modo demostración** con datos de ejemplo. Para conectarla a la base de datos real, sigue [docs/07-puesta-en-marcha.md](docs/07-puesta-en-marcha.md).

## Estado

| Fase | Estado |
|---|---|
| 0 · Diseño y planificación | ✅ Lista (quedan preguntas de diseño por validar en [docs/04-hoja-de-ruta.md](docs/04-hoja-de-ruta.md)) |
| 1 · MVP web | 🚧 En curso: la base funciona; faltan Supabase real, importador del dataset y despliegue |

## Estructura

```
kids-place/
├── apps/
│   └── web/                  App web (Next.js 16, Tailwind 4, MapLibre)
│       └── src/
│           ├── app/          Rutas: /, /sitios/[slug], /auth/callback
│           ├── components/   Explorer (mapa + lista), detalle, estrellas, login
│           ├── data/         Datos de ejemplo (modo demostración)
│           └── lib/          Acceso a datos, Supabase, puntuaciones
├── packages/
│   └── tokens/               Colores, categorías, servicios e íconos (web + móvil)
├── supabase/
│   ├── migrations/           Esquema SQL, seguridad (RLS) y almacenamiento de fotos
│   └── seed.sql              Categorías, servicios y ciudades
├── docs/                     Visión, arquitectura, datos, hoja de ruta, marca, dataset, puesta en marcha
├── design/prototipo/         Prototipos interactivos de la Fase 0
├── brand/                    Fuente Brownist y logos (SVG originales y variantes)
└── data/dataset/             Dataset de sitios + plantilla
```
