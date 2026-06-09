# Dugout — Production Readiness Task List

> Tasks are organized by phase. Complete Phase 1 before starting Phase 2.
> Items within the same phase can be parallelized across subagents.

---

## 🔴 Phase 1 — Critical Blockers

### Auth
- [x] **[1.1a]** Add `/auth/reset-password` route (request + confirm steps)
- [x] **[1.1b]** Add "Forgot password?" link to login form
- [x] **[1.1c]** Wire `resetPasswordForEmail()` + `updateUser()` via Supabase Auth
- [x] **[1.1d]** Show success/error feedback on reset request and confirmation screens

### Attendance
- [x] **[1.2a]** Build attendance detail sheet component (list of who's going/maybe/out)
- [x] **[1.2b]** Add service query for attendance with profile join per event
- [x] **[1.2c]** Surface attendance detail sheet from event cards (coach/admin only)
- [x] **[1.2d]** Show member name, avatar initial, and RSVP status in list

### Walk-up Songs Nav
- [ ] **[1.3a]** Remove walk-up songs link from `TeamBottomNav` (or add Coming Soon empty state)

### Routing / 404
- [ ] **[1.4a]** Handle invalid/inaccessible team ID in `$teamId` route loader
- [ ] **[1.4b]** Redirect to `/teams` with toast if team not found or access denied

---

## 🟠 Phase 2 — Beta Launch Quality

### Auth
- [ ] **[2.1a]** Enable email confirmation in Supabase Auth settings (dashboard)
- [ ] **[2.1b]** Show "Check your email" confirmation screen after signup
- [ ] **[2.5a]** Detect expired Supabase sessions in root route
- [ ] **[2.5b]** Gracefully redirect to `/auth/login` on session expiry (no blank screen)

### Error Handling
- [ ] **[2.2a]** Add React error boundary to `__root.tsx`
- [ ] **[2.2b]** Create `ErrorBoundary.tsx` shared component with retry button

### Teams
- [ ] **[2.3a]** Add "Change Role" action in roster member options (admin only)
- [ ] **[2.3b]** Add "Remove Member" action in roster member options (admin only)
- [ ] **[2.3c]** Wire role update + remove member to `teams.service.ts`
- [ ] **[2.4a]** Show invite link expiry date/countdown in admin invite UI
- [ ] **[2.4b]** Show expiry warning on accept-invite screen if < 24h remaining

### Profile
- [ ] **[2.6a]** Create `/profile` route with display name and avatar update form
- [ ] **[2.6b]** Add password change flow on profile page
- [ ] **[2.6c]** Add profile link/button in teams list page header

---

## 🟡 Phase 3 — Post-Soft-Launch (Deferrable)

### Payments / Stripe
- [ ] **[3.1a]** Design Stripe Checkout integration architecture
- [ ] **[3.1b]** Implement Stripe Checkout session creation (Supabase Edge Function)
- [ ] **[3.1c]** Add Stripe webhook handler to sync payment status
- [ ] **[3.1d]** Wire "Pay Now" button for members in payments view
- [ ] **[3.1e]** Show receipt/confirmation screen after successful payment
- [ ] **[3.1f]** Test with Stripe test mode end-to-end

### Notifications
- [ ] **[3.2a]** Choose notification channel (email via Resend or push via web push)
- [ ] **[3.2b]** Trigger notification on new event created
- [ ] **[3.2c]** Send RSVP reminder 24h before event
- [ ] **[3.2d]** Send payment due date reminder

### Testing
- [ ] **[3.3a]** Install and configure Vitest
- [ ] **[3.3b]** Add `npm run test` script to `package.json`
- [ ] **[3.3c]** Write unit tests for all payment service methods
- [ ] **[3.3d]** Write unit tests for all attendance service methods
- [ ] **[3.3e]** Write unit tests for Zod validation schemas
- [ ] **[3.3f]** Write RLS integration tests against local Supabase

### Database
- [ ] **[3.4a]** Add `deleted_at` column to `payments` table (migration)
- [ ] **[3.4b]** Add `deleted_at` column to `events` table (migration)
- [ ] **[3.4c]** Create `audit_log` table for team/payment changes (migration)
- [ ] **[3.5a]** Add compound index `(team_id, created_at)` on `announcements` (migration)
- [ ] **[3.5b]** Add compound index `(team_id, created_at)` on `events` (migration)
- [ ] **[3.5c]** Add compound index `(team_id, created_at)` on `payments` (migration)

### Security
- [ ] **[3.6a]** Move Supabase + Stripe keys to deployment environment (Vercel/Netlify)
- [ ] **[3.6b]** Rotate any keys that were committed to version control
- [ ] **[3.6c]** Add pre-commit hook to block `.env` commits

---

## 🟢 Phase 4 — Feature Roadmap

### Walk-up Songs (Full Implementation)
- [ ] Song assignment per player
- [ ] Song search (Spotify / manual entry)
- [ ] Game-day song queue view
- [ ] Playback preview

### Attendance Enhancements
- [ ] Game-day check-in (coach marks present/absent)
- [ ] Attendance percentage per player over season
- [ ] Excused vs. unexcused absence tracking

### Announcements Enhancements
- [ ] Threaded comments on announcements
- [ ] Image / file attachment support
- [ ] Schedule announcement for future date/time

### Schedule Enhancements
- [ ] Recurring event templates (weekly practice)
- [ ] Event location map embed
- [ ] Drag-to-reorder supply items

### Team Enhancements
- [ ] Volunteer sign-up sheets (snack schedule, dugout duty)
- [ ] Carpool coordination for away games

### Reporting (Post-Launch)
- [ ] Attendance report export (CSV)
- [ ] Payment report export (CSV)
- [ ] Team activity summary

---

## Verification Checklist (After Phase 1)

- [ ] `cd dugout && npm run build` passes with 0 errors
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] Password reset end-to-end with real email works
- [ ] Coach can see attendance detail list on event
- [ ] Walk-up songs nav link removed or shows Coming Soon
- [ ] Navigating to `/teams/invalid-id` shows 404 or redirects cleanly
- [ ] Playwright smoke test: signup → create team → invite → RSVP → coach views attendees
