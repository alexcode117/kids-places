# 1. Visión y alcance

## Qué es

Kids·Place es un mapa de lugares aptos para niños en Venezuela: parques, restaurantes, museos, piscinas, centros comerciales y más. Las familias encuentran sitios cerca, ven fotos y detalles, y los puntúan con estrellas.

## Para quién

- **Familias** (madres, padres, abuelos, cuidadores) que buscan a dónde llevar a los niños. Ojo: el público objetivo son adultos, no niños. Esto importa para la publicidad (ver más abajo).
- **Administradores** de Kids·Place, que cargan y mantienen los sitios.
- **Negocios** (fase posterior), que pagan por aparecer destacados.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Plataforma | Web primero; app móvil después |
| Idioma | Solo español |
| Quién carga sitios | Solo administradores |
| Puntuación | Estrellas de 1 a 5, sin comentarios. Requiere sesión. Un voto por usuario y sitio, editable |
| Inicio de sesión | Google o enlace mágico por correo |
| Ciudad inicial | Caracas (las demás se habilitan cuando tengan sitios) |
| Monetización inicial | Anuncios propios (vendidos a negocios locales) + Google AdSense cuando haya tráfico |
| Monetización futura | Sitios patrocinados / destacados |
| Dominio | Aún no hay. Se usa el subdominio de Vercel mientras tanto |

## Categorías

1. Parques y plazas
2. Restaurantes y cafés
3. Parques de juegos (indoor, inflables, trampolines)
4. Playas y piscinas
5. Museos y cultura
6. Naturaleza y animales
7. Centros comerciales
8. Fiestas y eventos
9. Deportes y actividades
10. Hospedaje familiar
11. Salud infantil

## Servicios (etiquetas filtrables)

Área de juegos · Cambiador · Sala de lactancia · Menú infantil · Estacionamiento · Accesible · Entrada gratuita · Zonas de sombra · Baños · Aire acondicionado · Pet-friendly · Venta de comida

## Alcance del MVP (Fase 1)

**Incluye**
- Mapa con pines personalizados por categoría y ubicación del usuario.
- Lista de sitios sincronizada con el mapa; filtros por categoría, búsqueda y orden (cercanía / puntuación).
- Vista detalle con galería, descripción, servicios, datos de contacto, "Cómo llegar" (Google Maps / Waze) y puntuación.
- Inicio de sesión y voto con estrellas.
- Página propia por sitio (`/sitios/[slug]`) para compartir y para SEO.
- Espacios de anuncios propios (lista y detalle).

**No incluye (fases posteriores)**
- Panel de administración completo (Fase 2; mientras tanto se carga con el importador).
- Favoritos, "cerca de mí" avanzado, PWA (Fase 3).
- App móvil (Fase 4).
- Sitios patrocinados (Fase 5).

## Publicidad: consideraciones

- **AdSense** pide contenido propio y algo de tráfico antes de aprobar. Se solicita después del lanzamiento.
- Al configurar AdSense, el sitio se declara **dirigido a adultos (padres)**, no a niños. Si se marca como dirigido a niños, aplican restricciones de COPPA y los anuncios pagan mucho menos.
- **Pendiente:** verificar los métodos de cobro de AdSense disponibles desde Venezuela antes de depender de ese ingreso.
- Los anuncios propios no dependen de terceros: se cargan desde el panel, con fechas de inicio y fin, y se miden impresiones y clics.
- Ubicaciones permitidas: lista (cada ~4 resultados), vista detalle (bajo los servicios), pie de la portada. **Nunca sobre el mapa.**
- Contenido de anuncios: siempre apto para familias.
