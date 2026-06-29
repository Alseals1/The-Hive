-- Invite lifecycle cleanup.
--
-- Changes:
--   1. accept_team_invite now DELETEs the invite row instead of setting used_at.
--      A used invite disappears immediately — no ghost rows.
--   2. A cleanup function removes any expired invites that were never accepted.
--   3. pg_cron (available on all Supabase plans) runs the cleanup every hour.
--      The cron setup is wrapped in a DO block so the migration doesn't fail if
--      pg_cron hasn't been enabled yet — enable it in the dashboard extension list
--      and re-run if needed.

-- ── 1. Update accept_team_invite to DELETE instead of marking used_at ────────

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

  insert into public.profiles (id, full_name)
  select v_user_id,
         (select raw_user_meta_data ->> 'full_name' from auth.users where id = v_user_id)
  on conflict (id) do nothing;

  insert into public.team_members (team_id, user_id, role)
  values (v_invite.team_id, v_user_id, v_invite.role)
  on conflict (team_id, user_id) do nothing;

  -- Delete instead of marking used_at — no dead rows accumulate.
  delete from public.team_invites where id = v_invite.id;

  return v_invite.team_id;
end;
$$;

-- ── 2. Cleanup function — deletes all expired invite rows ────────────────────

create or replace function public.cleanup_expired_invites()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.team_invites
  where expires_at is not null
    and expires_at < now();
$$;

-- ── 3. Schedule hourly cleanup via pg_cron ───────────────────────────────────
-- If pg_cron is not yet enabled (Dashboard → Extensions → pg_cron), this block
-- is skipped silently — enable it and re-run to activate the schedule.

do $$
begin
  if exists (
    select 1 from pg_extension where extname = 'pg_cron'
  ) then
    perform cron.schedule(
      'cleanup-expired-invites',
      '0 * * * *',
      'select public.cleanup_expired_invites()'
    );
  end if;
end;
$$;
