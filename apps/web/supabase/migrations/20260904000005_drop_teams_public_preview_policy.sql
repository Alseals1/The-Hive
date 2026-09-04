-- Fix #61: drop teams_select_public_preview — it is dead code.
--
-- Both unauthenticated preview flows already use security-definer RPCs
-- that bypass RLS and never touch the teams table directly:
--   • /join/:code  → get_team_preview_by_code (migration 20260904000002)
--   • /invite/:token → get_invite_by_token    (migration 20260702000001)
--
-- The policy claimed to gate reads on "the presence of an active join
-- code or invite", but it checked only for existence (any join code),
-- making teams effectively world-readable. Dropping it restores the
-- original teams_select_members policy as the sole read gate — only
-- current team members can SELECT from public.teams.

drop policy if exists "teams_select_public_preview" on public.teams;
