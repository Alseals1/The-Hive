# Architecture — Dugout

## System Overview

```
┌─────────────────────────────────┐
│         React Frontend          │
│  Vite · TanStack Router/Query   │
│  Tailwind CSS · shadcn/ui       │
└────────────────┬────────────────┘
                 │ HTTPS / WebSocket
┌────────────────▼────────────────┐
│            Supabase             │
│  Auth · PostgreSQL · Storage    │
│  Realtime · Edge Functions      │
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│             Stripe              │
│  Checkout · Webhooks            │
└─────────────────────────────────┘
```

---

## Frontend Architecture

### Folder Structure

```
src/
├── app/                    # App entry point, providers, global setup
│   ├── App.tsx
│   └── providers.tsx
├── routes/                 # TanStack Router file-based routes
│   ├── __root.tsx
│   ├── index.tsx
│   ├── auth/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── teams/
│   │   ├── index.tsx
│   │   ├── $teamId.tsx
│   │   └── $teamId/
│   │       ├── schedule.tsx
│   │       ├── announcements.tsx
│   │       ├── roster.tsx
│   │       └── payments.tsx
│   └── invite/
│       └── $token.tsx
├── components/
│   ├── ui/                 # shadcn/ui primitives (do not modify)
│   └── shared/             # Reusable app-level components
│       ├── PageShell.tsx
│       ├── BottomNav.tsx
│       ├── LoadingSpinner.tsx
│       └── ErrorMessage.tsx
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── teams/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── schedule/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── attendance/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── announcements/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── walkup-songs/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── payments/
│       ├── components/
│       ├── hooks/
│       └── services/
├── hooks/                  # Global shared hooks
│   └── useAuth.ts
├── lib/
│   ├── supabase.ts         # Supabase client (singleton)
│   └── stripe.ts           # Stripe helpers
├── services/               # Global query/mutation functions
│   └── supabase/
│       └── profiles.ts
└── types/
    ├── database.ts         # Auto-generated Supabase types
    └── index.ts            # Shared app types
```

---

## Routing Strategy

TanStack Router with file-based routing via `@tanstack/router-vite-plugin`.

### Route Hierarchy

```
/ (root)
├── /auth/login
├── /auth/signup
├── /invite/$token        ← public (no auth)
├── /teams                ← protected
│   └── /$teamId          ← team context
│       ├── /schedule
│       ├── /announcements
│       ├── /roster
│       └── /payments
└── /profile              ← protected
```

### Auth Guards

Root layout checks session. Protected routes redirect to `/auth/login` if no session.

```ts
// routes/__root.tsx
const user = await supabase.auth.getUser();
if (!user && !isPublicRoute) redirect("/auth/login");
```

---

## Data Fetching Strategy

TanStack Query manages all server state.

### Patterns

- **Query keys**: `['teams', teamId]`, `['events', teamId]`, etc.
- **Stale time**: 60 seconds for most queries
- **Invalidation**: After mutations, invalidate related query keys
- **Optimistic updates**: For attendance RSVPs only (instant feel)

### Query Function Pattern

```ts
// features/schedule/services/events.ts
export async function getEvents(teamId: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("team_id", teamId)
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return data;
}
```

---

## State Management

No global state library. Use:

- **TanStack Query** → server state
- **React context** → auth session (via Supabase)
- **URL params** → current team, event IDs
- **Local state** → form fields, UI toggles

---

## Auth Flow

1. User visits `/auth/signup` → submits email + password
2. Supabase creates `auth.users` entry
3. DB trigger creates `profiles` row
4. User is redirected to `/teams`
5. If no teams → show "Create Your First Team" prompt

### Session Management

```ts
// lib/supabase.ts
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// hooks/useAuth.ts
export function useAuth() {
  return useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
}
```

---

## Payments Flow

1. Admin creates payment request in DB
2. User sees pending payment in UI
3. User clicks "Pay Now" → calls Edge Function or server action
4. Stripe Checkout session created, user redirected to Stripe
5. On success, Stripe webhook fires
6. Edge Function receives webhook, updates `payments.status = 'paid'`
7. TanStack Query invalidates payments query

---

## Mobile-First Design Principles

- Base styles target 375px viewport (iPhone SE)
- Bottom navigation bar for primary actions
- Touch targets minimum 44×44px
- No hover-only interactions
- Large text (16px minimum body)
- Cards and list items over tables
- Swipe gestures where natural (post-MVP)

---

## Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
```

Supabase service role key NEVER goes in frontend. Use Edge Functions for privileged operations.
