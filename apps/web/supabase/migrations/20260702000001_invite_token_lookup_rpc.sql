-- Fix invite token enumeration.
--
-- The old team_invites_select_by_token policy had no token predicate, so any
-- client (including anonymous) could SELECT every active invite and harvest
-- its token + role. Replace the table-level read with a SECURITY DEFINER RPC
-- keyed on the token: callers must already know a token to learn anything,
-- and the function returns only the preview fields the invite page renders.

drop policy if exists "team_invites_select_by_token" on public.team_invites;

create or replace function public.get_invite_by_token(p_token text)
returns table (
  role        public.team_role,
  expires_at  timestamptz,
  team_name   text,
  team_sport  text,
  team_season text
)
language sql
security definer
set search_path = public
stable
as $$
  select ti.role, ti.expires_at, t.name, t.sport, t.season
  from   public.team_invites ti
  join   public.teams t on t.id = ti.team_id
  where  ti.token = p_token
    and  ti.used_at is null
    and  (ti.expires_at is null or ti.expires_at > now());
$$;

revoke execute on function public.get_invite_by_token(text) from public;
grant execute on function public.get_invite_by_token(text) to anon, authenticated;
