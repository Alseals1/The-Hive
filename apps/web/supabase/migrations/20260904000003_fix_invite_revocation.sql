-- Fix Vuln 3: add DELETE RLS policy on team_invites so revokeInvite()
-- actually removes the row instead of silently no-oping.
-- Previously RLS was enabled with no DELETE policy, causing Supabase to
-- silently block all client-side deletes and return success with 0 rows.

create policy "team_invites_delete_admin"
  on public.team_invites for delete
  to authenticated
  using (public.is_team_admin(team_id));
