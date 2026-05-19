alter table public.profiles
  add column if not exists can_create_team boolean not null default false;
