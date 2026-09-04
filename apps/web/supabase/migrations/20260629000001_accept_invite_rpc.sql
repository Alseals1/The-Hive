-- Atomic invite acceptance RPC.
--
-- Eliminates the TOCTOU race in the old multi-step client flow by:
--   1. Locking the invite row (SELECT … FOR UPDATE) so concurrent callers serialise.
--   2. Enforcing used_at IS NULL and server-side expiry inside the same transaction.
--   3. Inserting the team member and marking the invite used before the lock releases.
--
-- SECURITY DEFINER is required so the joining user (not an admin) can:
--   • UPDATE team_invites.used_at  (blocked by team_invites_update_admins RLS policy)
--   • INSERT into team_members     (blocked by team_members_insert_admins RLS policy)
--
-- The function derives the acting user from auth.uid() so callers cannot impersonate
-- another user by passing a different user_id.

create or replace function public.accept_team_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  -- Lock the invite row for the duration of this transaction.
  -- A second concurrent call will block here until the first commits,
  -- then see used_at IS NOT NULL and raise INVITE_ALREADY_USED.
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

  -- Ensure a profile row exists (the auth trigger normally handles this,
  -- but guard against edge cases such as social-login timing).
  insert into public.profiles (id, full_name)
  select v_user_id,
         (select raw_user_meta_data ->> 'full_name' from auth.users where id = v_user_id)
  on conflict (id) do nothing;

  -- Insert the team member; silently no-op when the user is already a member.
  insert into public.team_members (team_id, user_id, role)
  values (v_invite.team_id, v_user_id, v_invite.role)
  on conflict (team_id, user_id) do nothing;

  -- Mark the invite as used so no further acceptances are possible.
  update public.team_invites
  set    used_at = now()
  where  id = v_invite.id;

  return v_invite.team_id;
end;
$$;

grant execute on function public.accept_team_invite(text) to authenticated;
