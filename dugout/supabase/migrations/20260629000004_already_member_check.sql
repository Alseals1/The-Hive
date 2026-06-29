-- Add pre-check in join_team_by_code so the RPC signals ALREADY_MEMBER
-- explicitly before attempting the insert, rather than relying on the
-- ON CONFLICT DO NOTHING clause to silently swallow duplicates.
--
-- The front-end catches ALREADY_MEMBER and shows a friendly message
-- ("You are already on this team") instead of treating it as an error.

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
