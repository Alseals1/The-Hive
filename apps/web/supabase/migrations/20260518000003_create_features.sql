-- events, attendance, announcements, walkup_songs, payments

-- Enums
create type public.event_type as enum ('game', 'practice', 'tournament', 'other');
create type public.attendance_status as enum ('yes', 'no', 'maybe');
create type public.payment_status as enum ('pending', 'paid', 'waived', 'overdue');

-- events
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  team_id      uuid not null references public.teams(id) on delete cascade,
  title        text not null,
  type         public.event_type not null default 'practice',
  description  text,
  location     text,
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index on public.events (team_id, starts_at);

create trigger set_events_updated_at
  before update on public.events
  for each row execute function public.update_updated_at_column();

alter table public.events enable row level security;

create policy "events_select_members"
  on public.events for select to authenticated
  using (public.is_team_member(team_id));

create policy "events_write_admins"
  on public.events for all to authenticated
  using (public.is_team_admin(team_id))
  with check (public.is_team_admin(team_id));

-- attendance
create table if not exists public.attendance (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  status      public.attendance_status not null,
  note        text,
  updated_at  timestamptz not null default now(),
  unique(event_id, user_id)
);

create index on public.attendance (event_id);
create index on public.attendance (user_id, event_id);

create trigger set_attendance_updated_at
  before update on public.attendance
  for each row execute function public.update_updated_at_column();

alter table public.attendance enable row level security;

-- Members can read attendance for events on their teams
create policy "attendance_select_members"
  on public.attendance for select to authenticated
  using (
    exists (
      select 1 from public.events e
      join public.team_members tm on tm.team_id = e.team_id
      where e.id = attendance.event_id
        and tm.user_id = auth.uid()
    )
  );

-- Users can upsert their own attendance
create policy "attendance_upsert_own"
  on public.attendance for insert to authenticated
  with check (user_id = auth.uid());

create policy "attendance_update_own"
  on public.attendance for update to authenticated
  using (user_id = auth.uid());

-- announcements
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  title       text not null,
  body        text not null,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index on public.announcements (team_id, created_at desc);

create trigger set_announcements_updated_at
  before update on public.announcements
  for each row execute function public.update_updated_at_column();

alter table public.announcements enable row level security;

create policy "announcements_select_members"
  on public.announcements for select to authenticated
  using (public.is_team_member(team_id));

create policy "announcements_write_admins"
  on public.announcements for all to authenticated
  using (public.is_team_admin(team_id))
  with check (public.is_team_admin(team_id));

-- walkup_songs
create table if not exists public.walkup_songs (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  song_title  text not null,
  artist      text,
  url         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(team_id, user_id)
);

create trigger set_walkup_songs_updated_at
  before update on public.walkup_songs
  for each row execute function public.update_updated_at_column();

alter table public.walkup_songs enable row level security;

create policy "walkup_songs_select_members"
  on public.walkup_songs for select to authenticated
  using (public.is_team_member(team_id));

create policy "walkup_songs_upsert_own"
  on public.walkup_songs for insert to authenticated
  with check (user_id = auth.uid() and public.is_team_member(team_id));

create policy "walkup_songs_update_own"
  on public.walkup_songs for update to authenticated
  using (user_id = auth.uid());

create policy "walkup_songs_delete_admins"
  on public.walkup_songs for delete to authenticated
  using (user_id = auth.uid() or public.is_team_admin(team_id));

-- payments
create table if not exists public.payments (
  id                 uuid primary key default gen_random_uuid(),
  team_id            uuid not null references public.teams(id) on delete cascade,
  user_id            uuid not null references public.profiles(id) on delete cascade,
  amount_cents       integer not null check (amount_cents > 0),
  description        text not null,
  due_date           date,
  status             public.payment_status not null default 'pending',
  stripe_session_id  text,
  paid_at            timestamptz,
  created_by         uuid references public.profiles(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index on public.payments (team_id, status);
create index on public.payments (user_id, status);

create trigger set_payments_updated_at
  before update on public.payments
  for each row execute function public.update_updated_at_column();

alter table public.payments enable row level security;

-- Users can read their own payments
create policy "payments_select_own"
  on public.payments for select to authenticated
  using (user_id = auth.uid() or public.is_team_admin(team_id));

-- Admins can create payment requests
create policy "payments_insert_admins"
  on public.payments for insert to authenticated
  with check (public.is_team_admin(team_id));

-- Admins can update (e.g. mark waived); system updates status via service role
create policy "payments_update_admins"
  on public.payments for update to authenticated
  using (public.is_team_admin(team_id));
