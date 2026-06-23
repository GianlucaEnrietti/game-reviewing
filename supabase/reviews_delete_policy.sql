-- Permitir que autores eliminen solo sus propias reseñas
grant delete on table public.reviews to authenticated;

drop policy if exists "Authors can delete own reviews" on public.reviews;

create policy "Authors can delete own reviews"
on public.reviews
for delete
to authenticated
using (author_id = auth.uid());
