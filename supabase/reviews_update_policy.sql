-- Permitir que autores actualicen solo sus propias reseñas
grant update on table public.reviews to authenticated;

drop policy if exists "Authors can update own reviews" on public.reviews;

create policy "Authors can update own reviews"
on public.reviews
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());
