alter table public.reviews
  add column if not exists final_thoughts text;
