# Architectural Decisions — Dugout

ADR log for significant decisions made during development.

---

## Format

**ADR-NNN: Title**

- **Status**: proposed / accepted / rejected / deprecated
- **Date**: YYYY-MM-DD
- **Context**: Why a decision was needed
- **Decision**: What was chosen
- **Rationale**: Why this option
- **Trade-offs**: What we gave up
- **Consequences**: What this means going forward

---

## ADR-001: Use Supabase for Backend

**Status**: accepted
**Date**: 2026-05-18

**Context**: We need auth, database, storage, and realtime without building a custom API server for an MVP.

**Decision**: Use Supabase (PostgreSQL + Auth + Storage + Realtime).

**Rationale**:

- Zero backend code for standard CRUD operations
- Built-in auth with email, OAuth, magic link
- Row Level Security enforces data access at the DB layer
- Scales to production with minimal ops overhead
- Free tier sufficient for MVP validation

**Trade-offs**:

- Vendor lock-in to Supabase
- Complex business logic harder to express in RLS
- Edge Functions needed for Stripe webhooks

**Consequences**:

- All data access goes through Supabase client
- RLS policies are the security boundary
- Migrations managed via `supabase/migrations/`

---

## ADR-002: TanStack Router for Routing

**Status**: accepted
**Date**: 2026-05-18

**Context**: Need type-safe routing with nested layouts, auth guards, and file-based routes for a React SPA.

**Decision**: Use TanStack Router v1 with file-based routing plugin.

**Rationale**:

- Full TypeScript type safety on route params and search params
- Nested layouts match our app shell model
- File-based routing keeps routes organized and discoverable
- Active project with strong community momentum

**Trade-offs**:

- Newer API surface, some patterns still evolving
- More complex than React Router for simple cases

**Consequences**:

- Routes live in `src/routes/` as files
- Route params are strongly typed throughout
- Loaders handle data prefetching where needed

---

## ADR-003: TanStack Query for Server State

**Status**: accepted
**Date**: 2026-05-18

**Context**: Need caching, background refetching, and mutation handling for Supabase data.

**Decision**: Use TanStack Query for all server state.

**Rationale**:

- Industry standard for React server state management
- Automatic background refetch, stale-while-revalidate
- Optimistic updates for attendance RSVPs
- Works seamlessly with Supabase client

**Trade-offs**:

- Adds complexity vs. raw `useEffect` fetching
- Query key management requires discipline

**Consequences**:

- No `useEffect` for data fetching
- All mutations use `useMutation` and invalidate relevant queries
- Query keys follow `[entity, id]` pattern

---

## ADR-004: No Global State Library

**Status**: accepted
**Date**: 2026-05-18

**Context**: Decide between adding Zustand/Jotai/Redux vs. relying on TanStack Query + URL state.

**Decision**: No global state library. Use TanStack Query + URL params + React context for auth.

**Rationale**:

- Server state (most of our state) belongs in TanStack Query
- Route/team context comes from URL params
- Auth session from Supabase via React context
- Avoids over-engineering for MVP scale

**Trade-offs**:

- More prop drilling for edge cases
- Harder to share ephemeral UI state across distant components

**Consequences**:

- Any new "global" state need must be evaluated carefully
- If a clear need for Zustand emerges, revisit in Sprint 3+

---

## ADR-005: Stripe Payment Links / Checkout (Not Custom Elements)

**Status**: accepted
**Date**: 2026-05-18

**Context**: Need payments without PCI compliance burden on our servers.

**Decision**: Use Stripe Checkout (hosted) for MVP payments.

**Rationale**:

- Stripe handles all payment UI and PCI compliance
- Simplest path to accepting payments
- Webhooks notify us of completion
- Can upgrade to Payment Elements later if needed

**Trade-offs**:

- Less control over payment UI/UX
- User leaves app to pay (Stripe hosted page)

**Consequences**:

- Need a Supabase Edge Function to create Checkout sessions
- Need a Stripe webhook endpoint (Edge Function)
- Payment status updated via webhook, not polling
