# Dugout MVP Design Plan

_Established via design review session — 2026-05-19_

---

## Primary User & Flow

**Target user:** Coach/admin first. The setup experience must be frictionless before the consumer (parent/player) side matters.

**Critical onboarding path:**
1. Coach creates team
2. Coach generates role-specific invite codes (one for parents, one for players)
3. Parents/players join via code
4. Coach adds season schedule
5. Members RSVP, react to announcements, set walk-up songs

---

## Feature Decisions

### Invites
- **Short codes** (not long links) — easier to share in group chats, read aloud
- Role-specific: separate codes for `player` and `parent` roles
- **7-day expiry** by default; coach can regenerate at any time
- Schema already supports this: `team_invites.role`, `expires_at`, `token`

### Announcements
- **Coaches/admins post only** — keeps it a broadcast channel, not a chat
- **Emoji reactions** for parents/players (thumbs up, heart, star, cheer, etc.) — no replies
- **Text-only for MVP** — no photo/video attachments (add in v2)

### Walk-up Songs
- **Display + play audio** — the core magic moment: coach taps batter at field, song plays
- Store YouTube or Spotify URL per player
- **Lives inside Roster** (player profile card), NOT a dedicated nav tab
- Accessible flow: Roster → player card → song plays

### Payments
- **Dual-track:** in-app Stripe payments + manual "mark as paid" for cash
- **Phased:** ship Stripe first, manual mark-as-paid alongside it
- Schema already has `stripe_session_id` and `status` (pending/paid/waived/overdue)

### Attendance
- **Counts (Yes/Maybe/No totals):** visible to all members
- **Names/full breakdown:** coaches/admins only
- Role-based display split using existing `useRoster` + attendance data

### Schedule
- **No recurring events in MVP** — one-at-a-time only; recurrence is v2
- Avoids edit-one-vs-all complexity

### Player Profiles
- **Jersey number only** added to profiles for MVP (beyond name + avatar)
- No position, batting order, or stats in MVP

### Notifications
- **In-app only for MVP** — no push notifications
- Keeps infrastructure scope manageable; validate retention first

---

## Navigation (Bottom Nav — 5 tabs)

| Tab | Contents |
|-----|----------|
| Schedule | Events list, RSVP, create event |
| News | Announcements + emoji reactions |
| Roster | Member cards, walk-up songs, jersey numbers |
| Payments | Dues tracking, Stripe + manual |
| Settings | Team settings, invite code generation |

Walk-up songs are nested in Roster — no 6th tab.

---

## Multi-Team UX

Keep the **"pick a team"** top-level pattern. No unified cross-team dashboard for MVP.

---

## Build Order (Remaining Features)

Priority order based on user value and dependencies:

1. **Invite codes** — refactor current token system to short codes with role selection UI
2. **Announcements** — CRUD with emoji reactions (coaches post, all react)
3. **Walk-up songs** — nested in Roster player card, URL + audio playback
4. **Payments** — Stripe checkout + manual mark-as-paid
5. **Jersey number** — add field to profiles table and roster card display

---

## Out of Scope for MVP

- Push notifications
- Recurring events
- Photo/video in announcements
- Unified cross-team dashboard
- Position / batting order / advanced player stats
- Real-time Supabase subscriptions
- Team member removal / role changes
- Tests / test framework
