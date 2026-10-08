# 2. Arquitectura

## Resumen

```
┌──────────────────────┐      ┌──────────────────────────────┐
│  Web (Next.js)       │      │  Supabase                    │
│  Vercel              │─────▶│  Postgres + PostGIS          │
│  /, /sitios/[slug],  │      │  Auth (Google, enlace mágico)│
│  /admin              │      │  Storage (fotos)             │
└──────────────────────┘      │  Row Level Security          │
┌──────────────────────┐      └──────────────────────────────┘
│  Móvil (Expo)  [F4]  │─────▶          ▲
└──────────────────────┘                │
                               ┌────────┴─────────┐
                               │ MapTiler (mapas) │
                               └──────────────────┘
```

## Tecnologías

| Capa | Elección | Motivo |
|---|---|---|
| Web | **Next.js (App Router) + TypeScript** | SEO por sitio, renderizado en servidor, enlaces compartibles por WhatsApp |
| Estilos | **Tailwind CSS** con los colores de marca como tokens | Rápido y consistente; los tokens se reutilizan en móvil |
| Mapa | **MapLibre GL JS** + **OpenFreeMap** (OpenStreetMap); MapTiler opcional | Gratis y sin clave para empezar, estilo del mapa ajustado a la paleta, sin depender de la facturación de Google |
| Backend | **Supabase** | Base de datos con PostGIS (consultas "cerca de mí"), Auth, Storage y reglas de seguridad sin construir un servidor propio |
| Hosting | **Vercel** (web) + **Supabase Cloud** | Planes gratuitos para arrancar |
| Móvil (Fase 4) | **Expo (React Native)** + MapLibre React Native | Reutiliza tipos, lógica, consultas y tokens del web |
| Repositorio | **Monorepo** con npm workspaces | Web y móvil comparten paquetes |

## Estructura del repositorio (a partir de Fase 1)

```
apps/
  web/           Next.js
  mobile/        Expo (Fase 4)
packages/
  shared/        (futuro) Tipos y consultas a Supabase compartidos con la app móvil
  tokens/        Colores, tipografía, categorías e íconos
supabase/
  migrations/    Esquema SQL versionado
  seed.sql       Datos de prueba
scripts/
  import-dataset Importador del dataset (CSV/Excel → base de datos)
```

## Decisiones clave

- **Promedio de estrellas precalculado.** Un trigger actualiza `rating_avg` y `rating_count` en `places` al insertar o cambiar un voto. El mapa no calcula promedios en cada carga.
- **Un voto por usuario y sitio**, garantizado por la base de datos (`UNIQUE(place_id, user_id)`), no solo por la interfaz.
- **Seguridad en la base de datos (RLS).** Cualquiera lee sitios publicados; solo usuarios autenticados votan, y solo sobre su propio voto; solo administradores escriben sitios, fotos y anuncios.
- **Fotos** en Supabase Storage, redimensionadas al servirlas para que carguen rápido con conexiones lentas.
- **Rendimiento con mala conexión.** Lista y mapa cargan solo los datos mínimos; el detalle se pide al abrirlo. Las imágenes se cargan diferidas.

## Costos estimados al inicio

| Servicio | Plan | Costo |
|---|---|---|
| Vercel | Hobby | Gratis (para uso comercial se requiere Pro, ~20 USD/mes) |
| Supabase | Free | Gratis (500 MB de base de datos, 1 GB de fotos) |
| OpenFreeMap | — | Gratis, sin clave (MapTiler opcional: gratis hasta 100.000 cargas/mes) |
| Dominio | — | ~10–15 USD/año (cuando lo compren) |

> Nota: el plan gratuito de Vercel no permite uso comercial. Al activar anuncios conviene pasar a Pro o evaluar alternativas (Netlify, Cloudflare Pages).
