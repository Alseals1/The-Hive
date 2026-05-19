import type { TeamRole } from "@/types";

/**
 * Priority ordering for role-based grouping in the roster
 * Lower number = displays first
 */
export const ROLE_PRIORITY: Record<TeamRole, number> = {
  admin: 1,
  coach: 2,
  player: 3,
  parent: 4,
  manager: 5,
};

/**
 * Human-readable display labels for roles
 */
export const ROLE_LABELS: Record<TeamRole, string> = {
  admin: "Coaches",
  coach: "Coaches",
  player: "Players",
  parent: "Parents",
  manager: "Managers",
};

/**
 * Tailwind color classes for role badges
 */
export const ROLE_COLORS: Record<
  TeamRole,
  { bg: string; text: string }
> = {
  admin: { bg: "bg-red-50", text: "text-red-700" },
  coach: { bg: "bg-field-50", text: "text-field-700" },
  player: { bg: "bg-purple-50", text: "text-purple-700" },
  parent: { bg: "bg-stone-100", text: "text-stone-600" },
  manager: { bg: "bg-blue-50", text: "text-blue-700" },
};

/**
 * A single roster member with flattened profile information
 */
export interface RosterMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

/**
 * Members grouped by role for rendering
 */
export interface RosterSection {
  role: TeamRole;
  label: string;
  members: RosterMember[];
}

/**
 * Complete roster data including grouped sections
 */
export interface RosterData {
  sections: RosterSection[];
  totalMembers: number;
}
