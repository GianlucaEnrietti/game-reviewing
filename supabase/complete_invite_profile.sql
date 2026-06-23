-- Perfil al completar invitación (nickname + rol admin si aún no tiene rol)
create or replace function public.complete_invite_profile(p_nickname text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nickname text := trim(p_nickname);
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if char_length(v_nickname) < 2 then
    raise exception 'nickname_too_short';
  end if;

  insert into public.profiles (id, nickname, role)
  values (auth.uid(), v_nickname, 'admin')
  on conflict (id) do update
  set
    nickname = excluded.nickname,
    role = case
      when public.profiles.role is null or trim(public.profiles.role) = ''
      then 'admin'
      else public.profiles.role
    end;
end;
$$;

grant execute on function public.complete_invite_profile(text) to authenticated;
