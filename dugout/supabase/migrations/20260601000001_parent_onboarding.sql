-- Create team_join_codes table for permanent, multi-use team join codes
create table public.team_join_codes (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  code        text not null unique,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique(team_id)
);

create index on public.team_join_codes (code);
alter table public.team_join_codes enable row level security;

-- Public read (no auth) so the team preview page works unauthenticated
create policy "join_codes_select_public"
  on public.team_join_codes for select
  using (true);

-- Only team admins can insert / update
create policy "join_codes_write_admins"
  on public.team_join_codes for all
  to authenticated
  using (public.is_team_admin(team_id))
  with check (public.is_team_admin(team_id));

-- Create expected_members table for admin to track who should join
create table public.expected_members (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  name        text not null,
  note        text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index on public.expected_members (team_id);
alter table public.expected_members enable row level security;

-- Team members can read expected members
create policy "expected_members_select"
  on public.expected_members for select
  to authenticated
  using (public.is_team_member(team_id));

-- Only admins/coaches can manage expected members
create policy "expected_members_write"
  on public.expected_members for all
  to authenticated
  using (public.is_team_admin(team_id))
  with check (public.is_team_admin(team_id));

-- Allow parents to join via team join code
-- They can only insert themselves, only as parent role, and only when a join code exists
create policy "team_members_insert_self_via_code"
  on public.team_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'parent'
    and exists (
      select 1 from public.team_join_codes
      where team_id = team_members.team_id
    )
  );
