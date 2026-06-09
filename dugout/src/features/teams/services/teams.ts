import { supabase } from "@/lib/supabase";
import type { TablesInsert } from "@/types";

export async function getMyTeams() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      role,
      joined_at,
      teams (
        id,
        name,
        sport,
        season,
        created_at
      )
    `,
    )
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((row) => ({
    ...(row.teams as NonNullable<typeof row.teams>),
    role: row.role,
    joinedAt: row.joined_at,
  }));
}

export async function getCanCreateTeam(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("can_create_team")
    .eq("id", user.id)
    .single();

  return data?.can_create_team ?? false;
}

export async function createTeam(
  input: Pick<TablesInsert<"teams">, "name" | "sport" | "season">,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Create the team (created_by will be set by trigger)
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert(input)
    .select()
    .single();

  if (teamError) throw new Error(teamError.message);

  // Add creator as admin
  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "admin",
  });

  if (memberError) throw new Error(memberError.message);

  return team;
}

export async function deleteTeam(teamId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Verify user is admin
  const { data: member, error: checkError } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (checkError || member?.role !== "admin") {
    throw new Error("Only admins can delete the team");
  }

  // Delete the team (cascade will handle team_members)
  const { error } = await supabase.from("teams").delete().eq("id", teamId);

  if (error) throw new Error(error.message);
}

export async function leaveTeam(teamId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Remove user from team_members
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
