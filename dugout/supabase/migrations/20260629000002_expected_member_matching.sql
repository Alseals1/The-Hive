-- Expected member matching system.
--
-- Adds linking columns to expected_members so a placeholder can be tied to a
-- real user when they join.  Introduces three database functions:
--
--   claim_expected_member(team_id, user_id, full_name)
--     Finds the oldest unclaimed expected_member whose name matches (case-
--     insensitive) and atomically claims it.  Called by both join flows.
--
--   join_team_by_code(code)
--     Atomic replacement for the multi-step client joinTeamByCode function.
--     Resolves the team, ensures the profile, inserts the member, then
--     attempts to claim a matching expected_member.
--
--   accept_team_invite(token)   [CREATE OR REPLACE of the previous version]
--     Updated to call claim_expected_member after inserting the member.

-- ── Schema ────────────────────────────────────────────────────────────────────

alter table public.expected_members
  add column linked_user_id uuid references public.profiles(id) on delete set null,
  add column claimed_at     timestamptz;

create index on public.expected_members (team_id, linked_user_id);

-- ── Helper: claim_expected_member ─────────────────────────────────────────────
-- Returns the claimed expected_member.id, or NULL when no name match exists.
-- SKIP LOCKED means two simultaneous joins with the same name each get their
-- own row (or NULL) rather than deadlocking.

create or replace function public.claim_expected_member(
  p_team_id  uuid,
  p_user_id  uuid,
  p_full_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_full_name = '' then
    return null;
  end if;

  select id into v_id
  from   public.expected_members
  where  team_id        = p_team_id
    and  linked_user_id is null
    and  lower(trim(name)) = lower(trim(p_full_name))
  order  by created_at
  limit  1
  for    update skip locked;

  if v_id is null then
    return null;
  end if;

  update public.expected_members
  set    linked_user_id = p_user_id,
         claimed_at     = now()
  where  id = v_id;

  return v_id;
end;
$$;

grant execute on function public.claim_expected_member(uuid, uuid, text) to authenticated;

-- ── RPC: join_team_by_code ────────────────────────────────────────────────────
-- Atomic replacement for the multi-step client-side joinTeamByCode.

create or replace function public.join_team_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid;
  v_team_id   uuid;
  v_full_name text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select t.id into v_team_id
  from   public.team_join_codes jc
  join   public.teams t on t.id = jc.team_id
  where  jc.code = p_code;

  if v_team_id is null then
    raise exception 'INVALID_CODE';
  end if;

  select raw_user_meta_data ->> 'full_name' into v_full_name
  from   auth.users
  where  id = v_user_id;

  -- Ensure profile exists (auth trigger handles this normally)
  insert into public.profiles (id, full_name)
  values (v_user_id, v_full_name)
  on conflict (id) do nothing;

  -- Insert as parent; no-op if already a member
  insert into public.team_members (team_id, user_id, role)
  values (v_team_id, v_user_id, 'parent')
  on conflict (team_id, user_id) do nothing;

  -- Attempt name-based expected member match
  perform public.claim_expected_member(v_team_id, v_user_id, coalesce(v_full_name, ''));

  return v_team_id;
end;
$$;

grant execute on function public.join_team_by_code(text) to authenticated;

-- ── RPC: accept_team_invite (updated) ────────────────────────────────────────
-- Replaces the version from 20260629000001 to add claim_expected_member call.

create or replace function public.accept_team_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite    record;
  v_user_id   uuid;
  v_full_name text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select id, team_id, role, used_at, expires_at
  into   v_invite
  from   public.team_invites
  where  token = p_token
  for    update;

  if not found then
    raise exception 'INVITE_NOT_FOUND';
  end if;

  if v_invite.used_at is not null then
    raise exception 'INVITE_ALREADY_USED';
  end if;

  if v_invite.expires_at is not null and v_invite.expires_at < now() then
    raise exception 'INVITE_EXPIRED';
  end if;

  select raw_user_meta_data ->> 'full_name' into v_full_name
  from   auth.users
  where  id = v_user_id;

  insert into public.profiles (id, full_name)
  values (v_user_id, v_full_name)
  on conflict (id) do nothing;

  insert into public.team_members (team_id, user_id, role)
  values (v_invite.team_id, v_user_id, v_invite.role)
  on conflict (team_id, user_id) do nothing;

  -- Attempt name-based expected member match
  perform public.claim_expected_member(v_invite.team_id, v_user_id, coalesce(v_full_name, ''));

  update public.team_invites
  set    used_at = now()
  where  id = v_invite.id;

  return v_invite.team_id;
end;
$$;
