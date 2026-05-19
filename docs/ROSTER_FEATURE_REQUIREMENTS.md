# Roster Feature Requirements — Dugout MVP

**Feature**: Display team roster with members and their roles

**Status**: Requirements definition  
**Priority**: High (core experience)  
**Sprint**: 2-3  
**Epic**: Team Management

---

## Executive Summary

The Roster feature enables all team members (coaches, managers, parents, players) to view who is on their team, understand roles and responsibilities, and coordinate activities (pickups, communication, etc.). This is a read-only view in MVP with no editing capability.

---

## Access Control

### Who Can View the Roster?

**✅ All team members can view their team's roster**

- Admins
- Coaches
- Managers
- Players
- Parents

**🔒 Row-Level Security (RLS)**

```
Users can view rosters for teams they are members of.
Users cannot view rosters for teams they don't belong to.
```

### No Editing in MVP

- Roster is read-only in MVP
- Role changes and member removal handled via team admin dashboard (future)
- Invitations are separate flow (already exists)

---

## Data Requirements

### What Information Is Displayed?

#### Minimum Display (MVP)

```
Per team member:
- Full name
- Role (admin, coach, manager, player, parent)
- Contact info preference:
  • Email (always visible to team members)
  • Phone (if provided by user)
- Avatar/initials (if provided)
- Joined date (optional, helpful for context)
```

#### Future Expansion (Post-MVP)

- Jersey number (for players only)
- Position (for players only)
- Uniform size (for ordering merch)
- Parent/guardian relationship (to player)
- Emergency contact flag

### Data Structure

```
Roster item:
{
  id: uuid
  team_id: uuid
  user_id: uuid
  full_name: string
  email: string (from profiles)
  phone: string | null (future: add to profiles)
  role: team_role ('admin' | 'coach' | 'manager' | 'player' | 'parent')
  avatar_url: string | null (from profiles)
  joined_at: timestamp
  
  // Future fields
  jersey_number: integer | null
  position: string | null
  uniform_size: string | null
  is_emergency_contact: boolean
}
```

### Query Requirements

```sql
-- Roster query (with profile data)
SELECT 
  tm.id,
  tm.team_id,
  tm.user_id,
  tm.role,
  tm.joined_at,
  p.full_name,
  p.email,
  p.avatar_url
FROM team_members tm
JOIN profiles p ON tm.user_id = p.id
WHERE tm.team_id = $1
ORDER BY tm.role DESC, p.full_name ASC;
```

---

## UI/UX Design

### Mobile-First Layout

#### Roster List View (Primary State)

```
┌─────────────────────────────────┐
│  Roster                    (X)  │  ← Page header
├─────────────────────────────────┤
│                                 │
│  Coaches (1)                    │  ← Section headers
│  ┌─────────────────────────────┐│
│  │ [A] Alex Johnson      Coach │  ← Member card (tall tap target)
│  │     alex@email.com          │  ← Email
│  └─────────────────────────────┘│
│                                 │
│  Players (6)                    │
│  ┌─────────────────────────────┐│
│  │ [J] Jamie Martinez    Player│  ← Grouped by role
│  │     jamie@email.com         │
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │ [M] Marcus Thompson   Player│
│  │     marcus@email.com        │
│  └─────────────────────────────┘│
│                                 │
│  Parents (8)                    │
│  ┌─────────────────────────────┐│
│  │ [S] Sarah Chen        Parent│
│  │     sarah@email.com         │
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

#### Design Specs

- **Grouping**: Section headers group members by role
- **Avatar**: 48px circle with initials (fallback to first letter + last initial)
- **Card height**: Minimum 60px for touch targets
- **Padding**: 16px horizontal, 8px vertical between items
- **Typography**:
  - Name: 16px, semibold, dark
  - Email: 14px, muted gray, clipped after 2 lines
  - Role: 12px, uppercase, colored badge (optional)
- **Spacing**: 12px between sections
- **Scroll**: Full-height scrollable container

### Member Detail View (Tap)

When user taps a member card, show a sheet/modal:

```
┌─────────────────────────────────┐
│            ← Back               │  ← Header with back button
├─────────────────────────────────┤
│                                 │
│         [AVATAR LARGE]          │
│         150x150px               │
│                                 │
│       Jamie Martinez            │  ← Name
│         Player                  │  ← Role badge
│                                 │
├─────────────────────────────────┤
│  Email                          │
│  jamie@email.com                │  ← Tappable (copy or email)
│                                 │
│  Joined                         │
│  May 10, 2026                   │
│                                 │
│  [Copy Email]                   │
│  [Message] (if messaging added) │
│                                 │
└─────────────────────────────────┘
```

### Sorting & Filtering

#### Sorting (MVP)

**Default sort order:**
1. By role: Admin → Coach → Manager → Player → Parent
2. Within role: Alphabetical by full name

**Optional sort (if time permits):**
- Recently joined
- Alphabetical

#### Filtering (MVP)

**No filtering in MVP** — roster is small and scannable.

**Future filtering options:**
- Filter by role
- Search by name
- Show/hide parents

### Empty States

```
┌─────────────────────────────────┐
│  Roster                         │
├─────────────────────────────────┤
│                                 │
│        (sad team icon)          │
│                                 │
│     No team members yet         │
│                                 │
│  Invite players and parents to  │
│  get started. Once they join,   │
│  they'll appear here.           │
│                                 │
│      [Invite Team Members]      │
│                                 │
└─────────────────────────────────┘
```

### Error States

```
┌─────────────────────────────────┐
│  Roster                         │
├─────────────────────────────────┤
│                                 │
│        (error icon)             │
│                                 │
│     Something went wrong        │
│                                 │
│  We couldn't load the roster.   │
│  Please try again.              │
│                                 │
│         [Retry]                 │
│                                 │
└─────────────────────────────────┘
```

### Loading State

```
┌─────────────────────────────────┐
│  Roster                         │
├─────────────────────────────────┤
│                                 │
│    ◯ (spinner)                  │
│                                 │
│    Loading roster…              │
│                                 │
└─────────────────────────────────┘
```

---

## Mobile Interactions

### Touch Targets

- Minimum 44x44 pt (88x88 px at 2x)
- Roster member card: 60px height minimum
- Tap entire card to view details
- Active state: Subtle background highlight (#f0f0f0)

### Gestures

- **Tap member**: Open detail sheet
- **Swipe left to detail sheet**: Close detail sheet
- **Back button**: Dismiss detail sheet and return to list
- **Pull to refresh**: Reload roster data

### Phone Numbers

```
- Tap to call
- Long-press to copy
- Long-press to message (if messaging added)
```

### Accessibility

- Role badge with visible label (not just color)
- High contrast for names and email
- Semantic HTML: use <button> for tappable members
- ARIA labels: "Jamie Martinez, Player"
- Focus indicators for keyboard navigation

---

## User Stories & Acceptance Criteria

### Priority 1 (Must Have - MVP)

#### US-1: Coach Views Full Team Roster

**As a** coach  
**I want to** see all team members with their names and email addresses  
**So that** I can contact parents and coordinate with my team

**Acceptance Criteria:**
- [ ] Roster page displays all team members grouped by role
- [ ] Each member shows: avatar, full name, email, role
- [ ] Members are sorted: admins/coaches first, then alphabetical by name
- [ ] Roster loads within 2 seconds
- [ ] Page includes back button or footer nav to return to team dashboard
- [ ] Loading spinner shown while fetching data
- [ ] Error message shown if roster fails to load with retry button
- [ ] Empty state shown if team has no members

**Technical Notes:**
- Use TanStack Query with 5-minute cache
- Single query: `team_members` + `profiles` join
- Implement RLS check via Supabase policy

---

#### US-2: Parent Sees Other Team Members for Coordination

**As a** parent  
**I want to** see names and contact info of other parents and players  
**So that** I can coordinate pickups and ask questions

**Acceptance Criteria:**
- [ ] Parent views same roster list as coach (no role-based filtering in MVP)
- [ ] Email addresses are clearly visible and tappable
- [ ] Can scroll through entire roster smoothly on mobile
- [ ] Roster reflects all current team members in real-time (or within 30 sec)

**Technical Notes:**
- Same query as US-1
- Supabase RLS ensures parent can only see their own team

---

#### US-3: Player Knows Their Team Roster

**As a** player  
**I want to** see who else is on my team  
**So that** I know my teammates and can connect with them

**Acceptance Criteria:**
- [ ] Player sees roster with names, avatars, and roles
- [ ] Player can see parent names and contact info
- [ ] Roster is easily accessible from team dashboard
- [ ] Mobile-friendly layout with large tap targets

**Technical Notes:**
- Same implementation as US-1 and US-2
- All users (admins, coaches, managers, players, parents) see identical roster

---

### Priority 2 (Should Have - Soon After MVP)

#### US-4: User Views Member Details

**As a** any team member  
**I want to** tap on a roster member to see more details  
**So that** I can decide if I want to contact them or learn more

**Acceptance Criteria:**
- [ ] Tapping a member opens a detail sheet/modal
- [ ] Detail view shows: avatar (larger), name, role, email, joined date
- [ ] Email is tappable to open mail client or copy
- [ ] Sheet can be dismissed by back button or swipe down
- [ ] No jank or loading delay when opening detail

**Technical Notes:**
- Use `@radix-ui/react-dialog` or custom sheet component
- Might need to pre-fetch all member data to avoid delays
- Consider optimistic UI

---

#### US-5: Search or Filter Roster

**As a** coach on a large team (20+ members)  
**I want to** filter roster by role or search by name  
**So that** I can quickly find a specific person

**Acceptance Criteria:**
- [ ] Search box filters roster by full name (real-time as user types)
- [ ] Filter buttons for role (Players, Parents, Coaches, etc.)
- [ ] Search + filter can be combined
- [ ] Clear button to reset search/filter
- [ ] Results update instantly on mobile (< 200ms)

**Technical Notes:**
- Client-side filtering (data already loaded)
- Only implement if MVP roster gets > 15 members

---

### Priority 3 (Nice to Have - Future)

#### US-6: Contact Team Member

**As a** any team member  
**I want to** contact another team member directly from the roster  
**So that** I don't have to copy/paste contact info

**Acceptance Criteria:**
- [ ] Tap email → opens mail client with compose pre-filled
- [ ] Tap phone → initiates call or SMS
- [ ] Works on mobile and web (web shows copy button instead)

**Technical Notes:**
- Use `mailto:` and `tel:` links
- Requires `phone` field on profiles table

---

## Data Model

### Database Tables (Already Exist)

#### `profiles`
```sql
id (uuid, pk)
full_name (text)
email (text, from auth)
avatar_url (text, nullable)
created_at (timestamp)
updated_at (timestamp)
```

#### `team_members`
```sql
id (uuid, pk)
team_id (uuid, fk)
user_id (uuid, fk) → profiles.id
role (team_role enum: 'admin'|'coach'|'manager'|'player'|'parent')
joined_at (timestamp)
unique(team_id, user_id)
```

#### `teams`
```sql
id (uuid, pk)
name (text)
sport (text, default='baseball')
season (text, nullable)
created_by (uuid, fk)
created_at (timestamp)
updated_at (timestamp)
```

### Future Table Extensions

```sql
-- Add to profiles table (post-MVP)
ALTER TABLE profiles ADD COLUMN phone TEXT;
ALTER TABLE profiles ADD COLUMN phone_verified BOOLEAN DEFAULT false;

-- Future: player-specific data
CREATE TABLE player_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  jersey_number INTEGER,
  position TEXT,
  uniform_size TEXT,
  batting_hand TEXT,
  throwing_hand TEXT
);
```

### RLS Policies

```sql
-- team_members: Team members can view all members of their team
CREATE POLICY "team_members_can_view_their_team"
  ON team_members
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- profiles: All authenticated users can view all profiles
CREATE POLICY "users_can_view_all_profiles"
  ON profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

---

## Frontend Architecture

### Feature Structure

```
features/teams/
├── components/
│   ├── RosterList.tsx         # Main roster list
│   ├── RosterMemberCard.tsx   # Individual member card
│   ├── RosterMemberDetail.tsx # Detail sheet/modal
│   └── RosterEmpty.tsx        # Empty state
├── hooks/
│   ├── useTeamRoster.ts       # Fetch roster data
│   ├── useMemberDetail.ts     # Track selected member
│   └── useRosterSort.ts       # Sorting logic
├── services/
│   └── roster.ts              # Supabase queries
├── types/
│   └── roster.ts              # RosterMember, etc.
└── utils/
    ├── sortRoster.ts          # Sort/filter helpers
    └── formatRoster.ts        # Format for display
```

### Component API

#### `<RosterList />`
```tsx
interface RosterListProps {
  teamId: string;
  onMemberSelect?: (member: RosterMember) => void;
}
```

#### `<RosterMemberCard />`
```tsx
interface RosterMemberCardProps {
  member: RosterMember;
  onClick?: () => void;
}
```

#### `<RosterMemberDetail />`
```tsx
interface RosterMemberDetailProps {
  member: RosterMember;
  isOpen: boolean;
  onClose: () => void;
}
```

### Hook: `useTeamRoster`
```tsx
function useTeamRoster(teamId: string) {
  return useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Service: `roster.ts`
```tsx
export async function fetchTeamRoster(
  teamId: string,
  client: SupabaseClient = supabase
): Promise<RosterMember[]> {
  const { data, error } = await client
    .from('team_members')
    .select(`
      id,
      team_id,
      user_id,
      role,
      joined_at,
      profiles:user_id (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('team_id', teamId)
    .order('role', { ascending: false })
    .order('profiles(full_name)', { ascending: true });

  if (error) throw error;
  return data;
}
```

---

## Performance Considerations

### Caching Strategy

- **Primary cache**: 5 minutes (TanStack Query)
- **Stale timeout**: 10 minutes
- **Refetch on**: window focus, manual retry
- **Prefetch**: When viewing team details (not strictly necessary)

### Bundle Size

- No new dependencies (use existing shadcn/ui Dialog)
- ~2KB gzipped additional code (estimate)

### Mobile Performance

- Lazy-load avatars
- Virtual scroll if roster > 50 members (not needed for MVP)
- Prefetch on scroll approach (not needed for MVP)

---

## Testing Requirements

### Unit Tests

```
✓ sortRoster(members, 'role') → correct grouping
✓ formatMemberName(profile) → handles nulls
✓ isCoach(teamMember) → true/false
```

### Integration Tests

```
✓ fetchTeamRoster(teamId) → returns correct members
✓ RLS policy blocks viewing other team's roster
✓ Deleted member removed from roster in real-time
```

### E2E Tests

```
✓ Coach opens Roster page → sees all members
✓ Tap member card → detail sheet opens
✓ Scroll through roster → smooth on mobile
✓ Pull to refresh → updates roster
✓ Empty team → empty state renders
✓ Network error → error state with retry
```

---

## Accessibility

### WCAG 2.1 AA Compliance

- [ ] Role badges have text labels (not just color)
- [ ] Email links are distinct from regular text
- [ ] Contrast ratio ≥ 4.5:1 for text
- [ ] Touch targets ≥ 44x44 pt
- [ ] Focus indicators visible on keyboard nav
- [ ] Screen reader announces member role
- [ ] Detail sheet has `aria-modal="true"`

### Mobile Accessibility

- [ ] Zoom doesn't break layout (no fixed widths < 100%)
- [ ] Text is readable at 200% zoom
- [ ] Color is not sole indicator of member type

---

## Localization (Future)

Strings to externalize (for future i18n):

```
"Roster"
"Coaches"
"Players"
"Parents"
"No team members yet"
"Loading roster…"
"Something went wrong"
"Joined"
"Copy Email"
```

---

## Success Metrics

### Adoption

- 90% of coaches access roster within first week of team creation
- 70% of parents view roster at least once per season
- Average session time on roster: 30-60 seconds

### Performance

- Roster loads in <2 seconds (including network)
- 99% uptime
- <50ms interaction response time (detail sheet)

### Quality

- Zero critical bugs in first 2 weeks
- Mobile experience rated ≥4/5 stars
- Accessibility audit passes WCAG AA

---

## Rollout Plan

### Phase 1: Core (Sprint 2-3)
- [x] Roster list with members + roles
- [x] Grouped by role, sorted alphabetically
- [x] Loading/error/empty states
- [x] RLS policies

### Phase 2: Details (Sprint 3)
- [ ] Tap member to see detail sheet
- [ ] Joined date display
- [ ] Mobile-optimized detail UI

### Phase 3: Search (Sprint 4+)
- [ ] Name search
- [ ] Role filter
- [ ] Only if team size grows

### Phase 4: Contact (Future)
- [ ] Email/phone links
- [ ] Add phone to profiles
- [ ] In-app messaging (major feature, post-MVP)

---

## Questions & Decisions

### Decision 1: All Roles See Identical Roster?

**Question**: Should parents see fewer members (e.g., just other parents)?  
**Decision**: **No** — all roles see the complete roster in MVP.  
**Rationale**: Simple MVP, trust-based community, coaches need transparency.

---

### Decision 2: Real-time Updates with Supabase Realtime?

**Question**: Should roster sync in real-time when members join/leave?  
**Decision**: **Not in MVP** — use 5-minute cache refresh.  
**Rationale**: Complexity trade-off; turnover is low; UI state management is simpler.  
**Future**: Add Supabase Realtime subscribe for live updates once stable.

---

### Decision 3: Phone Number Visibility?

**Question**: Should coaches see all parents' phone numbers?  
**Decision**: **Not in MVP** — email only initially.  
**Rationale**: Privacy concern; MVP doesn't require it; can add later with consent flow.

---

### Decision 4: Member Editing/Removal?

**Question**: Should this page have edit/remove buttons?  
**Decision**: **No** — roster is read-only in MVP.  
**Rationale**: Simplify first version; editing/removal is team admin feature (future).

---

## Dependencies

- Supabase RLS policies (must be updated)
- `profiles` table (already exists)
- `team_members` table (already exists)
- `teams` table (already exists)
- shadcn/ui Dialog component (install if not already)

---

## Related Features

- **Team Dashboard**: Roster is accessed from team dashboard
- **Team Invites**: Sending invites (related but separate feature)
- **Announcements**: Posted to same roster members
- **Attendance**: Attendance by roster members
- **Payments**: Payments collected from roster members

---

## Appendix: Design Tokens

### Colors

```
Primary: #0f766e (teal)
Secondary: #f59e0b (amber)
Muted: #9ca3af (gray-400)
Danger: #ef4444 (red)
Text Dark: #1f2937 (gray-900)
Text Light: #6b7280 (gray-500)
Background: #ffffff
Background Alt: #f9fafb
Border: #e5e7eb (gray-200)
```

### Typography

```
Name (16px, semibold): Roboto 600
Email (14px, regular): Roboto 400
Role (12px, uppercase, 600): Roboto 600
```

### Spacing

```
Card height: 60px min
Card padding: 12px horizontal, 8px vertical
Section margin: 12px top
List padding: 16px horizontal, 8px vertical
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-18  
**Owner**: Product Team
