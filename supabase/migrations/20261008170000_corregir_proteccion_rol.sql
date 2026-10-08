-- La protección del rol bloqueaba también al SQL Editor (sin usuario de la app,
-- auth.uid() es null), impidiendo asignar administradores desde Supabase.
-- Ahora solo se bloquea a usuarios de la app que no sean administradores.
-- Los visitantes anónimos ya no pueden editar perfiles por RLS.

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not public.is_admin() then
    raise exception 'No puedes cambiar el rol de un perfil';
  end if;
  return new;
end;
$$;
