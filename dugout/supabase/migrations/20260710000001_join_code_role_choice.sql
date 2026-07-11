-- Let a joiner pick their own role (Player / Parent-Guardian / Manager) when
-- redeeming a team's join code, instead of always getting whatever role the
-- code happens to be configured with (default 'parent'). This is how a real
-- team ends up with any "Player" entries on the roster at all — previously
-- the only way was an admin manually reassigning someone's role after the
-- fact, or generating a separate single-use "Role Invite" link.
--
-- Security: the requested role is restricted server-side to the three
-- self-serve roles. A public join code must never be able to grant 'admin'
-- or 'coach' — those still require an explicit role-invite link or an
-- existing admin's Change Role action.

-- create or replace does not drop a function whose parameter list changed —
-- Postgres treats a different signature as a distinct overload. Drop the old
-- single-arg version explicitly so exactly one join_team_by_code remains
-- (otherwise PostgREST has two candidates to resolve an RPC call against).
drop function if exists public.join_team_by_code(text);

create or replace function public.join_team_by_code(p_code text, p_role public.team_role default null)
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

  if p_role is not null and p_role not in ('player', 'parent', 'manager') then
    raise exception 'INVALID_ROLE';
  end if;

  select t.id, jc.role
  into   v_team_id, v_role
  from   public.team_join_codes jc
  join   public.teams t on t.id = jc.team_id
  where  jc.code = p_code;

  if v_team_id is null then
    raise exception 'INVALID_CODE';
  end if;

  -- Joiner's choice wins when provided; otherwise fall back to the code's
  -- configured role (preserves behavior for any caller that omits p_role).
  v_role := coalesce(p_role, v_role);

  -- Pre-check: signal explicitly so the client can redirect instead of error.
  if exists (
    select 1 from public.team_members
    where  team_id = v_team_id
      and  user_id = v_user_id
  ) then
    raise exception 'ALREADY_MEMBER';
  end if;

  select raw_user_meta_data ->> 'full_name' into v_full_name
  from   auth.users
  where  id = v_user_id;

  insert into public.profiles (id, full_name)
  values (v_user_id, v_full_name)
  on conflict (id) do nothing;

  insert into public.team_members (team_id, user_id, role)
  values (v_team_id, v_user_id, v_role);

  perform public.claim_expected_member(v_team_id, v_user_id, coalesce(v_full_name, ''));

  return v_team_id;
end;
$$;

-- Defense-in-depth: the RPC above is SECURITY DEFINER and bypasses RLS for
-- its own insert, so this policy is not the actual enforcement point for the
-- join-by-code path — but keep it accurate (and safe on its own) in case
-- anything ever inserts into team_members directly instead of via the RPC.
drop policy if exists "team_members_insert_self_via_code" on public.team_members;

create policy "team_members_insert_self_via_code"
  on public.team_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role in ('player', 'parent', 'manager')
    and exists (
      select 1
      from   public.team_join_codes tjc
      where  tjc.team_id = team_members.team_id
    )
  );
