# 4. Hoja de ruta

## Fase 0 · Diseño y planificación

- [x] Definir alcance, categorías y decisiones técnicas
- [x] Prototipo interactivo: mapa, lista y vista detalle (`design/prototipo/mapa-y-detalle.html`)
- [x] Prototipo interactivo: panel de administración (`design/prototipo/panel-admin.html`)
- [x] Modelo de datos
- [x] Agregar la fuente Brownist en `brand/fuentes/`
- [ ] Agregar la licencia de Brownist (confirmar uso web y en apps)
- [x] Agregar el logo en SVG (se generaron variantes: carita, logotipo y versión para modo oscuro)
- [x] Agregar el dataset en `data/dataset/`
- [ ] Validar el diseño (preguntas abajo)

### Preguntas de diseño por validar

1. **Pines:** ¿color + ícono de categoría (como en el prototipo) o la carita del logo dentro de cada pin?
2. **Colores de categoría:** ¿se aprueban los 8 tonos añadidos a la paleta?
3. **Distribución:** lista a la izquierda y mapa a la derecha (escritorio); mapa arriba (móvil). ¿Ok?
4. **Anuncios:** ¿ubicación y nivel de visibilidad correctos?
5. **Panel admin:** ¿falta algún campo o pantalla?

## Fase 1 · MVP web ← actual

- [x] Monorepo (npm workspaces) + Next.js 16 + Tailwind 4 + tokens de marca + fuente Brownist
- [x] Migraciones del esquema, RLS, trigger de puntuación y almacenamiento de fotos
- [ ] Crear el proyecto en Supabase y ejecutar las migraciones (ver docs/07-puesta-en-marcha.md)
- [x] Importador del dataset (`npm run importar`)
- [x] Categoría "Cursos y talleres" y Barquisimeto como ciudad inicial
- [ ] Verificar las 15 ubicaciones aproximadas y ubicar los 18 sitios en borrador
- [x] Mapa MapLibre con estilo propio y pines por categoría
- [x] Lista sincronizada, filtros, búsqueda, orden y "Cerca de mí"
- [x] Vista detalle + página `/sitios/[slug]` con metadatos para compartir
- [x] Inicio de sesión (Google + enlace mágico) y votación: código listo, falta probarlo con Supabase real
- [x] Espacios de anuncios propios con registro de impresiones y clics
- [ ] Agrupar pines cercanos cuando haya muchos sitios
- [ ] Despliegue en Vercel

## Fase 2 · Administración

- [ ] Panel `/admin`: sitios, fotos, categorías, etiquetas
- [ ] Gestión de anuncios con métricas de impresiones y clics
- [ ] Importación desde el panel

## Fase 3 · Crecimiento

- [ ] Favoritos
- [x] "Cerca de mí" con geolocalización del navegador (adelantado a la Fase 1)
- [ ] PWA (instalable en el teléfono)
- [ ] Solicitud de AdSense
- [ ] Analítica (visitas por sitio, búsquedas sin resultado)

## Fase 4 · App móvil

- [ ] Expo + MapLibre React Native reutilizando `packages/shared` y `packages/tokens`
- [ ] Publicación en Google Play y App Store

## Fase 5 · Sitios patrocinados

- [ ] Pin destacado y posición preferente en la lista
- [ ] Gestión de planes y fechas de patrocinio en el panel
