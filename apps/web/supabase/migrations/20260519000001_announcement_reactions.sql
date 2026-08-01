create table if not exists public.announcement_reactions (
  id               uuid primary key default gen_random_uuid(),
  announcement_id  uuid not null references public.announcements(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  emoji            text not null check (emoji in ('thumbsup','heart','star','cheer','fire')),
  created_at       timestamptz not null default now(),
  unique (announcement_id, user_id, emoji)
);

create index on public.announcement_reactions (announcement_id);

alter table public.announcement_reactions enable row level security;

create policy "reactions_select_members"
  on public.announcement_reactions for select to authenticated
  using (exists (
    select 1 from public.announcements a
    join public.team_members tm on tm.team_id = a.team_id
    where a.id = announcement_id and tm.user_id = auth.uid()
  ));

create policy "reactions_insert_members"
  on public.announcement_reactions for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.announcements a
      join public.team_members tm on tm.team_id = a.team_id
      where a.id = announcement_id and tm.user_id = auth.uid()
    )
  );

create policy "reactions_delete_own"
  on public.announcement_reactions for delete to authenticated
  using (user_id = auth.uid());
