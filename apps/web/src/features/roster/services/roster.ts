import { supabase } from "@/lib/supabase";
import type { RosterMember } from "../types";

/**
 * Fetch all roster members for a team with their profile information.
 *
 * Enforces Supabase Row Level Security:
 * - Only team members can access their team's roster
 * - RLS policy checks that auth.uid() is a member of the target team
 *
 * @param teamId - Team ID to fetch roster for
 * @returns Array of roster members with profile data, sorted by joined date
 * @throws Error if RLS denies access or query fails
 *
 * @example
 * const members = await fetchRosterWithProfiles(teamId);
 */
export async function fetchRosterWithProfiles(teamId: string): Promise<RosterMember[]> {
  if (!teamId) {
    throw new Error("Team ID is required");
  }

  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      id,
      team_id,
      user_id,
      role,
      joined_at,
      profiles:user_id(id, full_name, avatar_url)
    `,
    )
    .eq("team_id", teamId)
    .order("joined_at", { ascending: true });

  if (error) {
    // RLS will throw PGRST116 if user is not a team member
    if (error.code === "PGRST116") {
      throw new Error("Access denied. You are not a member of this team.");
    }
    throw new Error(`Failed to fetch roster: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  // Transform and flatten the data
  const members: RosterMember[] = data
    .map((member) => {
      const profile = Array.isArray(member.profiles)
        ? member.profiles[0]
        : member.profiles;

      if (!profile) {
        return null;
      }

      return {
        id: member.id,
        team_id: member.team_id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        profile: {
          id: profile.id,
          full_name: profile.full_name ?? null,
          email: null, // Email not exposed in public roster for privacy
          avatar_url: profile.avatar_url ?? null,
        },
      } as RosterMember;
    })
    .filter((member): member is RosterMember => member !== null);

  return members;
}

/**
 * Get a single roster member by ID
 *
 * @param teamId - Team ID to verify access
 * @param memberId - ID of the specific team member
 * @returns Single roster member or null if not found
 * @throws Error if RLS denies access or query fails
 */
export async function getRosterMember(
  teamId: string,
  memberId: string,
): Promise<RosterMember | null> {
  if (!teamId || !memberId) {
    throw new Error("Team ID and member ID are required");
  }

  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      id,
      team_id,
      user_id,
      role,
      joined_at,
      profiles:user_id(id, full_name, avatar_url)
    `,
    )
    .eq("team_id", teamId)
    .eq("id", memberId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Access denied. You are not a member of this team.");
    }
    if (error.code === "PGRST100") {
      return null; // Not found
    }
    throw new Error(`Failed to fetch roster member: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const profile = Array.isArray(data.profiles)
    ? data.profiles[0]
    : data.profiles;

  if (!profile) {
    return null;
  }

  return {
    id: data.id,
    team_id: data.team_id,
    user_id: data.user_id,
    role: data.role,
    joined_at: data.joined_at,
    profile: {
      id: profile.id,
      full_name: profile.full_name ?? null,
      email: null,
      avatar_url: profile.avatar_url ?? null,
    },
  } as RosterMember;
}
