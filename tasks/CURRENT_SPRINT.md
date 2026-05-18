# Current Sprint — Dugout MVP

**Sprint**: 1 of 6
**Goal**: Foundation — working app shell with authentication and routing
**Dates**: 2026-05-18 → 2026-05-31

---

## Sprint Goal

By the end of this sprint, a user can:

- Sign up and sign in to Dugout
- See a mobile-friendly app shell with bottom navigation
- Be protected from accessing routes without auth

---

## Tasks

### Setup & Infrastructure

- [ ] `TASK-001` Initialize Vite + React + TypeScript project
- [ ] `TASK-002` Configure Tailwind CSS with custom design tokens
- [ ] `TASK-003` Install and initialize shadcn/ui
- [ ] `TASK-004` Set up TanStack Router (file-based)
- [ ] `TASK-005` Set up TanStack Query with global QueryClient
- [ ] `TASK-006` Create Supabase project and configure client
- [ ] `TASK-007` Set up environment variables

### Authentication

- [ ] `TASK-008` Create `profiles` table + trigger migration
- [ ] `TASK-009` Implement sign-up page with email/password
- [ ] `TASK-010` Implement sign-in page
- [ ] `TASK-011` Implement sign-out action
- [ ] `TASK-012` Auth guard in root route layout
- [ ] `TASK-013` `useAuth` hook with TanStack Query

### Shell & Navigation

- [ ] `TASK-014` Create root layout (PageShell)
- [ ] `TASK-015` Create BottomNav component
- [ ] `TASK-016` Create LoadingSpinner component
- [ ] `TASK-017` Create ErrorMessage component
- [ ] `TASK-018` Home/dashboard placeholder page

### Deployment

- [ ] `TASK-019` Deploy to Vercel (staging env)
- [ ] `TASK-020` Configure Supabase production project

---

## Completed

_(none yet)_

---

## Blockers

_(none)_

---

## Notes

- shadcn/ui requires manual component installation (`npx shadcn@latest add [component]`)
- TanStack Router v1 uses `@tanstack/router-vite-plugin` for file-based routing
- Supabase anon key is safe to expose client-side (protected by RLS)
