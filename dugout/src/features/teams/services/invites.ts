import { supabase } from "@/lib/supabase";
import type { TablesInsert } from "@/types";
import type { TeamRole } from "@/types";

/**
 * Create a new invite link for a team.
 * Only admins/coaches can create invites (enforced by RLS).
 */
export async function createInvite(
  teamId: string,
  role: TeamRole = "parent",
): Promise<{ token: string; expires_at: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const insert: TablesInsert<"team_invites"> = {
    team_id: teamId,
    role,
    created_by: user.id,
    // Expire in 7 days
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const { data, error } = await supabase
    .from("team_invites")
    .insert(insert)
    .select("token, expires_at")
    .single();

  if (error) throw new Error(error.message);
  return { token: data.token, expires_at: data.expires_at as string | null };
}

/**
 * Fetch invite details by token — public (no auth required).
 * Returns null if token is invalid, expired, or already used.
 */
export async function getInviteByToken(token: string) {
  const { data, error } = await supabase
    .from("team_invites")
    .select(
      `
      id,
      token,
      role,
      expires_at,
      used_at,
      teams (
        id,
        name,
        sport,
        season
      )
    `,
    )
    .eq("token", token)
    .is("used_at", null)
    .single();

  if (error) return null;
  if (!data) return null;

  // Client-side expiry check
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  return data;
}

/**
 * Accept an invite — adds the current user to the team.
 * Marks the invite as used.
 */
export async function acceptInvite(token: string): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const invite = await getInviteByToken(token);
  if (!invite) throw new Error("This invite is invalid or has expired.");

  const teamData = Array.isArray(invite.teams) ? invite.teams[0] : invite.teams;
  if (!teamData) throw new Error("Team not found.");

  // Add user as team member
  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: teamData.id,
    user_id: user.id,
    role: invite.role,
  });

  if (memberError) {
    // Unique constraint: already a member
    if (memberError.code === "23505") {
      return teamData.id;
    }
    throw new Error(memberError.message);
  }

  // Mark invite as used
  await supabase
    .from("team_invites")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invite.id);

  return teamData.id;
}
