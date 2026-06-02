-- Supply items list for events (any event type)
-- Admins add items; any team member can claim one item per slot (potluck-style)

create table if not exists public.event_supply_items (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  team_id     uuid not null references public.teams(id) on delete cascade,
  label       text not null check (char_length(label) > 0 and char_length(label) <= 120),
  sort_order  integer not null default 0,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index on public.event_supply_items (event_id, sort_order, created_at);

alter table public.event_supply_items enable row level security;

create policy "supply_items_select_members"
  on public.event_supply_items for select to authenticated
  using (public.is_team_member(team_id));

create policy "supply_items_insert_admins"
  on public.event_supply_items for insert to authenticated
  with check (public.is_team_admin(team_id));

create policy "supply_items_delete_admins"
  on public.event_supply_items for delete to authenticated
  using (public.is_team_admin(team_id));


-- One claim per item (unique on item_id enforces first-come-first-served)
create table if not exists public.event_supply_claims (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references public.event_supply_items(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(item_id)
);

create index on public.event_supply_claims (item_id);

alter table public.event_supply_claims enable row level security;

-- Members can read claims for events on their teams
create policy "supply_claims_select_members"
  on public.event_supply_claims for select to authenticated
  using (
    exists (
      select 1 from public.event_supply_items si
      join public.team_members tm on tm.team_id = si.team_id
      where si.id = event_supply_claims.item_id
        and tm.user_id = auth.uid()
    )
  );

-- Any team member can claim (insert their own record)
create policy "supply_claims_insert_own"
  on public.event_supply_claims for insert to authenticated
  with check (user_id = auth.uid());

-- Only the claimer can unclaim
create policy "supply_claims_delete_own"
  on public.event_supply_claims for delete to authenticated
  using (user_id = auth.uid());
