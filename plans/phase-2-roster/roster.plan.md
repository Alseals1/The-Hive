# Roster Feature Implementation Plan

## Executive Summary
Build a read-only team roster view that displays all team members grouped by role (Coaches, Players, Parents, Managers, Pending). MVP focuses on fast load, clear visibility, and mobile-first design with no editing capabilities. Enables team coordination through member overview and profile discovery.

---

## Requirements Overview

### Functional Requirements
- **View roster**: All team members (any role) can access roster
- **Display info**: Member name, email, role, avatar, joined date
- **Grouping**: Organize members by role (Coaches → Players → Parents → Managers)
- **States**: Loading, error, empty, success with appropriate UX
- **Mobile-first**: Large 48-56px touch targets, optimized for outdoor use
- **Read-only MVP**: No editing, permissions management, or invitations (Phase 3+)

### Acceptance Criteria
- ✅ Roster loads within <2s with TanStack Query caching (5-min staleTime)
- ✅ Members display with avatar, name, email, role badge, joined date
- ✅ Grouped sections render correctly sorted by role priority
- ✅ Loading state shows skeleton/spinner
- ✅ Error state displays user-friendly message with retry
- ✅ Empty state handled gracefully
- ✅ Mobile viewport optimized with scrollable layout
- ✅ RLS permissions enforced (team members only see own team's roster)

---

## Technical Approach

### Data Flow
```
/teams/$teamId/roster
  ↓
useRoster() hook (TanStack Query)
  ↓
fetchRosterWithProfiles service
  ↓
SELECT team_members JOIN profiles + RLS filter
  ↓
Grouped component structure → RosterMemberCard
```

### Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **TanStack Query** | Automatic caching, background refetch, stale state management |
| **Service layer** | Centralize Supabase queries, reusable across features |
| **Component hierarchy** | Route → Page → List → Grid → Card (composition pattern) |
| **Role grouping** | Order: Coaches → Players → Parents → Managers → Pending |
| **5-min staleTime** | Balance freshness with performance (roster updates infrequently) |

### Database Query
- **Table**: `team_members` (id, team_id, user_id, role, joined_at)
- **Join**: `profiles` (id, avatar_url, email, full_name)
- **RLS Filter**: `auth.uid()` in target team's members OR `team_id = requested_team_id`
- **Sort**: role priority (custom order), then by created_at, then name

### File Structure
```
src/features/roster/
├── components/
│   ├── RosterPage.tsx          # Route container
│   ├── RosterList.tsx          # Grouping logic
│   ├── RosterGrid.tsx          # Member grid layout
│   ├── RosterMemberCard.tsx    # Individual member display
│   └── RosterSectionHeader.tsx # Role section headers
├── hooks/
│   └── useRoster.ts           # TanStack Query hook
├── services/
│   └── roster.ts              # Supabase queries
└── types/
    └── index.ts               # RosterMember, RosterSection types
```

---

## Implementation Tasks

### Phase 1: Foundation (4–6 hours)

- [ ] **1. Create types** (1h) - `RosterMember`, `RosterSection`, role enums  
- [ ] **2. Write service layer** (1.5h) - `fetchRosterWithProfiles()` with error handling, RLS validation  
- [ ] **3. Build useRoster hook** (1h) - TanStack Query wrapper, caching config, staleTime 5min  
- [ ] **4. Route setup** (0.5h) - Add `roster.tsx` route in `teams/$teamId/` folder

### Phase 2: UI Components (6–8 hours)

- [ ] **5. RosterPage component** (1.5h) - Layout, loading/error/empty state handling, PageShell integration  
- [ ] **6. RosterList component** (1.5h) - Group members by role, sort, handle PENDING state  
- [ ] **7. RosterGrid & Card** (2h) - Grid layout for mobile, RosterMemberCard with avatar + badge  
- [ ] **8. Styling & responsiveness** (1.5h) - Tailwind, 48-56px touch targets, scrollable on mobile  
- [ ] **9. Bottom nav integration** (1h) - Add "Roster" tab to bottom navigation, routing

### Phase 3: Polish & Testing (2–4 hours)

- [ ] **10. Loading skeleton state** (1h) - Placeholder cards while fetching  
- [ ] **11. Error & empty states** (1h) - User-friendly messages with retry logic  
- [ ] **12. E2E testing** (1–1.5h) - Verify permission checks, state transitions, mobile UX  
- [ ] **13. Performance optimization** (0.5h) - Image lazy-load for avatars, query optimization

**Total Estimate: 12–18 hours**

---

## Key Dependencies

### Must Be Complete First
1. ✅ Team authentication & RLS setup (existing: AGENTS.md confirms RLS in place)
2. ✅ Profiles table with avatar_url (existing: DATABASE_SCHEMA.md)
3. ✅ Bottom nav component (DEPENDENCY: schedule/announcements already use this)

### Internal Sequencing
1. **Types** must come first (used by service, hook, components)
2. **Service layer** before hook (hook depends on query function)
3. **Hook** before components (components depend on data)
4. **Page + List** components before Grid/Card (hierarchy)
5. **Bottom nav integration** last (needs all components ready)

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|-----------|
| **RLS rule blocks team members** | Medium | Verify RLS policy includes all roles; test with different user roles before deploy |
| **Slow load on large teams (100+ members)** | Low | Implement pagination (Phase 2); set reasonable query limits; profile image lazy-loading |
| **Avatar image CDN failures** | Low | Fallback to initials-based avatar; error boundary in RosterMemberCard |
| **Stale data on role changes** | Low | Use 5-min staleTime; add manual refresh button; background refetch on focus |
| **Mobile layout breaks on tablet** | Medium | Test on 5+ device sizes; use responsive grid (1 col mobile, 2 col tablet) |
| **Missing profiles for new team members** | Low | Ensure profile creation in auth signup flow (existing) |

---

## Success Criteria

### Functionality
- [ ] Roster loads on `/teams/$teamId/roster` without errors
- [ ] All team members display correctly grouped by role
- [ ] Role grouping order: Coaches → Players → Parents → Managers
- [ ] RLS enforced: users only see their own team's roster
- [ ] Loading/error/empty states display appropriately

### UX & Performance
- [ ] Initial load <2s (with 5-min cache hit <500ms)
- [ ] Touch targets minimum 48px on mobile
- [ ] Scrollable on screens with 10+ members
- [ ] Avatar images load without blocking page
- [ ] Mobile viewport optimized (no horizontal scroll)

### Integration
- [ ] "Roster" tab appears in bottom navigation
- [ ] Navigation between Schedule, Announcements, Roster, Payments works
- [ ] Back button on RosterPage returns to team overview
- [ ] Consistent styling with existing features (Tailwind, shadcn/ui)

### Code Quality
- [ ] TypeScript strict mode (no `any`)
- [ ] RLS validation in service layer
- [ ] Error boundaries on cards
- [ ] Reusable hooks and services
- [ ] Feature folder structure follows AGENTS.md pattern

---

## Notes for Developers

- Use existing `PageShell` wrapper for header/footer consistency
- Reuse `LoadingSpinner`, `ErrorMessage`, `EmptyState` components
- Avatar images should use Supabase Storage URLs
- Role enum priority: `['coach', 'player', 'parent', 'manager']`
- Consider "PENDING" members as separate group (users invited but not yet active)
- Manual refresh button optional but recommended for roles/status changes
