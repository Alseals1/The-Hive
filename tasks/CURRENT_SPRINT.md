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

- [x] `TASK-001` Initialize Vite + React + TypeScript project
- [x] `TASK-002` Configure Tailwind CSS with custom design tokens
- [x] `TASK-003` Install and initialize shadcn/ui primitives (CVA, Radix, lucide)
- [x] `TASK-004` Set up TanStack Router (file-based)
- [x] `TASK-005` Set up TanStack Query with global QueryClient
- [x] `TASK-006` Create Supabase project and configure client
- [x] `TASK-007` Set up environment variables

### Authentication

- [x] `TASK-008` Create `profiles` table + trigger migration
- [x] `TASK-009` Implement sign-up page with email/password
- [x] `TASK-010` Implement sign-in page
- [x] `TASK-011` Implement sign-out action
- [x] `TASK-012` Auth guard in root route layout
- [x] `TASK-013` `useAuth` hook with TanStack Query

### Shell & Navigation

- [x] `TASK-014` Create root layout (PageShell)
- [x] `TASK-015` Create BottomNav component (TeamBottomNav)
- [x] `TASK-016` Create LoadingSpinner component
- [x] `TASK-017` Create ErrorMessage component
- [x] `TASK-018` Teams dashboard with real data, create team form, loading/empty/error states

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
