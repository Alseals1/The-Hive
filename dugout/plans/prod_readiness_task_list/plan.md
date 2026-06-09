# Dugout — Production Readiness Plan

## Context

Three deep-audit subagents reviewed all features, the Supabase schema, and infra. The goal is to identify everything blocking real "team mom" users from successfully using Dugout, and prioritize ruthlessly for a soft launch. The app is well-architected but has critical gaps in auth recovery, attendance visibility, and payments.

**Overall readiness by feature:**

| Feature | Readiness | Blocking Issue |
|---|---|---|
| Auth | 65% | No password reset → permanent lockout |
| Teams | 80% | No member role change or removal |
| Schedule | 85% | Minor gaps only |
| Attendance | 40% | Coaches can't see WHO is attending |
| Announcements | 95% | Production-ready |
| Payments | 30% | No Stripe — manual tracking only |
| Walk-up Songs | 0% | Complete stub — nav dead end |
| DB/RLS | Strong | No soft deletes, no audit log |
| Type Safety | Strong | Strict mode, generated types |
| Testing | Weak | E2E only, zero unit/integration tests |

---

## Phase 1 — Critical Blockers
> Must fix before ANY real users touch the app.

### 1.1 Password Reset Flow
**Why critical:** Users permanently locked out on forgotten password — no recovery path exists.

- Add `/auth/reset-password` route
- Add "Forgot password?" link on login screen
- Wire Supabase `resetPasswordForEmail()` + `updateUser()` on confirm step
- Files: `src/routes/auth/`, `src/features/auth/components/`
- Complexity: **M**

### 1.2 Attendance Detail View (Coach)
**Why critical:** Coaches cannot see WHO is attending events — only aggregate counts. A coach who can't see their roster before a game cannot use this app.

- Add attendance roster sheet triggered from event cards
- Query attendance with profile join, group by RSVP status
- Gate behind coach/admin role
- Files: `src/features/attendance/components/`, `src/features/attendance/services/attendance.ts`
- Complexity: **M**

### 1.3 Walk-up Songs — Clean Up Dead Code
**Why critical:** `src/features/walkup-songs/` has three empty directories and the DB table exists, but the feature is not exposed in the bottom nav. Remove the empty stub directories to keep the codebase clean, or implement the feature fully.

- Option A (recommended): Delete empty stub directories (`components/`, `hooks/`, `services/` under `walkup-songs/`) until the feature is ready
- Option B: Implement the full feature — the `walkup_songs` table and RLS policies already exist
- Files: `src/features/walkup-songs/`
- Complexity: **XS** (remove stubs) or **M** (implement)

### 1.4 Invalid Team ID — 404 Handling
**Why critical:** Navigating to a bad team URL fails silently or crashes. Should show a clear not-found state.

- Add error handling in `src/routes/teams/$teamId.tsx` loader
- Redirect to `/teams` with a toast if team not found or user not a member
- Complexity: **S**

---

## Phase 2 — High Priority (Beta Launch Quality)
> Needed for a quality soft launch. Won't fully block usage but will cause friction and distrust.

### 2.1 Email Verification on Signup
- Enable email confirmation in Supabase Auth settings
- Handle unverified state gracefully in UI (show "check your email" screen)
- Files: `src/features/auth/components/SignupForm.tsx`, Supabase dashboard
- Complexity: **S**

### 2.2 Error Boundaries (5xx Handling)
- Add React error boundary wrapper in `src/routes/__root.tsx`
- Add a friendly error fallback component with retry option
- Files: `src/routes/__root.tsx`, new `src/components/shared/ErrorBoundary.tsx`
- Complexity: **M**

### 2.3 Member Role Management
- Allow admins to change a member's role after they've joined
- Allow admins to remove (kick) a member from the team
- Files: `src/features/teams/components/RosterPage.tsx`, `src/features/teams/services/teams.ts`
- Complexity: **M**

### 2.4 Invite Expiry Visibility
- Show 7-day expiry countdown on generated invite links in admin UI
- Show expiry warning on the accept-invite screen if close to expiry
- Files: `src/features/teams/components/InviteSheet.tsx`
- Complexity: **S**

### 2.5 Session Timeout / Re-auth Handling
- Detect expired Supabase sessions and redirect to login gracefully (no blank screen)
- Files: `src/routes/__root.tsx`, `src/features/auth/hooks/useAuth.ts`
- Complexity: **M**

### 2.6 Profile / Account Page
- Users have no way to update their name, avatar, or password after signup
- Add `/profile` route with basic account settings
- Files: new `src/routes/profile.tsx`, `src/features/auth/`
- Complexity: **M**

---

## Phase 3 — Important but Deferrable (Post-Soft-Launch)
> Needed for scale and trust but not day-one.

### 3.1 Stripe Integration (Payments)
- Implement Stripe Checkout for online payment collection
- Wire Stripe webhooks to update `payments.stripe_session_id` and status
- Add receipt emails via Stripe
- Files: `src/features/payments/`, new `supabase/functions/stripe-webhook/`
- Complexity: **XL**

### 3.2 Email / Push Notifications
- Notify members when new event created, RSVP reminder 24h before, payment due
- Options: Supabase Edge Functions + Resend (email), or push via web push API
- Complexity: **XL**

### 3.3 Unit + Integration Tests for Services
- Add Vitest unit tests for all services in `src/features/*/services/`
- Add RLS integration tests against local Supabase instance
- Add a `npm run test` script to `package.json`
- Complexity: **L**

### 3.4 Soft Deletes + Audit Log
- Add `deleted_at` columns to payments and team events (prevent data loss on accidental delete)
- Add basic `audit_log` table for compliance trail
- Files: new migration in `supabase/migrations/`
- Complexity: **M**

### 3.5 Compound DB Indexes
- Add `(team_id, created_at)` indexes on `announcements`, `events`, `payments`
- Files: new migration in `supabase/migrations/`
- Complexity: **S**

### 3.6 Secrets Management
- Move Supabase + Stripe keys out of `.env` into deployment environment variables (Vercel/Netlify env)
- Rotate any exposed keys
- Complexity: **S**

---

## Phase 4 — Feature Roadmap (Post-Launch Iteration)
> Based on team mom / coach needs identified in audit. Prioritize by user interview results.

- **Walk-up Songs** — Song assignment per player, game-day queue, Spotify preview
- **Attendance Game-Day Check-In** — Coach marks actual attendance (present/absent) on game day
- **Attendance History & Trends** — Per-player attendance percentage over season
- **Announcement Comments** — Threaded replies on announcements
- **Announcement Media** — Image/file attachments
- **Event Notifications** — Push/email when events created or changed
- **Recurring Events** — Template for weekly practices
- **Location Maps** — Embed Google Maps for event locations
- **Volunteer Sign-Ups** — Snack schedule, dugout duty assignments
- **Carpool Coordination** — Ride-sharing for away games

---

## Parallel Execution Strategy

The following Phase 1 + 2 items can be built simultaneously by independent subagents:

| Stream A | Stream B | Stream C |
|---|---|---|
| Password Reset (1.1) | Attendance Detail View (1.2) | Walk-up Songs Nav Fix (1.3) |
| Email Verification (2.1) | Member Role Management (2.3) | Invalid Team 404 (1.4) |
| Error Boundaries (2.2) | Profile Page (2.6) | Invite Expiry UI (2.4) |
| Session Timeout (2.5) | | |

Sequential dependencies:
- Stripe (3.1) requires finalized payment schema → do after Phase 1/2
- Email notifications (3.2) requires Stripe + event schema to be stable
- Audit log (3.4) should come after soft deletes (design together)

---

## Verification Approach

After Phase 1 implementation:
1. Run `npm run build` + `npm run typecheck` + `npm run lint` in `dugout/`
2. Use Playwright skill to walk through: signup → create team → invite → RSVP → coach views attendance
3. Manually test password reset end-to-end with a real email
4. Verify walk-up songs nav link is gone or shows coming-soon state
5. Try navigating to a non-existent team ID and confirm 404
