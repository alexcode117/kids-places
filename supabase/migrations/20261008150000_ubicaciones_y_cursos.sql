-- Sitios sin coordenadas (borradores) y ubicaciones por verificar.
-- Las coordenadas las agrega un administrador; un sitio solo se publica con ubicación.

alter table public.places alter column location drop not null;

alter table public.places
  add column location_verified boolean not null default false;

alter table public.places
  add constraint places_published_needs_location check (not is_published or location is not null);

-- Se recrea la vista para exponer location_verified.
drop view if exists public.place_cards;

create view public.place_cards
with (security_invoker = true)
as
select
  p.id,
  p.slug,
  p.name,
  p.description,
  c.slug as category,
  ci.slug as city,
  ci.name as city_name,
  p.zone,
  p.address,
  extensions.st_y(p.location::extensions.geometry) as lat,
  extensions.st_x(p.location::extensions.geometry) as lng,
  p.location_verified,
  p.phone,
  p.instagram,
  p.website,
  p.schedule,
  p.price_range,
  p.rating_avg,
  p.rating_count,
  p.is_featured and coalesce(p.featured_until > now(), true) as is_featured,
  coalesce(
    (select array_agg(t.slug order by t.slug) from public.place_tags pt join public.tags t on t.id = pt.tag_id where pt.place_id = p.id),
    '{}'
  ) as tags,
  coalesce(
    (select jsonb_agg(jsonb_build_object('path', ph.storage_path, 'caption', ph.caption) order by ph.sort_order)
     from public.place_photos ph where ph.place_id = p.id),
    '[]'::jsonb
  ) as photos,
  p.updated_at
from public.places p
join public.categories c on c.id = p.category_id
join public.cities ci on ci.id = p.city_id
where p.is_published;
