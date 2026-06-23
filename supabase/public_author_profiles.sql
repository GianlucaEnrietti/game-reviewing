-- Vista pública: solo id y nickname (sin exponer el resto de profiles)
create or replace view public.public_author_profiles
with (security_invoker = false) as
select id, nickname
from public.profiles;

grant select on public.public_author_profiles to anon, authenticated;

-- Quitar lectura pública directa de profiles (si la tenías)
revoke select on public.profiles from anon;

-- Permiso base para lectura propia vía RLS
grant select on table public.profiles to authenticated;

-- Cada usuario autenticado solo puede leer su propia fila (role, etc.)
alter table public.profiles enable row level security;

drop policy if exists "Public can read profiles" on public.profiles;
drop policy if exists "Users read own profile" on public.profiles;

create policy "Users read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);
