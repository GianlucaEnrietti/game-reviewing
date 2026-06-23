-- Función segura para verificar admin (bypass RLS con security definer)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and lower(trim(role)) = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Permiso base para que authenticated pueda leer su propia fila vía RLS
grant select on table public.profiles to authenticated;

-- Verificar que el perfil exista y coincida con auth.users (ejecutar manualmente):
-- select u.id as auth_id, u.email, p.id as profile_id, p.role, p.nickname
-- from auth.users u
-- left join public.profiles p on p.id = u.id
-- where u.email = 'tu-email@dominio.com';
