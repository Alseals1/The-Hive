-- Allow unauthenticated (and pre-join authenticated) users to read basic team
-- info for the join-code and invite-token preview pages.
--
-- The existing teams_select_members policy restricts all team reads to current
-- members, which blocks the join flow: getTeamByJoinCode and getInviteByToken
-- both embed a teams(...) join, and without a public read policy the join
-- silently returns null, making every valid code appear invalid.
--
-- This policy gates the public read on the presence of an active join code or
-- invite for that team so arbitrary teams are not exposed.

create policy "teams_select_public_preview"
  on public.teams for select
  using (
    exists (
      select 1
      from   public.team_join_codes tjc
      where  tjc.team_id = teams.id
    )
    or exists (
      select 1
      from   public.team_invites ti
      where  ti.team_id  = teams.id
        and  ti.used_at  is null
        and  (ti.expires_at is null or ti.expires_at > now())
    )
  );
