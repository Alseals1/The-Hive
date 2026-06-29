import { supabase } from "@/lib/supabase";
import type { TeamRole } from "@/types";

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
 * Public (no auth required).
 */
export async function getJoinCodeByTeamId(teamId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("team_join_codes")
    .select("code")
    .eq("team_id", teamId)
    .single();

  if (error) return null;
  if (!data) return null;

  return data.code;
}

/**
 * Fetch team details by join code — public (no auth required).
 * Returns null if code is invalid.
 */
export async function getTeamByJoinCode(code: string): Promise<TeamPreview | null> {
  const { data, error } = await supabase
    .from("team_join_codes")
    .select(
      `
      role,
      teams (
        id,
        name,
        sport,
        season
      )
    `
    )
    .eq("code", code)
    .single();

  if (error) return null;
  if (!data || !data.teams) return null;

  const teams = Array.isArray(data.teams) ? data.teams[0] : data.teams;
  if (!teams) return null;

  return {
    teamId: teams.id,
    name: teams.name,
    sport: teams.sport,
    season: teams.season,
    joinRole: data.role,
  };
}

/**
 * Join a team using its join code via an atomic server-side RPC.
 * The RPC handles profile upsert, member insert, and expected-member matching
 * in a single transaction.
 */
export async function joinTeamByCode(code: string): Promise<string> {
  const { data: teamId, error } = await supabase.rpc("join_team_by_code", {
    p_code: code,
  });

  if (error) {
    const msg = error.message ?? "";
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
