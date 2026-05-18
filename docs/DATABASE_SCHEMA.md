# Database Schema — Dugout

Supabase (PostgreSQL) schema for the Dugout MVP. All tables use Row Level Security.

---

## Tables

### `profiles`

Extends Supabase `auth.users`. Created automatically via trigger on sign-up.

```sql
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
```

**RLS**: Users can read all profiles. Users can only update their own profile.

---

### `teams`

A team represents a baseball team for a season.

```sql
create table teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  sport       text not null default 'baseball',
  season      text,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
```

**RLS**: Team members can read their own teams. Only admins can update/delete.

---

### `team_members`

Junction table linking users to teams with a role.

```sql
create type team_role as enum ('admin', 'coach', 'manager', 'player', 'parent');

create table team_members (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references teams(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        team_role not null default 'parent',
  joined_at   timestamptz default now(),
  unique(team_id, user_id)
);
```

**RLS**: Members can see other members in their team. Admins can insert/delete.

---

### `team_invites`

Invite tokens for joining a team.

```sql
create table team_invites (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references teams(id) on delete cascade,
  token       text not null unique default gen_random_uuid()::text,
  role        team_role not null default 'parent',
  created_by  uuid references profiles(id) on delete set null,
  expires_at  timestamptz,
  used_at     timestamptz,
  created_at  timestamptz default now()
);
```

**RLS**: Admins can create/read invites for their team. Public read by token (for join flow).

---

### `events`

Games, practices, and tournaments.

```sql
create type event_type as enum ('game', 'practice', 'tournament', 'other');

create table events (
  id           uuid primary key default gen_random_uuid(),
  team_id      uuid not null references teams(id) on delete cascade,
  title        text not null,
  type         event_type not null default 'practice',
  description  text,
  location     text,
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
```

**RLS**: Team members can read events. Coaches/admins can insert/update/delete.

---

### `attendance`

RSVP records per event per user.

```sql
create type attendance_status as enum ('yes', 'no', 'maybe');

create table attendance (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  status      attendance_status not null,
  note        text,
  updated_at  timestamptz default now(),
  unique(event_id, user_id)
);
```

**RLS**: Users can read all attendance for team events. Users can insert/update own record.

---

### `announcements`

Team-wide posts from coaches or admins.

```sql
create table announcements (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references teams(id) on delete cascade,
  author_id   uuid references profiles(id) on delete set null,
  title       text not null,
  body        text not null,
  pinned      boolean not null default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
```

**RLS**: Team members can read. Coaches/admins can insert/update/delete.

---

### `walkup_songs`

Each player's walk-up song selection.

```sql
create table walkup_songs (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references teams(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  song_title  text not null,
  artist      text,
  url         text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(team_id, user_id)
);
```

**RLS**: Team members can read all songs. Users can insert/update own song. Admins can delete any.

---

### `payments`

Payment requests created by team admins.

```sql
create type payment_status as enum ('pending', 'paid', 'waived', 'overdue');

create table payments (
  id                 uuid primary key default gen_random_uuid(),
  team_id            uuid not null references teams(id) on delete cascade,
  user_id            uuid not null references profiles(id) on delete cascade,
  amount_cents       integer not null,
  description        text not null,
  due_date           date,
  status             payment_status not null default 'pending',
  stripe_session_id  text,
  paid_at            timestamptz,
  created_by         uuid references profiles(id) on delete set null,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
```

**RLS**: Users can read own payments. Admins can read all team payments and create/update.

---

## Migrations Strategy

- All schema changes via numbered migration files: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
- Never edit existing migration files
- Use `supabase db push` in development
- Use `supabase db push --linked` for production

---

## RLS Policy Patterns

### Pattern: "member can read, admin can write"

```sql
-- Read: team members only
create policy "team_members_select" on [table]
  for select using (
    exists (
      select 1 from team_members
      where team_members.team_id = [table].team_id
      and team_members.user_id = auth.uid()
    )
  );

-- Insert/Update/Delete: admins or coaches only
create policy "team_admins_write" on [table]
  for all using (
    exists (
      select 1 from team_members
      where team_members.team_id = [table].team_id
      and team_members.user_id = auth.uid()
      and team_members.role in ('admin', 'coach')
    )
  );
```

---

## Indexes

Priority indexes for query performance:

```sql
create index on team_members (team_id);
create index on team_members (user_id);
create index on events (team_id, starts_at);
create index on attendance (event_id);
create index on announcements (team_id, created_at desc);
create index on payments (team_id, status);
create index on payments (user_id, status);
```
