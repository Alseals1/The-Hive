import { supabase } from "@/lib/supabase";
import type { TablesInsert } from "@/types";
import type { TeamRole } from "@/types";

export interface TeamInvite {
  id: string;
  token: string;
  role: TeamRole;
  created_at: string;
  expires_at: string | null;
  used_at: string | null;
}

export type InviteStatus = "active" | "used" | "expired";

export function getInviteStatus(invite: Pick<TeamInvite, "used_at" | "expires_at">): InviteStatus {
  if (invite.used_at) return "used";
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) return "expired";
  return "active";
}

/**
 * Fetch all invites for a team (active, used, and expired).
 * Only team admins can read this (enforced by RLS).
 */
export async function getTeamInvites(teamId: string): Promise<TeamInvite[]> {
  const { data, error } = await supabase
    .from("team_invites")
    .select("id, token, role, created_at, expires_at, used_at")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Revoke an invite by marking it used.
 * Only team admins can do this (enforced by RLS).
 */
export async function revokeInvite(id: string): Promise<void> {
  const { error } = await supabase
    .from("team_invites")
    .update({ used_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

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

  // Expiry is enforced server-side by the team_invites_select_by_token RLS policy
  // (expires_at IS NULL OR expires_at > now()). If the row came back, it is valid.

  return data;
}

/**
 * Accept an invite atomically via a server-side RPC.
 *
 * The RPC (accept_team_invite) handles all steps in a single transaction:
 *   - SELECT … FOR UPDATE on the invite row (prevents concurrent double-accept)
 *   - server-side used_at and expiry checks
 *   - profile upsert, team_members insert, and used_at update
 *
 * Error codes raised by the function are mapped to user-facing messages here.
 */
export async function acceptInvite(token: string): Promise<string> {
  const { data: teamId, error } = await supabase.rpc("accept_team_invite", {
    p_token: token,
  });

  if (error) {
    const msg = error.message ?? "";
    if (
      msg.includes("INVITE_NOT_FOUND") ||
      msg.includes("INVITE_ALREADY_USED") ||
      msg.includes("INVITE_EXPIRED")
    ) {
      throw new Error("This invite is invalid or has expired.");
    }
    if (msg.includes("NOT_AUTHENTICATED")) {
      throw new Error("Not authenticated");
    }
    throw new Error(error.message);
  }

  if (!teamId) throw new Error("This invite is invalid or has expired.");

  return teamId;
}
