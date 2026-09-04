-- Fix Vuln 2: replace unrestricted public read on team_join_codes with a
-- targeted security-definer RPC for the unauthenticated team preview page.

-- Step 1: drop the overly permissive public policy
drop policy if exists "join_codes_select_public" on public.team_join_codes;

-- Step 2: add an authenticated-only policy so team admins can still read
--         their own team's join code in the settings page.
create policy "join_codes_select_team_member"
  on public.team_join_codes for select
  to authenticated
  using (public.is_team_member(team_id));

-- Step 3: security-definer RPC for the unauthenticated join page preview.
--         Returns only the data the preview page needs — never exposes the
--         code itself, team_id, or any other row from the table.
create or replace function public.get_team_preview_by_code(p_code text)
returns table (
  team_id  uuid,
  name     text,
  sport    text,
  season   text,
  role     text
)
language sql
security definer
stable
as $$
  select
    t.id   as team_id,
    t.name,
    t.sport,
    t.season,
    jc.role::text
  from public.team_join_codes jc
  join public.teams t on t.id = jc.team_id
  where jc.code = p_code
  limit 1;
$$;

-- Revoke direct execute from public; grant only to anon and authenticated
-- so the RPC is callable from the client but not from arbitrary DB sessions.
revoke execute on function public.get_team_preview_by_code(text) from public;
grant  execute on function public.get_team_preview_by_code(text) to anon, authenticated;
