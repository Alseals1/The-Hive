# Dugout — Implementation Plan

## Overview

Dugout is a mobile-first youth sports coordination platform for baseball teams. This document outlines the phased implementation plan for the MVP.

---

## Phase 1 — Foundation (Week 1–2)

**Goal**: Working app shell with authentication and routing.

### Tasks

- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up TanStack Router (file-based routes)
- [ ] Set up TanStack Query
- [ ] Configure Supabase client
- [ ] Implement auth flow (sign up, sign in, sign out)
- [ ] Implement auth guards on protected routes
- [ ] Create base layout (mobile shell, nav bar)
- [ ] Deploy to Vercel (staging)

### Acceptance Criteria

- User can sign up with email
- User can sign in / sign out
- Protected routes redirect unauthenticated users
- App renders correctly on mobile viewport

---

## Phase 2 — Teams (Week 2–3)

**Goal**: Users can create teams, invite members, and manage roles.

### Tasks

- [ ] Design `teams` and `team_members` tables with RLS
- [ ] Create team creation flow
- [ ] Generate and send invite links
- [ ] Accept invite and join team
- [ ] Team settings page (name, sport, season)
- [ ] Role system: admin, coach, manager, player, parent

### Acceptance Criteria

- User can create a team and become admin
- Admin can invite others via link
- Invited user joins team and is assigned a role
- Team dashboard shows all members

---

## Phase 3 — Schedule & Attendance (Week 3–4)

**Goal**: Coaches can create events; parents/players can RSVP.

### Tasks

- [ ] Design `events` and `attendance` tables with RLS
- [ ] Create event creation form (game, practice, tournament)
- [ ] Event list/calendar view (mobile-first)
- [ ] Event detail page
- [ ] RSVP flow (Yes / No / Maybe)
- [ ] Attendance summary for coaches

### Acceptance Criteria

- Coach can create an event with date, time, location
- All team members can see events
- Members can RSVP per event
- Coach can view attendance counts

---

## Phase 4 — Announcements (Week 4–5)

**Goal**: Coaches/admins can post team-wide announcements.

### Tasks

- [ ] Design `announcements` table with RLS
- [ ] Announcement creation (admin/coach only)
- [ ] Announcement feed (reverse chronological)
- [ ] Mark as read (optional for MVP)
- [ ] Push notification stub (post-MVP)

### Acceptance Criteria

- Admin/coach can create an announcement
- All members see announcements in a feed
- Announcements show author and timestamp

---

## Phase 5 — Walk-up Songs (Week 5)

**Goal**: Players can set their personal walk-up song.

### Tasks

- [ ] Design `walkup_songs` table with RLS
- [ ] Walk-up song picker UI (search by song name/artist)
- [ ] YouTube or Spotify link support (MVP: URL input)
- [ ] Display walk-up songs on roster view
- [ ] Admin can manage player songs

### Acceptance Criteria

- Player can add/edit their walk-up song URL
- Roster shows each player's walk-up song
- Admin can remove inappropriate songs

---

## Phase 6 — Payments (Week 6–7)

**Goal**: Admin can request payments; members can pay via Stripe.

### Tasks

- [ ] Design `payments` table with RLS
- [ ] Stripe integration (Checkout or Payment Links)
- [ ] Create payment request (amount, description, due date)
- [ ] Payment list view (pending, paid)
- [ ] Stripe webhook to update payment status
- [ ] Payment confirmation UI

### Acceptance Criteria

- Admin can create a payment request for the team
- Members see payment requests with status
- Members can pay via Stripe
- Status updates automatically on payment

---

## Post-MVP (Do Not Build Now)

- Push notifications
- Chat/messaging
- Live streaming
- Advanced stats
- Tournament brackets
- League analytics
- Public profiles
- Marketplace

---

## Success Metrics

- User can complete full onboarding in < 2 minutes
- All core flows work on mobile (iPhone SE viewport)
- Zero RLS bypass vulnerabilities
- All routes have loading and error states
