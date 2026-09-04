-- teams, team_members, and team_invites

-- Enums
create type public.team_role as enum ('admin', 'coach', 'manager', 'player', 'parent');

-- teams
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  sport       text not null default 'baseball',
  season      text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger set_teams_updated_at
  before update on public.teams
  for each row execute function public.update_updated_at_column();

-- team_members
create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role        public.team_role not null default 'parent',
  joined_at   timestamptz not null default now(),
  unique(team_id, user_id)
);

create index on public.team_members (team_id);
create index on public.team_members (user_id);

-- team_invites
create table if not exists public.team_invites (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  token       text not null unique default gen_random_uuid()::text,
  role        public.team_role not null default 'parent',
  created_by  uuid references public.profiles(id) on delete set null,
  expires_at  timestamptz,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- RLS: teams

alter table public.teams enable row level security;

-- Helper functions for RLS
create or replace function public.is_team_member(p_team_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id
      and user_id = auth.uid()
  )
$$ language sql security definer stable;

create or replace function public.is_team_admin(p_team_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id
      and user_id = auth.uid()
      and role in ('admin', 'coach')
  )
$$ language sql security definer stable;

create policy "teams_select_members"
  on public.teams for select
  to authenticated
  using (public.is_team_member(id));

create policy "teams_insert_authenticated"
  on public.teams for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "teams_update_admins"
  on public.teams for update
  to authenticated
  using (public.is_team_admin(id));

create policy "teams_delete_admins"
  on public.teams for delete
  to authenticated
  using (public.is_team_admin(id));

-- RLS: team_members

alter table public.team_members enable row level security;

create policy "team_members_select"
  on public.team_members for select
  to authenticated
  using (public.is_team_member(team_id));

create policy "team_members_insert_admins"
  on public.team_members for insert
  to authenticated
  with check (public.is_team_admin(team_id));

create policy "team_members_delete_admins"
  on public.team_members for delete
  to authenticated
  using (public.is_team_admin(team_id) or user_id = auth.uid());

-- RLS: team_invites

alter table public.team_invites enable row level security;

create policy "team_invites_select_admins"
  on public.team_invites for select
  to authenticated
  using (public.is_team_admin(team_id));

-- Allow unauthenticated read by token (for join flow)
create policy "team_invites_select_by_token"
  on public.team_invites for select
  using (used_at is null and (expires_at is null or expires_at > now()));

create policy "team_invites_insert_admins"
  on public.team_invites for insert
  to authenticated
  with check (public.is_team_admin(team_id));

create policy "team_invites_update_admins"
  on public.team_invites for update
  to authenticated
  using (public.is_team_admin(team_id));
