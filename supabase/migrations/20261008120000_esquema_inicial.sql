-- Kids·Place · esquema inicial
-- Ver docs/03-modelo-de-datos.md

create extension if not exists postgis with schema extensions;

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Catálogos
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon text not null,
  color text not null,
  sort_order int not null default 0
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon text
);

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  state text not null,
  center extensions.geography(Point, 4326) not null,
  default_zoom numeric not null default 12,
  is_active boolean not null default false
);

-- ---------------------------------------------------------------------------
-- Usuarios
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Un usuario no puede cambiarse su propio rol.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'No puedes cambiar el rol de un perfil';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------------------------------------------------------------------------
-- Sitios
-- ---------------------------------------------------------------------------

create table public.places (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  category_id uuid not null references public.categories (id),
  city_id uuid not null references public.cities (id),
  zone text not null default '',
  address text not null default '',
  location extensions.geography(Point, 4326) not null,
  phone text,
  instagram text,
  website text,
  schedule text,
  price_range smallint check (price_range between 0 and 3),
  rating_avg numeric(2, 1) not null default 0,
  rating_count int not null default 0,
  is_published boolean not null default false,
  -- Reservado para sitios patrocinados (fase futura)
  is_featured boolean not null default false,
  featured_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index places_location_idx on public.places using gist (location);
create index places_category_idx on public.places (category_id);
create index places_city_idx on public.places (city_id) where is_published;

create trigger places_updated_at
  before update on public.places
  for each row execute function public.set_updated_at();

create table public.place_tags (
  place_id uuid not null references public.places (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (place_id, tag_id)
);

create table public.place_photos (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index place_photos_place_idx on public.place_photos (place_id, sort_order);

-- ---------------------------------------------------------------------------
-- Puntuaciones
-- ---------------------------------------------------------------------------

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (place_id, user_id)
);

create trigger ratings_updated_at
  before update on public.ratings
  for each row execute function public.set_updated_at();

-- Mantiene rating_avg y rating_count precalculados en places.
create or replace function public.refresh_place_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.place_id, old.place_id);
begin
  update public.places p
  set rating_avg = coalesce(s.avg, 0),
      rating_count = s.count
  from (
    select round(avg(stars)::numeric, 1) as avg, count(*)::int as count
    from public.ratings
    where place_id = target
  ) s
  where p.id = target;
  return null;
end;
$$;

create trigger ratings_refresh_place
  after insert or update or delete on public.ratings
  for each row execute function public.refresh_place_rating();

-- ---------------------------------------------------------------------------
-- Anuncios propios
-- ---------------------------------------------------------------------------

create table public.ads (
  id uuid primary key default gen_random_uuid(),
  advertiser text not null,
  title text not null,
  body text not null default '',
  image_path text,
  link_url text,
  placement text not null check (placement in ('list', 'detail', 'home')),
  city_id uuid references public.cities (id),
  category_id uuid references public.categories (id),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.ad_events (
  id bigint generated always as identity primary key,
  ad_id uuid not null references public.ads (id) on delete cascade,
  type text not null check (type in ('impression', 'click')),
  created_at timestamptz not null default now()
);

create index ad_events_ad_idx on public.ad_events (ad_id, created_at);

-- Registro anónimo de impresiones y clics, solo para anuncios vigentes.
create or replace function public.track_ad_event(p_ad_id uuid, p_type text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_type not in ('impression', 'click') then
    raise exception 'Tipo de evento inválido';
  end if;
  insert into public.ad_events (ad_id, type)
  select a.id, p_type
  from public.ads a
  where a.id = p_ad_id
    and a.is_active
    and a.starts_at <= now()
    and (a.ends_at is null or a.ends_at > now());
end;
$$;

-- ---------------------------------------------------------------------------
-- Vista de lectura para la app
-- ---------------------------------------------------------------------------

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

-- Sitios cercanos a un punto, ordenados por distancia.
create or replace function public.places_nearby(p_lat double precision, p_lng double precision, p_radius_m int default 15000)
returns table (id uuid, distance_m double precision)
language sql
stable
set search_path = ''
as $$
  select p.id, extensions.st_distance(p.location, extensions.st_point(p_lng, p_lat)::extensions.geography) as distance_m
  from public.places p
  where p.is_published
    and extensions.st_dwithin(p.location, extensions.st_point(p_lng, p_lat)::extensions.geography, p_radius_m)
  order by p.location operator(extensions.<->) extensions.st_point(p_lng, p_lat)::extensions.geography;
$$;

-- ---------------------------------------------------------------------------
-- Seguridad (RLS)
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.cities enable row level security;
alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.place_tags enable row level security;
alter table public.place_photos enable row level security;
alter table public.ratings enable row level security;
alter table public.ads enable row level security;
alter table public.ad_events enable row level security;

-- Catálogos: lectura pública, escritura admin
create policy "catálogo visible" on public.categories for select using (true);
create policy "admin gestiona categorías" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "servicios visibles" on public.tags for select using (true);
create policy "admin gestiona servicios" on public.tags for all using (public.is_admin()) with check (public.is_admin());
create policy "ciudades visibles" on public.cities for select using (true);
create policy "admin gestiona ciudades" on public.cities for all using (public.is_admin()) with check (public.is_admin());

-- Perfiles: cada usuario ve y edita el suyo
create policy "ver mi perfil" on public.profiles for select using ((select auth.uid()) = id or public.is_admin());
create policy "editar mi perfil" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Sitios: publicados para todos, todo para admin
create policy "sitios publicados visibles" on public.places for select using (is_published or public.is_admin());
create policy "admin gestiona sitios" on public.places for all using (public.is_admin()) with check (public.is_admin());
create policy "servicios de sitios visibles" on public.place_tags for select using (true);
create policy "admin gestiona servicios de sitios" on public.place_tags for all using (public.is_admin()) with check (public.is_admin());
create policy "fotos visibles" on public.place_photos for select using (true);
create policy "admin gestiona fotos" on public.place_photos for all using (public.is_admin()) with check (public.is_admin());

-- Puntuaciones: cada usuario solo ve y cambia su propio voto
create policy "ver mis votos" on public.ratings for select to authenticated using ((select auth.uid()) = user_id);
create policy "votar" on public.ratings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "cambiar mi voto" on public.ratings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "borrar mi voto" on public.ratings for delete to authenticated using ((select auth.uid()) = user_id);

-- Anuncios: vigentes para todos, todo para admin
create policy "anuncios vigentes visibles" on public.ads for select
  using ((is_active and starts_at <= now() and (ends_at is null or ends_at > now())) or public.is_admin());
create policy "admin gestiona anuncios" on public.ads for all using (public.is_admin()) with check (public.is_admin());
create policy "admin ve métricas" on public.ad_events for select using (public.is_admin());

grant execute on function public.track_ad_event(uuid, text) to anon, authenticated;
grant execute on function public.places_nearby(double precision, double precision, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Almacenamiento de fotos
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('place-photos', 'place-photos', true)
on conflict (id) do nothing;

create policy "fotos públicas" on storage.objects for select using (bucket_id = 'place-photos');
create policy "admin sube fotos" on storage.objects for insert with check (bucket_id = 'place-photos' and public.is_admin());
create policy "admin cambia fotos" on storage.objects for update using (bucket_id = 'place-photos' and public.is_admin());
create policy "admin borra fotos" on storage.objects for delete using (bucket_id = 'place-photos' and public.is_admin());
