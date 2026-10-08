-- Catálogos base de Kids·Place.
-- Deben coincidir con packages/tokens/src/categories.ts y tags.ts.

insert into public.categories (slug, name, icon, color, sort_order) values
  ('parques',      'Parques y plazas',       'parques',      '#5ea15a', 1),
  ('restaurantes', 'Restaurantes y cafés',   'restaurantes', '#e07a66', 2),
  ('juegos',       'Parques de juegos',      'juegos',       '#f0a03c', 3),
  ('piscinas',     'Playas y piscinas',      'piscinas',     '#4b98c9', 4),
  ('museos',       'Museos y cultura',       'museos',       '#395f72', 5),
  ('naturaleza',   'Naturaleza y animales',  'naturaleza',   '#3f8f80', 6),
  ('comerciales',  'Centros comerciales',    'comerciales',  '#9a7fc4', 7),
  ('fiestas',      'Fiestas y eventos',      'fiestas',      '#da7fa2', 8),
  ('deportes',     'Deportes y actividades', 'deportes',     '#6f84d0', 9),
  ('cursos',       'Cursos y talleres',      'cursos',       '#9c4f7a', 10),
  ('hospedaje',    'Hospedaje familiar',     'hospedaje',    '#bf8a5b', 11),
  ('salud',        'Salud infantil',         'salud',        '#d0605a', 12)
on conflict (slug) do update set name = excluded.name, icon = excluded.icon, color = excluded.color, sort_order = excluded.sort_order;

insert into public.tags (slug, name) values
  ('juegos', 'Área de juegos'),
  ('cambiador', 'Cambiador'),
  ('lactancia', 'Sala de lactancia'),
  ('menu', 'Menú infantil'),
  ('estacionamiento', 'Estacionamiento'),
  ('accesible', 'Accesible'),
  ('gratis', 'Entrada gratuita'),
  ('sombra', 'Zonas de sombra'),
  ('banos', 'Baños'),
  ('aire', 'Aire acondicionado'),
  ('pet', 'Pet-friendly'),
  ('comida', 'Venta de comida')
on conflict (slug) do update set name = excluded.name;

insert into public.cities (slug, name, state, center, default_zoom, is_active) values
  ('caracas',      'Caracas',      'Distrito Capital', extensions.st_point(-66.8792, 10.4880)::extensions.geography, 12.5, false),
  ('valencia',     'Valencia',     'Carabobo',         extensions.st_point(-68.0077, 10.1620)::extensions.geography, 12, false),
  ('maracaibo',    'Maracaibo',    'Zulia',            extensions.st_point(-71.6125, 10.6427)::extensions.geography, 12, false),
  ('barquisimeto', 'Barquisimeto', 'Lara',             extensions.st_point(-69.3200, 10.0650)::extensions.geography, 12.5, true),
  ('lecheria',     'Lechería',     'Anzoátegui',       extensions.st_point(-64.6900, 10.1880)::extensions.geography, 13, false),
  ('margarita',    'Margarita',    'Nueva Esparta',    extensions.st_point(-63.8500, 10.9970)::extensions.geography, 11, false)
on conflict (slug) do update set is_active = excluded.is_active, center = excluded.center, default_zoom = excluded.default_zoom;
