# Roster Feature: Task Breakdown & Implementation Sequence

**Total Estimated Effort: 12–18 hours | LOC: 1,200–1,500 lines**

---

## 🎯 Dependency Graph

```
Foundation Layer (PHASE 1)
├── Task 1: Types → (blocks 2,3)
├── Task 2: Service Layer → (blocks 3)
├── Task 3: Hook (useRoster) → (blocks 5,6)
└── Task 4: Route setup → (blocks 5)

UI Layer (PHASE 2)
├── Task 5: RosterPage → (blocks 6)
├── Task 6: RosterList → (blocks 7)
├── Task 7: RosterGrid & RosterMemberCard → (blocks 8)
├── Task 8: Styling & Responsive → (blocks 9)
└── Task 9: Bottom Nav Integration → (final step)

Polish (PHASE 3)
├── Task 10: Loading Skeleton
├── Task 11: Error & Empty States
├── Task 12: E2E Testing
└── Task 13: Performance Optimization
```

---

# PHASE 1: FOUNDATION LAYER

## Task 1: Create Types & Enums

**Category:** File Structure & Types  
**Duration:** 1 hour | **LOC:** 80–100  
**Priority:** 🔴 CRITICAL (blocks tasks 2, 3, 5–8)

### Files to Create
```
src/features/roster/types/
├── index.ts
```

### Input
- None (defines data contracts)

### Output
```typescript
// src/features/roster/types/index.ts

export enum RosterRole {
  COACH = 'coach',
  PLAYER = 'player',
  PARENT = 'parent',
  MANAGER = 'manager',
  PENDING = 'pending',
}

export const ROLE_PRIORITY: Record<RosterRole, number> = {
  [RosterRole.COACH]: 1,
  [RosterRole.PLAYER]: 2,
  [RosterRole.PARENT]: 3,
  [RosterRole.MANAGER]: 4,
  [RosterRole.PENDING]: 5,
}

export interface RosterMember {
  id: string
  team_id: string
  user_id: string
  role: RosterRole
  joined_at: string
  profile: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
  }
}

export interface RosterSection {
  role: RosterRole
  label: string
  members: RosterMember[]
}

export interface RosterData {
  sections: RosterSection[]
  totalMembers: number
}
```

### Dependencies
- None

### Notes
- Use discriminated union for role (not string literal)
- ROLE_PRIORITY determines sort order
- Profile data comes from `team_members` JOIN with `profiles`

---

## Task 2: Write Service Layer (Supabase Query)

**Category:** Service Layer  
**Duration:** 1.5 hours | **LOC:** 120–150  
**Priority:** 🔴 CRITICAL (blocks task 3)

### Files to Create
```
src/features/roster/services/
├── roster.ts
```

### Input
- `teamId` (string)
- `supabaseClient` (from app context)

### Output
```typescript
// src/features/roster/services/roster.ts

/**
 * Fetch roster with profiles for a team
 * Enforces RLS: only team members can view team roster
 * 
 * @param supabase - Supabase client with auth context
 * @param teamId - Team ID to fetch roster for
 * @returns RosterMember[] grouped, sorted by role priority
 * @throws error if RLS denies access or query fails
 */
export async function fetchRosterWithProfiles(
  supabase: SupabaseClient,
  teamId: string
): Promise<RosterMember[]> {
  // SELECT team_members.*, profiles.*
  // WHERE team_id = $1
  // ORDER BY role_priority, joined_at, full_name
  // RLS enforces: auth.uid() must be in team_members of this team
}

/**
 * Get single member profile
 * @param supabase
 * @param teamId
 * @param memberId
 */
export async function getRosterMember(
  supabase: SupabaseClient,
  teamId: string,
  memberId: string
): Promise<RosterMember | null>
```

### Dependencies
- Task 1: Types/Enums
- Supabase RLS policy (must allow team members to see roster)
- `profiles` table with `avatar_url`, `full_name`, `email`

### Query Design
```sql
SELECT 
  tm.id,
  tm.team_id,
  tm.user_id,
  tm.role,
  tm.created_at as joined_at,
  jsonb_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'email', p.email,
    'avatar_url', p.avatar_url
  ) as profile
FROM team_members tm
JOIN profiles p ON tm.user_id = p.id
WHERE tm.team_id = $1
  AND tm.role != 'pending'  -- or include pending in separate query
ORDER BY 
  CASE tm.role
    WHEN 'coach' THEN 1
    WHEN 'player' THEN 2
    WHEN 'parent' THEN 3
    WHEN 'manager' THEN 4
    WHEN 'pending' THEN 5
  END,
  tm.created_at ASC,
  p.full_name ASC
```

### Notes
- RLS validates at query level (Supabase Policy)
- No pagination in MVP (add in Phase 2 if 50+ members)
- Include PENDING role for invitations visibility
- Null-safe profile access (fallback to user_id if missing)

---

## Task 3: Build useRoster Hook

**Category:** Hook Layer  
**Duration:** 1 hour | **LOC:** 80–120  
**Priority:** 🔴 CRITICAL (blocks tasks 5–8)

### Files to Create
```
src/features/roster/hooks/
├── useRoster.ts
```

### Input
- `teamId` (string)
- `enabled` (optional, default: true)

### Output
```typescript
// src/features/roster/hooks/useRoster.ts

interface UseRosterOptions {
  teamId: string
  enabled?: boolean
}

export function useRoster({ teamId, enabled = true }: UseRosterOptions) {
  return useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchRosterWithProfiles(supabase, teamId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: 1000,
  })
}

export function useGroupedRoster({ teamId, enabled = true }: UseRosterOptions) {
  const { data: members, ...query } = useRoster({ teamId, enabled })
  
  // Transform flat array into RosterSection[]
  const sections = useMemo(() => groupByRole(members || []), [members])
  
  return {
    sections,
    totalMembers: members?.length || 0,
    ...query,
  }
}
```

### Dependencies
- Task 1: Types
- Task 2: Service (`fetchRosterWithProfiles`)
- `@tanstack/react-query` (already in project)
- `useSupabaseClient` hook

### Configuration
- **staleTime:** 5 minutes (roster updates infrequently)
- **gcTime:** 10 minutes (keep in cache longer)
- **retry:** 2 attempts (network errors)
- **retryDelay:** 1 second

### Notes
- `useGroupedRoster` wraps base hook with grouping logic
- Memoize grouped sections to prevent re-renders
- Enable conditional fetching with `enabled` parameter
- Export both flat and grouped versions for flexibility

---

## Task 4: Route Setup

**Category:** Integration  
**Duration:** 0.5 hours | **LOC:** 30–50  
**Priority:** 🔴 CRITICAL (blocks task 5)

### Files to Create/Modify
```
src/routes/teams/$teamId/
└── roster.tsx (CREATE NEW)
```

### Input
- Existing route structure in `$teamId/` folder
- TanStack Router params

### Output
```typescript
// src/routes/teams/$teamId/roster.tsx

import { createFileRoute } from '@tanstack/react-router'
import { RosterPage } from '@/features/roster/components/RosterPage'

export const Route = createFileRoute('/teams/$teamId/roster')({
  component: RosterPage,
})
```

### Dependencies
- Task 5: `RosterPage` component (not yet created, but no circular dependency)
- Existing route structure in `$teamId/` folder

### Notes
- Route path: `/teams/:teamId/roster`
- No loader needed (data fetching in hook)
- No auth needed (RLS handles it)
- Add to route tree generation if needed

---

# PHASE 2: UI COMPONENT LAYER

## Task 5: RosterPage Component

**Category:** Component Layer (Container)  
**Duration:** 1.5 hours | **LOC:** 150–200  
**Priority:** 🟡 HIGH (depends on tasks 1–4; blocks task 6)

### Files to Create
```
src/features/roster/components/
├── RosterPage.tsx
```

### Input
- `teamId` from route params
- `useRoster` hook query

### Output
- Page container with header, content area, error/loading/empty states
- Uses existing `PageShell`, `LoadingSpinner`, `ErrorMessage`, `EmptyState`

### Component Structure
```typescript
// src/features/roster/components/RosterPage.tsx

interface RosterPageProps {}

export function RosterPage() {
  const { teamId } = useParams({ from: '/teams/$teamId/roster' })
  const { data: team } = useTeam(teamId) // existing hook
  const { sections, isLoading, error } = useGroupedRoster({ teamId })

  if (isLoading) return <RosterSkeleton />
  if (error) return <ErrorMessage error={error} onRetry={retry} />
  if (!sections?.length) return <EmptyState title="No roster yet" />

  return (
    <PageShell title={`${team?.name} Roster`} back>
      <RosterList sections={sections} />
    </PageShell>
  )
}
```

### Dependencies
- Task 1: Types
- Task 3: `useRoster` hook
- Task 4: Route setup
- Existing: `PageShell`, `LoadingSpinner`, `ErrorMessage`, `EmptyState`
- Existing: `useTeam` hook (for team name)
- Existing: `useParams` from TanStack Router

### Responsibilities
- Fetch roster via hook
- Manage loading/error/empty states
- Render page layout via PageShell
- Pass data to RosterList

### Error Handling
```typescript
- Network error → ErrorMessage with retry
- RLS denied → "You don't have access to this roster"
- No members → EmptyState with icon
- Team not found → Redirect to teams list
```

### Notes
- No data transformation here (done in hook)
- Keep this "thin" — delegate to child components
- Reuse existing shared components for consistency

---

## Task 6: RosterList Component

**Category:** Component Layer (Orchestrator)  
**Duration:** 1.5 hours | **LOC:** 120–160  
**Priority:** 🟡 HIGH (depends on task 5; blocks task 7)

### Files to Create
```
src/features/roster/components/
├── RosterList.tsx
```

### Input
- `sections: RosterSection[]` (grouped by role)

### Output
- Grouped list of role sections with headers
- Each section contains grid of member cards

### Component Structure
```typescript
// src/features/roster/components/RosterList.tsx

interface RosterListProps {
  sections: RosterSection[]
}

export function RosterList({ sections }: RosterListProps) {
  return (
    <div className="space-y-6 pb-24">
      {sections.map((section) => (
        <div key={section.role}>
          <RosterSectionHeader role={section.role} count={section.members.length} />
          <RosterGrid members={section.members} />
        </div>
      ))}
    </div>
  )
}
```

### Dependencies
- Task 1: Types (`RosterSection`)
- Task 7: `RosterGrid`, `RosterSectionHeader` components

### Responsibilities
- Loop through sections
- Render section headers
- Render grids within sections
- Handle spacing/layout between sections

### Styling
- `space-y-6` for vertical spacing between sections
- `pb-24` for bottom padding (below nav)
- Section separators optional (subtle border/divider)

### Notes
- Simple orchestrator — delegates rendering to child components
- Order determined by hook (not here)
- No conditional logic beyond map

---

## Task 7: RosterGrid & RosterMemberCard Component

**Category:** Component Layer (UI)  
**Duration:** 2 hours | **LOC:** 250–320  
**Priority:** 🟡 HIGH (depends on tasks 1, 6; blocks task 8)

### Files to Create
```
src/features/roster/components/
├── RosterGrid.tsx
├── RosterMemberCard.tsx
└── RosterSectionHeader.tsx
```

### 7A: RosterGrid Component

**Input:** `members: RosterMember[]`

**Output:** Responsive grid layout

```typescript
// src/features/roster/components/RosterGrid.tsx

interface RosterGridProps {
  members: RosterMember[]
}

export function RosterGrid({ members }: RosterGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 px-4">
      {members.map((member) => (
        <RosterMemberCard key={member.id} member={member} />
      ))}
    </div>
  )
}
```

**Responsibilities:**
- Responsive grid (2 col mobile, 3 tablet, 4 desktop)
- Gap/padding for touch targets
- Maps members to cards

---

### 7B: RosterMemberCard Component

**Input:** `member: RosterMember`

**Output:** Member profile card with avatar, name, role badge, email hint

```typescript
// src/features/roster/components/RosterMemberCard.tsx

interface RosterMemberCardProps {
  member: RosterMember
  showEmail?: boolean
}

export function RosterMemberCard({ member, showEmail }: RosterMemberCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow">
      {/* Avatar */}
      <img
        src={member.profile.avatar_url || `https://...initials`}
        alt={member.profile.full_name || 'Member'}
        className="w-12 h-12 rounded-full object-cover mb-2"
      />
      
      {/* Name */}
      <h3 className="font-semibold text-sm truncate w-full">
        {member.profile.full_name || 'Unknown'}
      </h3>
      
      {/* Role Badge */}
      <span className="text-xs font-medium px-2 py-1 rounded-full mt-1 bg-blue-100 text-blue-700">
        {getRoleLabel(member.role)}
      </span>
      
      {/* Email (optional) */}
      {showEmail && (
        <p className="text-xs text-gray-500 mt-2 truncate w-full">
          {member.profile.email || '—'}
        </p>
      )}
      
      {/* Joined Date */}
      <p className="text-xs text-gray-400 mt-1">
        Joined {formatDate(member.joined_at)}
      </p>
    </div>
  )
}

function getRoleLabel(role: RosterRole): string {
  const labels: Record<RosterRole, string> = {
    [RosterRole.COACH]: 'Coach',
    [RosterRole.PLAYER]: 'Player',
    [RosterRole.PARENT]: 'Parent',
    [RosterRole.MANAGER]: 'Manager',
    [RosterRole.PENDING]: 'Pending',
  }
  return labels[role]
}
```

**Responsibilities:**
- Display member avatar with fallback
- Show name, role badge, email, joined date
- Touch-friendly sizing
- Responsive text truncation

**Styling:**
- Min 48px avatar (touch target)
- Consistent card styling
- Color-coded role badges
- Hover effect for interactivity hint

---

### 7C: RosterSectionHeader Component

**Input:** `role: RosterRole`, `count: number`

**Output:** Section header with role name and member count

```typescript
// src/features/roster/components/RosterSectionHeader.tsx

interface RosterSectionHeaderProps {
  role: RosterRole
  count: number
}

export function RosterSectionHeader({ role, count }: RosterSectionHeaderProps) {
  const label = getRoleLabel(role)
  
  return (
    <div className="px-4 py-2 flex items-center justify-between">
      <h2 className="text-lg font-bold text-gray-900">{label}</h2>
      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        {count}
      </span>
    </div>
  )
}
```

**Responsibilities:**
- Display role name and member count
- Consistent typography
- Visual separation

---

### Task 7 Dependencies
- Task 1: Types & enums
- Task 6: Called by RosterList
- Existing: Tailwind, shadcn/ui
- Utils: `formatDate()`, `getRoleLabel()`

### Task 7 Notes
- Avatar fallback: use initials or default icon
- Role badges use distinct colors for each role
- Cards are read-only (no click handlers yet)
- Touch targets 48–56px minimum
- Truncate long names/emails

---

## Task 8: Styling & Responsive Design

**Category:** Styling & Responsive  
**Duration:** 1.5 hours | **LOC:** 200–250  
**Priority:** 🟡 HIGH (depends on task 7; blocks task 9)

### Files to Create/Modify
```
src/features/roster/
├── components/ (all `.tsx` files)
├── styles/
│   └── roster.css (optional, if needed beyond Tailwind)
```

### Input
- Existing Tailwind config
- Existing design system (shadcn/ui, colors)

### Output
- Fully responsive layout (mobile 320px → desktop 1920px)
- Touch-friendly interactions
- Optimized for outdoor use (high contrast, clear hierarchy)

### Responsive Breakpoints
```
Mobile (320–640px):
  - Grid: 2 columns
  - Avatar: 48px
  - Touch target: 56px min
  - Font sizes: sm (12px), base (14px)
  - Spacing: 4px gaps

Tablet (641–1024px):
  - Grid: 3 columns
  - Avatar: 56px
  - Spacing: 16px gaps

Desktop (1025px+):
  - Grid: 4 columns
  - Avatar: 64px
  - Spacing: 20px gaps
```

### Tailwind Classes to Use
```
Layout:
  grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
  gap-4 px-4 py-2
  space-y-6

Cards:
  bg-white border border-gray-200
  rounded-lg shadow-sm hover:shadow-md
  p-3 sm:p-4
  transition-shadow

Typography:
  text-sm sm:text-base
  font-semibold font-medium
  text-gray-900 text-gray-500 text-gray-400
  truncate line-clamp-2

Badges:
  px-2 py-1 rounded-full text-xs font-medium
  bg-blue-100 text-blue-700
  
Spacing:
  pb-24 (below bottom nav)
  mb-2 mb-4
  space-y-6
```

### Touch Target Validation
```
✅ Cards: min 48px × 48px
✅ Avatars: 48px minimum
✅ Buttons: 44–56px
✅ Spacing between cards: 16px
✅ Horizontal padding: 16px on mobile
```

### Color Coding by Role
```
Coach:    bg-purple-100 text-purple-700
Player:   bg-blue-100 text-blue-700
Parent:   bg-green-100 text-green-700
Manager:  bg-orange-100 text-orange-700
Pending:  bg-gray-100 text-gray-700
```

### Performance Considerations
- Lazy-load avatar images (Task 13)
- Use `object-cover` to prevent layout shift
- CSS transitions only on non-critical properties
- No animations on page load

### Testing Viewports
```
Mobile: iPhone SE (375px), iPhone 12 (390px), Android (412px)
Tablet: iPad (768px), iPad Pro (1024px)
Desktop: Laptop (1440px), Ultra-wide (1920px)
```

### Dependencies
- Tasks 5–7: Components to style
- Existing: `tailwind.config.js`, shadcn/ui

### Notes
- Use mobile-first approach (mobile defaults, then sm/md/lg)
- High contrast for outdoor readability
- Large text sizes for quick scanning
- Minimize animations (outdoor use)
- Test on actual mobile devices if possible

---

## Task 9: Bottom Navigation Integration

**Category:** Integration  
**Duration:** 1 hour | **LOC:** 50–80  
**Priority:** 🟢 MEDIUM (depends on task 5; final integration)

### Files to Modify
```
src/components/shared/
└── BottomNav.tsx (MODIFY)
```

### Changes Required

**Current BottomNav structure (example):**
```typescript
// Before
const NAV_ITEMS = [
  { label: 'Schedule', icon: Calendar, path: '/teams/$teamId/schedule' },
  { label: 'Announcements', icon: Bell, path: '/teams/$teamId/announcements' },
  { label: 'Payments', icon: DollarSign, path: '/teams/$teamId/payments' },
]

// After
const NAV_ITEMS = [
  { label: 'Schedule', icon: Calendar, path: '/teams/$teamId/schedule' },
  { label: 'Roster', icon: Users, path: '/teams/$teamId/roster' },     // NEW
  { label: 'Announcements', icon: Bell, path: '/teams/$teamId/announcements' },
  { label: 'Payments', icon: DollarSign, path: '/teams/$teamId/payments' },
]
```

### Input
- `teamId` from route context
- Existing nav structure

### Output
- "Roster" tab added to bottom nav
- Icon: `Users` (lucide-react)
- Route: `/teams/$teamId/roster`
- Active state styling when on roster page

### Dependencies
- Task 4: Route exists at `/teams/$teamId/roster`
- Task 5: `RosterPage` component exists

### Implementation Details
```typescript
import { Users } from 'lucide-react'

// Add to NAV_ITEMS array:
{
  label: 'Roster',
  icon: Users,
  path: '/teams/$teamId/roster',
  position: 2, // between Schedule and Announcements
}
```

### Notes
- Use existing nav styling/icons
- Active state determined by current route
- No new styles needed
- Test active state highlighting on roster page

---

# PHASE 3: POLISH & TESTING

## Task 10: Loading Skeleton State

**Category:** Component Layer (States)  
**Duration:** 1 hour | **LOC:** 100–150  
**Priority:** 🟢 MEDIUM (depends on task 5)

### Files to Create
```
src/features/roster/components/
└── RosterSkeleton.tsx
```

### Input
- None (standalone loading state)

### Output
- Skeleton placeholders matching RosterMemberCard layout
- Smooth fade-in animation when real data loads

### Component Structure
```typescript
// src/features/roster/components/RosterSkeleton.tsx

export function RosterSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-6 pb-24 px-4">
      {/* Section Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        
        {/* Grid of Card Skeletons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2 p-3 rounded-lg">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Dependencies
- Existing: `Skeleton` component (shadcn/ui)
- Task 7: RosterMemberCard layout reference

### Notes
- Show 8 placeholders by default (2 sections × 4 cards)
- Match exact RosterMemberCard layout
- Use `pulse` animation (Tailwind)
- Fade to real content when loaded

---

## Task 11: Error & Empty States

**Category:** Error Handling  
**Duration:** 1 hour | **LOC:** 100–150  
**Priority:** 🟢 MEDIUM (depends on task 5)

### Files to Create/Modify
```
src/features/roster/components/
└── RosterPage.tsx (add error/empty state rendering)
```

### Error Cases

**1. RLS Denied (Access Denied)**
```typescript
error: "new row violates row-level security policy"
```
**Display:**
```
❌ "You don't have access to this roster"
"Contact a team manager to verify your access."
```

**2. Network Error (Offline)**
```typescript
error: "Failed to fetch"
```
**Display:**
```
❌ "Connection lost"
"Check your internet connection. Tap retry when ready."
[Retry Button]
```

**3. Team Not Found (404)**
```typescript
error: "team_id does not exist"
```
**Display:**
```
❌ "Team not found"
[Back to Teams Button]
```

**4. Generic Error**
```typescript
error: "Unknown error occurred"
```
**Display:**
```
❌ "Oops, something went wrong"
"Try again or contact support."
[Retry Button]
```

### Empty States

**1. No Members (Unusual but possible)**
```
📋 Empty state
"No team members yet"
"Invite coaches, players, and parents to get started."
```

**2. Only Pending Members**
```
📋 Empty state
"Waiting for team members"
"Pending invitations: 3 coaches, 2 players"
```

### Implementation

```typescript
// In RosterPage.tsx

if (isLoading) return <RosterSkeleton count={8} />

if (error) {
  const message = getErrorMessage(error)
  return (
    <PageShell title="Roster">
      <ErrorMessage 
        title={message.title}
        description={message.description}
        onRetry={() => refetch()}
      />
    </PageShell>
  )
}

if (!sections?.length && !isLoading) {
  return (
    <PageShell title="Roster">
      <EmptyState
        icon={Users}
        title="No team members yet"
        description="Invite coaches, players, and parents to get started."
      />
    </PageShell>
  )
}

function getErrorMessage(error: Error) {
  if (error.message.includes('row-level security')) {
    return {
      title: 'Access Denied',
      description: 'You don't have access to this roster.',
    }
  }
  // ... other error types
  return {
    title: 'Oops, something went wrong',
    description: 'Try again or contact support.',
  }
}
```

### Dependencies
- Existing: `ErrorMessage`, `EmptyState` components
- Task 5: RosterPage component

### Notes
- Use existing error components for consistency
- Include retry mechanism
- User-friendly messaging (not technical errors)
- Guide users to next action (back, retry, contact)

---

## Task 12: E2E Testing

**Category:** Testing  
**Duration:** 1–1.5 hours | **LOC:** 150–200 (test code)  
**Priority:** 🟢 MEDIUM

### Test Files to Create
```
src/features/roster/
└── __tests__/
    ├── roster.integration.test.ts
    ├── roster.permissions.test.ts
    └── roster.e2e.test.ts (if using Playwright)
```

### Test Scenarios

**1. Permission Tests (RLS Validation)**
```typescript
test('User can view own team roster')
test('User cannot view other team rosters')
test('Pending members cannot view roster')
test('Different roles see same roster (read-only)')
```

**2. Data Loading Tests**
```typescript
test('Roster loads within 2 seconds')
test('Members display in correct role order')
test('Cache hit returns data under 500ms')
test('Stale data refetches after 5 minutes')
```

**3. State Transition Tests**
```typescript
test('Loading skeleton shows while fetching')
test('Displays error with retry on failure')
test('Empty state shows when no members')
test('Success state renders all members')
```

**4. UI Interaction Tests**
```typescript
test('Touch targets are 48px minimum')
test('Grid responds on mobile viewport')
test('Avatar fallback shows when image fails')
test('Bottom nav highlights roster page')
test('Navigation back button works')
```

**5. Mobile Responsiveness Tests**
```typescript
test('Grid: 2 columns on mobile')
test('Grid: 3 columns on tablet')
test('Grid: 4 columns on desktop')
test('No horizontal scroll on mobile')
```

### Sample Test Structure
```typescript
// src/features/roster/__tests__/roster.permissions.test.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RosterPage } from '../components/RosterPage'

describe('Roster Permissions', () => {
  beforeEach(() => {
    // Setup test data, mocks
  })

  it('allows team member to view roster', async () => {
    // Mock user as team member
    // Mock query to return roster
    render(<RosterPage teamId="test-team-1" />)
    
    await screen.findByText('Coach')
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('denies non-member access', async () => {
    // Mock user as different team
    // Mock RLS error
    render(<RosterPage teamId="other-team" />)
    
    await screen.findByText('You don't have access to this roster')
  })
})
```

### Dependencies
- Vitest (testing framework)
- React Testing Library
- Supabase mock/test client
- Task 5: RosterPage component

### Notes
- Test RLS enforcement (most critical)
- Performance targets (2s load, 500ms cache)
- State transitions and error handling
- Mobile viewport sizes

---

## Task 13: Performance Optimization

**Category:** Performance  
**Duration:** 0.5 hours | **LOC:** 50–100  
**Priority:** 🟢 LOW (polish task)

### Optimizations to Implement

**1. Avatar Image Lazy Loading**
```typescript
// RosterMemberCard.tsx

<img
  src={member.profile.avatar_url || fallback}
  alt={member.profile.full_name}
  loading="lazy"           // Native lazy-load
  className="w-12 h-12 rounded-full object-cover mb-2"
/>
```

**2. Query Optimization (Service Layer)**
```typescript
// roster.ts

// Only fetch avatar_url if image was recently updated
// Use Supabase select() to limit fields if needed
export async function fetchRosterWithProfiles(
  supabase: SupabaseClient,
  teamId: string
) {
  return supabase
    .from('team_members')
    .select(`
      id,
      team_id,
      user_id,
      role,
      created_at,
      profiles(id, full_name, email, avatar_url)
    `)
    .eq('team_id', teamId)
    .order('role', { ascending: true })
    .order('created_at', { ascending: true })
}
```

**3. Memoization (Hook Layer)**
```typescript
// useRoster.ts — grouping memoized

export function useGroupedRoster({ teamId, enabled = true }) {
  const { data: members } = useRoster({ teamId, enabled })
  
  // Memoize grouping to prevent unnecessary re-renders
  const sections = useMemo(() => {
    if (!members) return []
    return groupByRole(members)
  }, [members])
  
  return { sections, ... }
}
```

**4. Virtual Scrolling (Optional, if 100+ members)**
```typescript
// Future optimization — not in MVP
// Use react-window or react-virtual for large rosters
```

**5. Network Request Optimization**
```
✅ Query limits: 100 members max (paginate beyond)
✅ Compression: Supabase handles gzip
✅ Cache headers: 5-min staleTime
✅ Background refetch: enabled by default
```

### Metrics to Monitor
```
✅ Initial load: < 2s
✅ Cache hit: < 500ms
✅ Avatar image load: < 1s (lazy)
✅ Core Web Vitals: FCP < 1.8s, LCP < 2.5s
```

### Dependencies
- All previous tasks (refactor existing code)
- Optional: `react-window` (if >100 members)

### Notes
- Lazy loading handles most performance
- Memoization prevents expensive re-renders
- Monitor in production with performance tools
- Pagination (Phase 2) if roster grows beyond 100 members

---

# 📋 IMPLEMENTATION CHECKLIST

## Phase 1: Foundation (4–6 hours)
- [ ] Task 1: Types/Enums (`src/features/roster/types/index.ts`)
- [ ] Task 2: Service layer (`src/features/roster/services/roster.ts`)
- [ ] Task 3: useRoster hook (`src/features/roster/hooks/useRoster.ts`)
- [ ] Task 4: Route setup (`src/routes/teams/$teamId/roster.tsx`)
- [ ] Verify types compile, hooks export correctly, route appears

## Phase 2: UI Components (6–8 hours)
- [ ] Task 5: RosterPage component (container)
- [ ] Task 6: RosterList component (orchestrator)
- [ ] Task 7: RosterGrid, RosterMemberCard, RosterSectionHeader
- [ ] Task 8: Tailwind styling & responsiveness
- [ ] Task 9: Bottom nav integration (add Roster tab)
- [ ] Manual testing: Load page, verify layout, test mobile viewport

## Phase 3: Polish (2–4 hours)
- [ ] Task 10: Loading skeleton
- [ ] Task 11: Error & empty states
- [ ] Task 12: E2E test suite
- [ ] Task 13: Performance optimization (lazy load, memoize)
- [ ] Production build test, lighthouse audit

---

# 🔗 DEPENDENCY SUMMARY

```
Tier 0 (Foundation — starts everything):
  1. Types

Tier 1 (Builds on Types):
  2. Service
  3. Hook
  4. Route

Tier 2 (Builds on Hooks):
  5. RosterPage
  6. RosterList
  7. RosterGrid/Card

Tier 3 (Builds on Components):
  8. Styling
  9. Nav Integration

Tier 4 (Polish — optional):
  10. Skeleton
  11. Error/Empty
  12. Testing
  13. Performance
```

**Critical Path (tasks that block others):**
1 → 2 → 3 → 5 → 6 → 7 → 8 → 9

**Parallel streams (can work simultaneously):**
- Task 10 (skeleton) while 5–7 in progress
- Task 11 (error states) while 5 in progress
- Task 12 (tests) after 5–7 complete
- Task 13 (optimization) last

---

# 📊 EFFORT DISTRIBUTION

| Task | Category | Hours | LOC | Phase |
|------|----------|-------|-----|-------|
| 1 | Types | 1 | 100 | 1 |
| 2 | Service | 1.5 | 150 | 1 |
| 3 | Hook | 1 | 120 | 1 |
| 4 | Route | 0.5 | 50 | 1 |
| 5 | Component | 1.5 | 200 | 2 |
| 6 | Component | 1.5 | 160 | 2 |
| 7 | Component | 2 | 320 | 2 |
| 8 | Styling | 1.5 | 250 | 2 |
| 9 | Integration | 1 | 80 | 2 |
| 10 | Skeleton | 1 | 150 | 3 |
| 11 | Error/Empty | 1 | 150 | 3 |
| 12 | Testing | 1.5 | 200 | 3 |
| 13 | Performance | 0.5 | 100 | 3 |
| **TOTAL** | | **17.5h** | **1,970** | |

---

# ✅ SUCCESS CRITERIA

**Functionality:**
- [ ] Roster page loads for authorized team members
- [ ] Members display grouped by role (Coach → Player → Parent → Manager)
- [ ] Role badges display correctly with colors
- [ ] Loading/error/empty states render
- [ ] RLS enforced (only team members see roster)

**Performance:**
- [ ] Initial load < 2 seconds
- [ ] Cache hit < 500 milliseconds
- [ ] Avatar lazy-loading working

**UX:**
- [ ] Touch targets 48px minimum
- [ ] Mobile: 2-col grid, no horizontal scroll
- [ ] Tablet: 3-col grid responsive
- [ ] "Roster" tab in bottom nav highlights when active

**Code Quality:**
- [ ] TypeScript strict mode (no `any`)
- [ ] Reusable hooks/services
- [ ] Feature folder isolation
- [ ] Tests passing

---

Generated: 2026-05-18 | Based on: [roster.plan.md](roster.plan.md)
