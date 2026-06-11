import { supabase } from "@/lib/supabase";

export interface TeamPreview {
  teamId: string;
  name: string;
  sport: string;
  season: string | null;
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
export async function generateJoinCode(teamId: string): Promise<string> {
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
  };
}

/**
 * Join a team using its join code.
 * Adds the current user as a parent member.
 */
export async function joinTeamByCode(code: string): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const teamPreview = await getTeamByJoinCode(code);
  if (!teamPreview) throw new Error("This join code is invalid.");

  // Ensure profile exists — the trigger should handle this, but guard against edge cases
  await supabase.from("profiles").upsert(
    { id: user.id, full_name: user.user_metadata?.full_name ?? null },
    { onConflict: "id", ignoreDuplicates: true }
  );

  // Add user as parent member
  const { error: memberError } = await supabase
    .from("team_members")
    .insert({
      team_id: teamPreview.teamId,
      user_id: user.id,
      role: "parent",
    });

  if (memberError) {
    // Unique constraint: already a member
    if (memberError.code === "23505") {
      return teamPreview.teamId;
    }
    throw new Error(memberError.message);
  }

  return teamPreview.teamId;
}
