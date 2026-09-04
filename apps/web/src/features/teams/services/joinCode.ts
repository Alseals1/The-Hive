import { supabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";
import type { TeamRole } from "@/types";

export class AlreadyMemberError extends Error {
  constructor() {
    super("ALREADY_MEMBER");
    this.name = "AlreadyMemberError";
  }
}

export interface TeamPreview {
  teamId: string;
  name: string;
  sport: string;
  season: string | null;
  joinRole: TeamRole;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // exclude O/0, I/1
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

/**
 * Generate or reset the team's permanent join code.
 * Only team admins can do this (enforced by RLS).
 */
export async function generateJoinCode(
  teamId: string,
  role: TeamRole = "parent"
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const code = generateCode();

  const { data, error } = await supabase
    .from("team_join_codes")
    .upsert(
      {
        team_id: teamId,
        code,
        role,
        created_by: user.id,
      },
      { onConflict: "team_id" }
    )
    .select("code")
    .single();

  if (error) throw new Error(error.message);
  return data.code;
}

/**
 * Fetch the current join code for a team.
 * Returns null when no code has been generated yet (PGRST116).
 * Public (no auth required).
 */
export async function getJoinCodeByTeamId(teamId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("team_join_codes")
    .select("code")
    .eq("team_id", teamId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return data?.code ?? null;
}

/**
 * Fetch team details by join code — public (no auth required).
 * Uses a security-definer RPC so the join_codes table is never directly
 * queryable by unauthenticated clients.
 * Returns null when the code does not exist.
 */
export async function getTeamByJoinCode(code: string): Promise<TeamPreview | null> {
  const { data, error } = await supabase
    .rpc("get_team_preview_by_code", { p_code: code })
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  if (!data) return null;

  return {
    teamId: data.team_id,
    name: data.name,
    sport: data.sport,
    season: data.season,
    joinRole: data.role as TeamRole,
  };
}

/**
 * Delete the team's join code (revoke it).
 * Only team admins can do this (enforced by RLS).
 */
export async function deleteJoinCode(teamId: string): Promise<void> {
  const { error } = await supabase
    .from("team_join_codes")
    .delete()
    .eq("team_id", teamId);

  if (error) throw new Error(error.message);
}

/**
 * Join a team using its join code via an atomic server-side RPC.
 * The RPC handles profile upsert, member insert, and expected-member matching
 * in a single transaction.
 */
export async function joinTeamByCode(code: string, role?: TeamRole): Promise<string> {
  checkRateLimit(`join:${code}`);

  const { data: teamId, error } = await supabase.rpc("join_team_by_code", {
    p_code: code,
    p_role: role ?? null,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("ALREADY_MEMBER")) {
      throw new AlreadyMemberError();
    }
    if (msg.includes("INVALID_CODE")) {
      throw new Error("This join code is invalid.");
    }
    if (msg.includes("NOT_AUTHENTICATED")) {
      throw new Error("Not authenticated");
    }
    throw new Error(error.message);
  }

  if (!teamId) throw new Error("This join code is invalid.");

  return teamId;
}
