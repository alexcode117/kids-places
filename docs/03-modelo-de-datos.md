# 3. Modelo de datos

Base de datos: Postgres (Supabase) con la extensión PostGIS.

## Tablas

### `categories`
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| slug | text | único, p. ej. `parques` |
| name | text | "Parques y plazas" |
| icon | text | nombre del ícono |
| color | text | hex |
| sort_order | int | orden en los filtros |

### `tags` (servicios)
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| slug | text | único, p. ej. `cambiador` |
| name | text | "Cambiador" |
| icon | text | |

### `cities`
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| name | text | "Caracas" |
| state | text | "Distrito Capital" |
| center | geography(Point) | centro del mapa |
| is_active | bool | se muestra en el selector |

### `places`
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| slug | text | único, para la URL |
| name | text | |
| description | text | |
| category_id | uuid | FK → categories |
| city_id | uuid | FK → cities |
| zone | text | urbanización / sector |
| address | text | |
| location | geography(Point, 4326) | índice GIST |
| phone | text | opcional |
| instagram | text | opcional |
| website | text | opcional |
| schedule | jsonb | horario por día |
| price_range | smallint | 0 gratis · 1 $ · 2 $$ · 3 $$$ |
| rating_avg | numeric(2,1) | calculado por trigger |
| rating_count | int | calculado por trigger |
| is_published | bool | borrador / publicado |
| is_featured | bool | **reservado para patrocinios (fase futura)** |
| featured_until | timestamptz | **reservado para patrocinios** |
| created_at / updated_at | timestamptz | |

### `place_tags`
`place_id` + `tag_id` (PK compuesta).

### `place_photos`
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| place_id | uuid | FK |
| storage_path | text | ruta en Supabase Storage |
| caption | text | |
| sort_order | int | la primera es la portada |

### `profiles`
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | = auth.users.id |
| display_name | text | |
| avatar_url | text | |
| role | text | `user` · `admin` |

### `ratings`
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| place_id | uuid | FK |
| user_id | uuid | FK |
| stars | smallint | CHECK 1–5 |
| created_at / updated_at | timestamptz | |
| | | **UNIQUE(place_id, user_id)** |

### `ads`
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| advertiser | text | nombre del anunciante |
| title | text | |
| body | text | |
| image_path | text | |
| link_url | text | |
| placement | text | `list` · `detail` · `home` |
| city_id | uuid | opcional, segmentar por ciudad |
| category_id | uuid | opcional, segmentar por categoría |
| starts_at / ends_at | timestamptz | |
| is_active | bool | |

### `ad_events`
`id`, `ad_id`, `type` (`impression` · `click`), `created_at`. Se agregan por día para los reportes.

## Reglas de seguridad (RLS)

| Tabla | Leer | Escribir |
|---|---|---|
| categories, tags, cities | todos | admin |
| places, place_tags, place_photos | todos (solo publicados); admin ve borradores | admin |
| ratings | todos (solo agregados vía places) | usuario autenticado, solo su propio voto |
| profiles | el propio usuario | el propio usuario (excepto `role`) |
| ads | todos (solo activos y vigentes) | admin |
| ad_events | admin | inserción anónima vía función con límite |

## Consultas principales

- **Sitios en el área visible del mapa:** `ST_Intersects(location, bbox)` filtrado por categoría.
- **Cerca de mí:** `ORDER BY location <-> punto_usuario` con `ST_DWithin` para limitar el radio.
- **Detalle:** sitio + fotos + etiquetas + voto del usuario actual (si hay sesión).
