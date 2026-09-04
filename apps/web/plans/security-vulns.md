# Security Vulnerabilities — Backlog

Findings from security review. Tackle one at a time.

---

## [x] Vuln 1: Any Authenticated User Can Create Teams (HIGH)

**File:** `supabase/migrations/20260518000004_fix_teams_rls.sql`

The teams INSERT RLS policy uses `with check (true)`. The `can_create_team` flag on `profiles` is only enforced client-side — never in the database. Any authenticated user can bypass the UI gate and insert directly via the Supabase REST API.

**Fix:** Replace the INSERT policy with one that checks `can_create_team = true` on the calling user's profile row.

---

## [ ] Vuln 2: All Join Codes Readable Without Authentication (HIGH)

**File:** `supabase/migrations/20260601000001_parent_onboarding.sql`

The `join_codes_select_public` RLS policy uses `using (true)` with no role restriction. An unauthenticated client can dump every active join code in a single query, then sign up and join any team — exposing roster, schedules, announcements, and payment data (likely children's PII).

**Fix:** Drop the permissive policy. Restrict SELECT to authenticated users, or expose a `security definer` RPC for the team preview page that returns only non-sensitive fields.

---

## [ ] Vuln 3: Invite Revocation Silently Fails (MEDIUM)

**Files:** `supabase/migrations/20260518000002_create_teams.sql`, `src/features/teams/services/invites.ts`

No DELETE RLS policy exists on `team_invites`. Supabase silently ignores deletes when no matching policy exists and returns success with no error. `revokeInvite()` reports success but the invite row is never removed — revoked links stay valid for their full 24-hour window.

**Fix:** Add a DELETE RLS policy for team admins. Also add a row-count check in `revokeInvite()` to surface silent failures.
