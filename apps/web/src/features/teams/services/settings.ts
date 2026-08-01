import { supabase } from "@/lib/supabase";
import type { TablesUpdate } from "@/types";

export type TeamUpdateInput = Pick<
  TablesUpdate<"teams">,
  "name" | "season" | "sport"
>;

/**
 * Fetch a single team by ID.
 * RLS ensures only team members can read it.
 */
export async function getTeam(teamId: string) {
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, sport, season, created_at")
    .eq("id", teamId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update team settings.
 * RLS ensures only admins/coaches can update.
 */
export async function updateTeam(
  teamId: string,
  input: TeamUpdateInput,
): Promise<void> {
  const { error } = await supabase
    .from("teams")
    .update(input)
    .eq("id", teamId);

  if (error) throw new Error(error.message);
}
