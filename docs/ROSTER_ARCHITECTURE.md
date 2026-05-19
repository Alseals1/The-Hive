# Roster Feature Architecture — Dugout

Technical design for the Roster feature in Dugout (Vite + React + Supabase).

---

## 1. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       Router Layer                              │
│            /teams/$teamId/roster (TanStack Router)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Page Component                              │
│                    RosterPage.tsx                               │
│  • Renders PageShell with title/nav                             │
│  • Orchestrates top-level state & layout                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Composite Components                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ RosterList.tsx (Primary Container)                       │  │
│  │ • Handles filtering & sorting logic                      │  │
│  │ • Manages loading/error/empty states                     │  │
│  │ • Renders RosterGrid or RosterTable based on view        │  │
│  └────────┬──────────────────────────────────────────────────┘  │
│           │                                                     │
│  ┌────────┴──────────────────────────────────────────────────┐  │
│  │ RosterGrid.tsx OR RosterTable.tsx                         │  │
│  │ • Maps roster members to RosterMemberCard/Row             │  │
│  │ • Virtualization for long lists                           │  │
│  │ • Performance optimization                                │  │
│  └────────┬──────────────────────────────────────────────────┘  │
│           │                                                     │
│  ┌────────┴──────────────────────────────────────────────────┐  │
│  │ RosterMemberCard.tsx (Reusable Member UI)                 │  │
│  │ • Displays: Avatar, Name, Role, Details                  │  │
│  │ • Clickable: Navigate to member detail page              │  │
│  │ • Admin controls: Edit role, Remove member               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
┌───────────────┐ ┌──────────────┐ ┌─────────────┐
│ Custom Hooks  │ │ Service      │ │ Type        │
│               │ │ Layer        │ │ Definitions │
│ • useRoster() │ │              │ │             │
│               │ │ • roster.ts  │ │ • types.ts  │
│ • useTeamRole │ │              │ │             │
│               │ │ Functions:   │ │ TeamMember  │
│ • useMemberCtx│ │ • fetchRoster│ │ RosterMember
│               │ │ • updateRole │ │             │
│               │ │ • removeMember
│               │ │              │ │             │
└───────────────┘ └──────────────┘ └─────────────┘
        │                ↓                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ↓                                 ↓
┌──────────────────────────────────────────────────┐
│          Supabase Client Layer                   │
│         src/lib/supabase.ts                      │
│  (Typed Supabase instance + Database types)     │
└────────────────────┬─────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ↓                         ↓
┌───────────────────────┐  ┌──────────────────────┐
│ PostgreSQL Database   │  │ Row Level Security   │
│                       │  │                      │
│ • team_members        │  │ • Team member can    │
│ • profiles (JOIN)     │  │   see all members in │
│ • teams (JOIN context)│  │   their team         │
│                       │  │                      │
│                       │  │ • Only admins/coaches│
│                       │  │   can edit roles or  │
│                       │  │   remove members     │
│                       │  │                      │
│                       │  │ • is_team_member()   │
│                       │  │   is_team_admin()    │
│                       │  │   policies enforce   │
│                       │  │   access control     │
└───────────────────────┘  └──────────────────────┘
```

---

## 2. File Structure

```
src/features/roster/
├── components/
│   ├── RosterPage.tsx              ← Router component (page root)
│   ├── RosterList.tsx              ← Container: manages state & loading
│   ├── RosterGrid.tsx              ← Display: grid layout variant
│   ├── RosterTable.tsx             ← Display: table layout variant
│   ├── RosterMemberCard.tsx        ← Reusable: single member card
│   ├── RosterMemberRow.tsx         ← Reusable: single member row
│   ├── RosterActions.tsx           ← Reusable: admin action menu
│   ├── RosterHeader.tsx            ← Filter/sort controls
│   └── RosterEmptyState.tsx        ← Empty/loading state
├── hooks/
│   ├── useRoster.ts                ← Main hook: fetches roster data
│   ├── useRosterMutations.ts       ← Hook: role updates, removals
│   ├── useTeamRole.ts              ← Hook: current user's role
│   ├── useRosterFilters.ts         ← Hook: filter/sort state
│   └── useMemberDetail.ts          ← Hook: single member detail
├── services/
│   ├── roster.ts                   ← Supabase queries
│   └── index.ts                    ← Exports
├── types/
│   ├── index.ts                    ← All roster types
│   └── queries.ts                  ← TanStack Query types (optional)
├── utils/
│   ├── formatters.ts               ← Display formatting
│   ├── filters.ts                  ← Filter functions
│   └── sorting.ts                  ← Sort functions
└── constants/
    └── roles.ts                    ← Role definitions & metadata

src/routes/teams/$teamId/
├── roster.tsx                      ← Route file (entry point)
├── roster/
│   ├── $memberId.tsx               ← Member detail page (optional)
│   └── edit.tsx                    ← Roster management page (admin)
```

---

## 3. Data Flow & RLS

### 3.1 Query Flow

```
User Navigates to /teams/{teamId}/roster
    ↓
RosterPage Route Loads (beforeLoad auth check)
    ↓
RosterPage Component Renders → calls useRoster(teamId)
    ↓
useRoster Hook (TanStack Query)
    ├─ queryKey: ["roster", teamId]
    ├─ queryFn: fetchRosterWithProfiles(teamId)
    └─ staleTime: 5 minutes (team rarely changes structure)
       ↓
       Service Layer: roster.ts → fetchRosterWithProfiles(teamId)
          ├ Call: supabase.from("team_members")
          ├ .select("id, user_id, role, joined_at, profiles(*)")
          ├ .eq("team_id", teamId)
          ├ .order("role", { ascending: false })  ← admins first
          ├ .order("profiles->full_name")
          └ Supabase Applies RLS:
             → is_team_member(teamId) check
             → Returns only if user is team member
                ↓
             ← Returns: TeamMember[] with profile data
                ↓
       useRoster Maps to RosterMember[] type (client transform)
            ├ Enriches with computed properties
            ├ Adds admin/coach detection
            └ Caches in React Query
                ↓
       RosterList Component Receives Data
            ├ Renders loading skeleton or error
            ├ Renders RosterGrid/RosterTable
            └ Each MemberCard is clickable
```

### 3.2 RLS Policies (Already in Place)

#### `team_members_select` — Readers
```sql
-- Members can see all members in their team
create policy "team_members_select"
  on public.team_members for select
  to authenticated
  using (public.is_team_member(team_id));
```
✅ Roster feature uses this to fetch team member data.

#### `team_members_insert_admins` — Writers
```sql
-- Only admins/coaches can add members
create policy "team_members_insert_admins"
  on public.team_members for insert
  to authenticated
  with check (public.is_team_admin(team_id));
```
✅ Admin invite flows will use this (outside MVP roster scope).

#### `team_members_delete_admins` — Deleters
```sql
-- Admins can remove members (or self-remove)
create policy "team_members_delete_admins"
  on public.team_members for delete
  to authenticated
  using (public.is_team_admin(team_id) or user_id = auth.uid());
```
✅ Admin roster management pages use this.

#### `profiles` Policies
```sql
-- All authenticated users can read all profiles
create policy "profiles_select_all"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can only update their own profile
create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());
```
✅ Profile data is readable by all authenticated users.

---

## 4. Type Definitions

### 4.1 Core Types (`src/features/roster/types/index.ts`)

```typescript
import type { Database } from "@/types/database";

export type TeamRole = 
  | "admin" 
  | "coach" 
  | "manager" 
  | "player" 
  | "parent";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type TeamMemberRow = 
  Database["public"]["Tables"]["team_members"]["Row"];

/**
 * Raw database row with nested profile data.
 * Result of: .select("*, profiles(*)")
 */
export type TeamMemberWithProfile = TeamMemberRow & {
  profiles: Profile | null;
};

/**
 * Normalized, enriched member data for UI.
 * Enhanced from TeamMemberWithProfile.
 */
export interface RosterMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: string;
  
  // Profile data (flattened)
  profileId: string;
  fullName: string | null;
  avatarUrl: string | null;
  
  // Computed properties (for convenience)
  isAdmin: boolean;
  isCoach: boolean;
  displayName: string;
  roleLabel: string;
}

/**
 * Roster filters for list display.
 */
export interface RosterFilters {
  searchQuery: string;
  roleFilter: TeamRole | "all";
  sortBy: "name" | "role" | "joinedAt";
  sortOrder: "asc" | "desc";
}

/**
 * Roster query state (for UI state management).
 */
export interface RosterState {
  members: RosterMember[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  filteredMembers: RosterMember[];
}

/**
 * User's context within the roster (their own role & permissions).
 */
export interface RosterContext {
  teamId: string;
  currentUserId: string;
  currentUserRole: TeamRole;
  canEditRoles: boolean;  // admin/coach only
  canRemoveMembers: boolean; // admin/coach only
  canViewDetails: boolean; // all team members
}
```

### 4.2 Mutation Types

```typescript
export interface UpdateRoleInput {
  memberId: string;
  newRole: TeamRole;
}

export interface RemoveMemberInput {
  memberId: string;
}

export interface MemberActionResult {
  success: boolean;
  message: string;
  updatedMember?: RosterMember;
}
```

---

## 5. Service Layer (`src/features/roster/services/roster.ts`)

```typescript
import { supabase } from "@/lib/supabase";
import type { TeamMemberWithProfile, RosterMember } from "../types";

/**
 * Fetch team roster with profile data.
 * RLS enforces: only team members can read roster.
 */
export async function fetchRosterWithProfiles(
  teamId: string,
): Promise<RosterMember[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      id,
      user_id,
      team_id,
      role,
      joined_at,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("team_id", teamId)
    .order("role", { ascending: false })
    .order("profiles(full_name)");

  if (error) {
    console.error("[roster] fetch error:", error);
    throw new Error(
      error.message || "Failed to fetch roster",
    );
  }

  if (!data) return [];

  return data.map(transformTeamMemberToRosterMember);
}

/**
 * Fetch single member detail by ID.
 */
export async function fetchMemberDetail(
  teamId: string,
  memberId: string,
): Promise<RosterMember> {
  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      id,
      user_id,
      team_id,
      role,
      joined_at,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("team_id", teamId)
    .eq("id", memberId)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Member not found");

  return transformTeamMemberToRosterMember(data);
}

/**
 * Update a member's role (admin/coach only).
 * RLS enforces: only admins/coaches can update.
 */
export async function updateMemberRole(
  teamId: string,
  memberId: string,
  newRole: string,
): Promise<RosterMember> {
  const { data, error } = await supabase
    .from("team_members")
    .update({ role: newRole })
    .eq("id", memberId)
    .eq("team_id", teamId) // Belt-and-suspenders check
    .select(
      `
      id,
      user_id,
      team_id,
      role,
      joined_at,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Member not found");

  return transformTeamMemberToRosterMember(data);
}

/**
 * Remove a member from the team (admin/coach only or self-remove).
 * RLS enforces: only admins/coaches or user themselves can delete.
 */
export async function removeMember(
  teamId: string,
  memberId: string,
): Promise<{ success: true }> {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", memberId)
    .eq("team_id", teamId);

  if (error) throw new Error(error.message);

  return { success: true };
}

/**
 * Transform database row to client-friendly RosterMember.
 */
function transformTeamMemberToRosterMember(
  row: TeamMemberWithProfile,
): RosterMember {
  const profile = row.profiles as any;

  return {
    id: row.id,
    userId: row.user_id,
    teamId: row.team_id,
    role: row.role,
    joinedAt: row.joined_at,
    
    profileId: profile?.id || "",
    fullName: profile?.full_name || null,
    avatarUrl: profile?.avatar_url || null,
    
    isAdmin: row.role === "admin",
    isCoach: row.role === "coach",
    displayName: profile?.full_name || "Unknown",
    roleLabel: formatRoleLabel(row.role),
  };
}

function formatRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: "Admin",
    coach: "Coach",
    manager: "Manager",
    player: "Player",
    parent: "Parent",
  };
  return labels[role] || role;
}
```

---

## 6. Custom Hooks

### 6.1 `useRoster.ts` — Main Data Hook

```typescript
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/useAuth";
import { fetchRosterWithProfiles } from "../services/roster";
import type { RosterMember, RosterContext } from "../types";

const ROSTER_STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch and cache team roster data.
 * - Auto-refetches on window focus
 * - 5-minute stale time (team composition rarely changes)
 * - Invalidates on mutations
 */
export function useRoster(teamId: string) {
  const { user } = useUser();

  const query = useQuery({
    queryKey: ["roster", teamId],
    queryFn: () => fetchRosterWithProfiles(teamId),
    enabled: !!teamId && !!user,
    staleTime: ROSTER_STALE_TIME,
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    ...query,
    data: query.data || [],
  };
}

/**
 * Get current user's role within the roster.
 * Enables permission-based UI (edit buttons, delete actions).
 */
export function useTeamRole(
  teamId: string,
  userId: string | undefined,
): RosterContext | null {
  const { data: members } = useRoster(teamId);

  if (!userId) return null;

  const member = members.find((m) => m.userId === userId);

  if (!member) return null;

  const canEditRoles = member.isAdmin || member.isCoach;
  const canRemoveMembers = member.isAdmin || member.isCoach;

  return {
    teamId,
    currentUserId: userId,
    currentUserRole: member.role,
    canEditRoles,
    canRemoveMembers,
    canViewDetails: true, // All team members can view
  };
}

/**
 * Compute filtered & sorted roster based on query params or UI state.
 */
export function useFilteredRoster(
  teamId: string,
  filters: RosterFilters,
) {
  const { data, ...queryRest } = useRoster(teamId);

  const filtered = applyFilters(data, filters);

  return {
    members: filtered,
    ...queryRest,
  };
}

function applyFilters(
  members: RosterMember[],
  filters: RosterFilters,
): RosterMember[] {
  let result = [...members];

  // Search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    result = result.filter((m) =>
      m.displayName.toLowerCase().includes(query),
    );
  }

  // Role filter
  if (filters.roleFilter !== "all") {
    result = result.filter((m) => m.role === filters.roleFilter);
  }

  // Sorting
  result.sort((a, b) => {
    let comparison = 0;

    if (filters.sortBy === "name") {
      comparison = a.displayName.localeCompare(b.displayName);
    } else if (filters.sortBy === "role") {
      comparison = a.role.localeCompare(b.role);
    } else if (filters.sortBy === "joinedAt") {
      comparison =
        new Date(a.joinedAt).getTime() -
        new Date(b.joinedAt).getTime();
    }

    return filters.sortOrder === "asc" ? comparison : -comparison;
  });

  return result;
}
```

### 6.2 `useRosterMutations.ts` — Action Hook

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateMemberRole,
  removeMember,
} from "../services/roster";
import type { RosterMember } from "../types";

/**
 * Mutation hook for role updates (admin/coach only).
 * - Optimistic UI update
 * - Auto-invalidates roster query on success
 */
export function useUpdateMemberRole(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      newRole,
    }: {
      memberId: string;
      newRole: string;
    }) => updateMemberRole(teamId, memberId, newRole),

    onMutate: async ({ memberId, newRole }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["roster", teamId],
      });

      // Snapshot previous data
      const previousRoster = queryClient.getQueryData<RosterMember[]>([
        "roster",
        teamId,
      ]);

      // Optimistic update
      if (previousRoster) {
        const updated = previousRoster.map((m) =>
          m.id === memberId
            ? { ...m, role: newRole as any, isAdmin: newRole === "admin", isCoach: newRole === "coach" }
            : m,
        );
        queryClient.setQueryData(["roster", teamId], updated);
      }

      return { previousRoster };
    },

    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousRoster) {
        queryClient.setQueryData(
          ["roster", teamId],
          context.previousRoster,
        );
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["roster", teamId],
      });
    },
  });
}

/**
 * Mutation hook for removing members.
 * - Optimistic removal from list
 * - User can still undo (from snapshot)
 */
export function useRemoveMember(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      removeMember(teamId, memberId),

    onMutate: async (memberId) => {
      await queryClient.cancelQueries({
        queryKey: ["roster", teamId],
      });

      const previousRoster = queryClient.getQueryData<RosterMember[]>([
        "roster",
        teamId,
      ]);

      if (previousRoster) {
        const updated = previousRoster.filter(
          (m) => m.id !== memberId,
        );
        queryClient.setQueryData(["roster", teamId], updated);
      }

      return { previousRoster };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousRoster) {
        queryClient.setQueryData(
          ["roster", teamId],
          context.previousRoster,
        );
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["roster", teamId],
      });
    },
  });
}
```

---

## 7. Component Hierarchy

### 7.1 `RosterPage.tsx` (Route Component)

Entry point for `/teams/{teamId}/roster` route.

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/shared/PageShell";
import { TeamBottomNav } from "@/components/shared/BottomNav";
import { RosterList } from "./RosterList";

export const Route = createFileRoute("/teams/$teamId/roster")({
  component: RosterPage,
});

function RosterPage() {
  const { teamId } = Route.useParams();

  return (
    <PageShell
      withNav
      header={{
        title: "Roster",
        subtitle: "Team Members",
      }}
      footer={<TeamBottomNav teamId={teamId} />}
    >
      <RosterList teamId={teamId} />
    </PageShell>
  );
}
```

### 7.2 `RosterList.tsx` (Container Component)

Manages state, loading, and delegates rendering.

```typescript
import { useRoster, useTeamRole } from "../hooks";
import { RosterHeader } from "./RosterHeader";
import { RosterGrid } from "./RosterGrid";
import { RosterEmptyState } from "./RosterEmptyState";
import { LoadingSpinner } from "@/components/shared";

interface RosterListProps {
  teamId: string;
}

export function RosterList({ teamId }: RosterListProps) {
  const { data, isLoading, isError, error } = useRoster(teamId);
  const { user } = useAuth();
  const userRole = useTeamRole(teamId, user?.id);

  if (isError) {
    return <ErrorMessage message={error?.message} />;
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (data.length === 0) {
    return <RosterEmptyState />;
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <RosterHeader
        memberCount={data.length}
        userRole={userRole}
      />
      <RosterGrid
        members={data}
        canEdit={userRole?.canEditRoles ?? false}
      />
    </div>
  );
}
```

### 7.3 `RosterGrid.tsx` (Display Component)

Renders list of member cards with virtualization.

```typescript
import { RosterMemberCard } from "./RosterMemberCard";
import type { RosterMember } from "../types";

interface RosterGridProps {
  members: RosterMember[];
  canEdit: boolean;
}

export function RosterGrid({
  members,
  canEdit,
}: RosterGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {members.map((member) => (
        <RosterMemberCard
          key={member.id}
          member={member}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}
```

### 7.4 `RosterMemberCard.tsx` (Reusable Member Card)

Individual member display with optional admin actions.

```typescript
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RosterActions } from "./RosterActions";
import type { RosterMember } from "../types";

interface RosterMemberCardProps {
  member: RosterMember;
  canEdit: boolean;
}

export function RosterMemberCard({
  member,
  canEdit,
}: RosterMemberCardProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Member info */}
        <div className="flex gap-3 flex-1 min-w-0">
          <Avatar
            src={member.avatarUrl}
            fallback={member.displayName[0]}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">
              {member.displayName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" size="sm">
                {member.roleLabel}
              </Badge>
              <p className="text-xs text-gray-500">
                Joined {formatDate(member.joinedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Admin actions */}
        {canEdit && (
          <RosterActions
            member={member}
            isOpen={isActionsOpen}
            onOpenChange={setIsActionsOpen}
          />
        )}
      </div>
    </div>
  );
}
```

---

## 8. Query Caching Strategy

### Cache Keys (TanStack Query)

```typescript
/**
 * Consistent cache key structure for roster queries.
 * Pattern: ["feature", "resource", "identifier", "filters?"]
 */
const cacheKeys = {
  roster: (teamId: string) => ["roster", teamId],
  rosterMember: (teamId: string, memberId: string) => [
    "roster",
    teamId,
    "member",
    memberId,
  ],
  rosterFiltered: (teamId: string, filters: RosterFilters) => [
    "roster",
    teamId,
    "filtered",
    filters,
  ],
};
```

### Cache Timing

| Query | Stale Time | GC Time | Refetch on Focus | Notes |
|-------|-----------|---------|-----------------|-------|
| Roster list | 5 min | 10 min | Yes | Team composition rarely changes |
| Member detail | 5 min | 10 min | Yes | Safe to refetch |
| Mutations | — | — | N/A | Trigger immediate invalidation |

### Invalidation Strategy

```typescript
/**
 * When role is updated, only invalidate the roster query
 * for that specific team. Don't invalidate other teams.
 */
queryClient.invalidateQueries({
  queryKey: ["roster", teamId],
});

/**
 * For membership changes (remove), also refetch team members
 * in the sidebar/navigation if applicable.
 */
queryClient.invalidateQueries({
  queryKey: ["teams"],
  exact: false, // Invalidate all team queries
});
```

---

## 9. Key Architectural Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **JOIN profiles in query** | Minimize network round-trips (N+1 prevention). Single Supabase call fetches both team_members and profiles. | Slightly larger payload, but profiles are small. |
| **Transform to RosterMember type** | Client-side normalization enables computed properties (`isAdmin`, `displayName`) without extra queries. Decouples UI from DB schema. | Adds transformation layer overhead (negligible). |
| **5-min stale time** | Team rosters rarely change (members join/leave infrequently). 5 min balances freshness vs. unnecessary refetches. | Stale data for 5 min if member is added. Acceptable for MVP. |
| **Optimistic updates** | Perceived performance: UI updates immediately, rolls back on error. Better UX for mutations. | Risk of inconsistency if mutation fails silently. Mitigated by error handling & snapshots. |
| **Grid + Card layout** | Mobile-first, easy tap targets. Scales to tablet. | Less dense than table. Use table variant for desktop if needed. |
| **RLS enforces access** | Don't trust client-side checks. Database enforces: only team members can read roster; only admins can edit. | Adds Supabase dependency. Unavoidable for security. |
| **Service layer abstracts Supabase** | Hooks don't directly call Supabase. Makes testing, refactoring easier. | Extra indirection, but minimal complexity. |

---

## 10. Error Handling & Edge Cases

### Error States

```typescript
// 1. Not authenticated
→ Router beforeLoad redirect to /auth/login

// 2. Not a team member
→ Supabase RLS denies query
→ catch error, show: "You don't have access to this team"

// 3. Network failure
→ TanStack Query retry (2x default)
→ Show ErrorMessage component with "Retry" button

// 4. Member not found (during detail fetch)
→ Throw error, show 404 or redirect to roster list

// 5. Permission denied on role update
→ Supabase RLS blocks mutation
→ Show toast: "Only admins can change roles"
```

### Edge Cases Handled

| Edge Case | Solution |
|-----------|----------|
| User joins after page loads | 5-min stale time + refetch on focus handles this. |
| Concurrent role updates | Optimistic update + server invalidation prevents conflicts. |
| User leaves team | RLS query fails on next fetch (handled as error). |
| Offline user | TanStack Query caches previous data; shows loading state on retry. |
| Empty roster | RosterEmptyState component handles gracefully. |

---

## 11. Performance Optimizations

### 1. **Query Memoization** (TanStack Query)
- `useRoster()` memoizes results by `teamId`
- Prevents refetch if same `teamId` already cached

### 2. **Component Memoization** (React.memo)
```typescript
export const RosterMemberCard = memo(
  function RosterMemberCardComponent({ member, canEdit }: Props) {
    // only rerenders if member or canEdit changes
  },
  (prev, next) => {
    return (
      prev.member.id === next.member.id &&
      prev.canEdit === next.canEdit
    );
  },
);
```

### 3. **Virtualization** (for large rosters)
```typescript
// For 100+ members, use react-window or react-virtual
import { FixedSizeList } from "react-window";

export function RosterGrid({ members }: Props) {
  if (members.length > 50) {
    return (
      <FixedSizeList
        height={600}
        itemCount={members.length}
        itemSize={80}
        width="100%"
      >
        {RosterMemberRow}
      </FixedSizeList>
    );
  }
  return <div>{...}</div>;
}
```

### 4. **Debounced Search** (useFilteredRoster)
```typescript
const [searchQuery, setSearchQuery] = useState("");
const debouncedSearch = useMemo(
  () => debounce((q: string) => setSearchQuery(q), 300),
  [],
);

// In input:
<input onChange={(e) => debouncedSearch(e.target.value)} />
```

### 5. **Selective Refetch**
- Only refetch roster on window focus if stale > 5 min
- Don't refetch non-active tabs unnecessarily

---

## 12. Testing Strategy

### Unit Tests (Services)

```typescript
describe("roster.ts", () => {
  it("should fetch roster with profiles", async () => {
    const members = await fetchRosterWithProfiles(teamId);
    expect(members).toHaveLength(3);
    expect(members[0]).toHaveProperty("displayName");
  });

  it("should throw on unauthorized access", async () => {
    // RLS blocks query for non-member
    await expect(
      fetchRosterWithProfiles(teamId),
    ).rejects.toThrow();
  });
});
```

### Integration Tests (Hooks)

```typescript
describe("useRoster", () => {
  it("should load roster data on mount", async () => {
    const { result } = renderHook(
      () => useRoster(teamId),
      { wrapper: QueryClientWrapper },
    );

    await waitFor(() => {
      expect(result.current.data).toHaveLength(3);
    });
  });

  it("should update role optimistically", async () => {
    const { result } = renderHook(
      () => ({
        roster: useRoster(teamId),
        mutation: useUpdateMemberRole(teamId),
      }),
      { wrapper: QueryClientWrapper },
    );

    act(() => {
      result.current.mutation.mutate({
        memberId: "123",
        newRole: "coach",
      });
    });

    // Optimistic UI updates immediately
    expect(
      result.current.roster.data[0].role,
    ).toBe("coach");
  });
});
```

### Component Tests (Snapshot + Behavior)

```typescript
describe("RosterMemberCard", () => {
  it("should render member name and role", () => {
    const member = createMockRosterMember();
    render(<RosterMemberCard member={member} canEdit={false} />);

    expect(screen.getByText(member.displayName)).toBeInTheDocument();
    expect(screen.getByText(member.roleLabel)).toBeInTheDocument();
  });

  it("should show edit button only if canEdit", () => {
    const member = createMockRosterMember();
    const { rerender } = render(
      <RosterMemberCard member={member} canEdit={false} />,
    );

    expect(
      screen.queryByRole("button", { name: /edit/i }),
    ).not.toBeInTheDocument();

    rerender(<RosterMemberCard member={member} canEdit={true} />);
    expect(
      screen.getByRole("button", { name: /edit/i }),
    ).toBeInTheDocument();
  });
});
```

---

## 13. Migration & Setup

### Step 1: Create Feature Folder
```bash
mkdir -p src/features/roster/{components,hooks,services,types,utils,constants}
```

### Step 2: Ensure RLS Policies Exist
✅ Already in place: `20260518000002_create_teams.sql` includes:
- `team_members_select` (for roster fetch)
- `team_members_update` (for role changes)
- `team_members_delete` (for member removal)

### Step 3: Update Database Types
Run Supabase CLI to regenerate:
```bash
supabase gen types typescript > src/types/database.ts
```

### Step 4: Install Types
```bash
npm install @tanstack/react-query @tanstack/react-router
```

### Step 5: Create Route File
```bash
touch src/routes/teams/\$teamId/roster.tsx
```

---

## 14. Future Extensions (Post-MVP)

| Feature | Implementation Path |
|---------|-------------------|
| **Export roster as CSV** | Add `exportRosterCSV(teamId)` service function. |
| **Bulk role edit** | Add checkbox selection + bulk mutation hook. |
| **Member detail page** | Create `$teamId/roster/$memberId.tsx` route. |
| **Search/filter URL state** | Use TanStack Router `useSearch()` to persist filters. |
| **Real-time updates** | Subscribe to Supabase realtime events on `team_members` table. |
| **Walk-up songs** | JOIN `walkup_songs` table in roster query. |
| **Stats/analytics** | JOIN `attendance` table to show attendance %. |
| **Invite flow** | Use existing `team_invites` table to extend roster management. |

---

## Summary

This architecture balances:

✅ **Type Safety**: Strict TypeScript throughout; transforms at service layer.
✅ **Performance**: 5-min caching, optimistic updates, memoization.
✅ **Security**: RLS enforced at database layer; no trust of client-side checks.
✅ **Maintainability**: Feature isolation; hooks encapsulate logic; service layer abstracts Supabase.
✅ **UX**: Mobile-first cards; loading/error states; intuitive filtering.
✅ **Scalability**: Ready for 100+ members (virtualization); easily extends to detail views or real-time.

The implementation follows **Dugout principles**: simple, fast, fun, and community-driven.
