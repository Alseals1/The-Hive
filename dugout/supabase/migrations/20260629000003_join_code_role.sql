-- Make the join code role dynamic.
--
-- Previously everyone who joined via a join code was hardcoded to 'parent'.
-- This migration:
--   1. Adds a `role` column to team_join_codes (default 'parent' preserves
--      all existing codes).
--   2. Updates the team_members_insert_self_via_code RLS policy so the
--      self-insert role must match what the join code specifies (the check is
--      defense-in-depth; the SECURITY DEFINER RPC already bypasses RLS).
--   3. Replaces join_team_by_code to read role from the code row instead of
--      hardcoding 'parent'.

-- ── Schema ────────────────────────────────────────────────────────────────────

alter table public.team_join_codes
  add column role public.team_role not null default 'parent';

-- ── RLS: update self-insert policy ───────────────────────────────────────────
-- Drop the old policy that locked the role to 'parent', replace it with one
-- that accepts whatever role the join code specifies.

drop policy if exists "team_members_insert_self_via_code" on public.team_members;

create policy "team_members_insert_self_via_code"
  on public.team_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from   public.team_join_codes tjc
      where  tjc.team_id = team_members.team_id
        and  tjc.role    = team_members.role
    )
  );

-- ── RPC: join_team_by_code (updated) ─────────────────────────────────────────
-- Reads role from team_join_codes; no longer hardcodes 'parent'.

create or replace function public.join_team_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid;
  v_team_id   uuid;
  v_role      public.team_role;
  v_full_name text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select t.id, jc.role
  into   v_team_id, v_role
  from   public.team_join_codes jc
  join   public.teams t on t.id = jc.team_id
  where  jc.code = p_code;

  if v_team_id is null then
    raise exception 'INVALID_CODE';
  end if;

  select raw_user_meta_data ->> 'full_name' into v_full_name
  from   auth.users
  where  id = v_user_id;

  insert into public.profiles (id, full_name)
  values (v_user_id, v_full_name)
  on conflict (id) do nothing;

  -- Use the role stored on the join code
  insert into public.team_members (team_id, user_id, role)
  values (v_team_id, v_user_id, v_role)
  on conflict (team_id, user_id) do nothing;

  perform public.claim_expected_member(v_team_id, v_user_id, coalesce(v_full_name, ''));

  return v_team_id;
end;
$$;
