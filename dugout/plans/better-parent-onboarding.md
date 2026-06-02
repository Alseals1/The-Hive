# Plan: Better Parent Onboarding

## Context

The current invite flow generates single-use, 7-day-expiry token links that the team mom manually copies and sends to parents. This is broken for the actual sharing channels used (WhatsApp group chats, in-person at practice, iMessage threads) — because the link is single-use, only the first parent to tap it can join. Every other parent gets a dead link.

The goal is to replace this with a permanent team join code + QR code that any number of parents can use simultaneously, while keeping the existing single-use invite flow for controlled-role invites (coach, manager).

## Decisions (from user interview)

| Decision          | Choice                                                         |
| ----------------- | -------------------------------------------------------------- |
| Invite model      | Permanent, multi-use team join code (e.g. `CUBS24`)            |
| Sharing format    | QR code + text code shown together                             |
| No-account flow   | Team preview → tap Join → signup → auto-join as `parent`       |
| Roster visibility | Admin sees "Pending" section with expected-member placeholders |
| Code reset        | Admin can regenerate code anytime; old code dies immediately   |

## Architecture

Two parallel join paths exist after this change:

```
Group-chat / in-person (parents)     Controlled (coaches / managers)
        |                                         |
  /join/$code                           /invite/$token  (unchanged)
        |                                         |
  team_join_codes table                 team_invites table (unchanged)
        |
  expected_members table  ←── admin CRUD
        |
  roster "Pending" section
```

## Database Changes

**New file:** `dugout/supabase/migrations/20260601000001_parent_onboarding.sql`

### `team_join_codes` table

```sql
create table public.team_join_codes (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  code        text not null unique,          -- e.g. "CUBS24", always upper-cased
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique(team_id)
);
create index on public.team_join_codes (code);
alter table public.team_join_codes enable row level security;
-- Public read (no auth) so the team preview page works unauthenticated
create policy "join_codes_select_public" on public.team_join_codes for select using (true);
-- Only team admins can insert / update
create policy "join_codes_write_admins" on public.team_join_codes for all
  to authenticated using (public.is_team_admin(team_id)) with check (public.is_team_admin(team_id));
```

_Why separate table and not a column on `teams`_: The teams RLS gates reads on being a member. A separate table with `using (true)` exposes only the join code to the public, avoiding leaking the full teams row to unauthenticated users.

### `expected_members` table

```sql
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
create policy "expected_members_select" on public.expected_members for select
  to authenticated using (public.is_team_member(team_id));
create policy "expected_members_write" on public.expected_members for all
  to authenticated using (public.is_team_admin(team_id)) with check (public.is_team_admin(team_id));
```

### New `team_members` insert policy

The existing policy requires `is_team_admin()`. Parents joining by code insert themselves:

```sql
create policy "team_members_insert_self_via_code" on public.team_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'parent'
    and exists (select 1 from public.team_join_codes where team_id = team_members.team_id)
  );
```

## Service Layer

**New:** `dugout/src/features/teams/services/joinCode.ts`

- `generateJoinCode(teamId)` — upserts a new 6-char code (no O/0, I/1 ambiguity), returns the code
- `getTeamByJoinCode(code)` — anon-safe join to `teams`, returns `{ teamId, name, sport, season }`
- `joinTeamByCode(code, userId)` — looks up the team, inserts into `team_members` as `parent`, handles duplicate gracefully, returns `teamId`

**New:** `dugout/src/features/teams/services/expectedMembers.ts`

- `getExpectedMembers(teamId)`, `addExpectedMember(teamId, name, note?)`, `deleteExpectedMember(id)`

## Hook Layer

**New:** `dugout/src/features/teams/hooks/useJoinCode.ts`

- `useJoinCode(teamId)`, `useGenerateJoinCode(teamId)`, `useTeamByJoinCode(code)`, `useJoinTeamByCode()`

**New:** `dugout/src/features/teams/hooks/useExpectedMembers.ts`

- `useExpectedMembers(teamId)`, `useAddExpectedMember(teamId)`, `useDeleteExpectedMember(teamId)`

## New Route

**New:** `dugout/src/routes/join/$code.tsx`

- Public (add `/join/` to `publicPaths` in `__root.tsx`)
- State machine: loading → invalid code → team preview → join button (authed) or signup/login buttons (no session)
- Before navigating to auth: `sessionStorage.setItem("join_code", code)` — mirrors existing `invite_token` pattern
- After signup/login: read `join_code`, navigate to `/join/$code`, clear it

**Modify:** `dugout/src/routes/__root.tsx` — add `/join/` to public paths check

**Modify:** `dugout/src/routes/auth/signup.tsx` and `login.tsx` — add `join_code` session-storage branch parallel to existing `invite_token` branch

## UI Changes

### InviteSheet — tabbed redesign

**Modify:** `dugout/src/features/teams/components/InviteSheet.tsx`

Two tabs:

1. **"Join Code"** (default): shows join code in large display font, QR code (`QRCodeSVG` from `qrcode.react`), copy URL button, "Reset code" button (with confirm-on-second-tap)
2. **"Role Invite"**: existing single-use invite flow, unchanged — for coach/manager invites

Add `qrcode.react` to `dugout/package.json` dependencies.

### Roster — Pending section

**New:** `dugout/src/features/roster/components/ExpectedMemberRow.tsx`

- Shows placeholder name + "Pending" badge (muted styling) + delete icon for admins

**New:** `dugout/src/features/teams/components/AddExpectedMemberSheet.tsx`

- Name input + optional note input → `useAddExpectedMember`

**Modify:** `dugout/src/features/roster/components/RosterPage.tsx`

- Fetch `useExpectedMembers(teamId)` when `canInvite`
- Add "Add Expected Member" trigger button
- Pass expected members to `RosterList`

**Modify:** `dugout/src/features/roster/components/RosterList.tsx`

- Add "Pending" section after confirmed members (admin-only)

**Modify:** `dugout/src/features/roster/types/index.ts` — add `ExpectedMember` type

## Implementation Order

1. **DB migration** — write and push `20260601000001_parent_onboarding.sql`, re-run `supabase gen types`
2. **Service + hook layer** — `joinCode.ts`, `expectedMembers.ts`, their hooks
3. **Public join route** — `join/$code.tsx`, update `__root.tsx`, update `signup.tsx` + `login.tsx`
4. **InviteSheet redesign** — add `qrcode.react`, tabbed layout with QR code + reset
5. **Roster pending section** — `ExpectedMemberRow`, `AddExpectedMemberSheet`, update `RosterPage` + `RosterList`

Each phase is independently deployable. Phase 1 (DB) must complete before anything goes to production.

## Verification

1. Generate a join code on any team → copy the URL → open incognito → land on team preview → tap "Join Team" → complete signup → confirm auto-joined as `parent` and redirected to schedule
2. Open the same URL in a second incognito window simultaneously → confirm both parents can join (no single-use blocking)
3. Screenshot the QR code → scan it on a phone → confirm the team preview loads
4. Reset the code → confirm old URL no longer works → confirm new code generates a new URL that works
5. Add an expected member placeholder → confirm it appears in Roster "Pending" section → have a parent join → manually delete the placeholder
6. Generate a role invite link (Tab 2) for a coach → confirm existing flow is unchanged
