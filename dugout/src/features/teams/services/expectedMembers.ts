import { supabase } from "@/lib/supabase";
import type { TablesInsert } from "@/types";

export interface ExpectedMember {
  id: string;
  team_id: string;
  name: string;
  note: string | null;
  created_at: string;
}

/**
 * Fetch all expected members for a team.
 * Team members can read (enforced by RLS).
 */
export async function getExpectedMembers(teamId: string): Promise<ExpectedMember[]> {
  const { data, error } = await supabase
    .from("expected_members")
    .select("id, team_id, name, note, created_at")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Add an expected member placeholder for a team.
 * Only team admins can do this (enforced by RLS).
 */
export async function addExpectedMember(
  teamId: string,
  name: string,
  note?: string
): Promise<ExpectedMember> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const insert: TablesInsert<"expected_members"> = {
    team_id: teamId,
    name,
    note: note || null,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("expected_members")
    .insert(insert)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete an expected member placeholder.
 * Only team admins can do this (enforced by RLS).
 */
export async function deleteExpectedMember(id: string): Promise<void> {
  const { error } = await supabase
    .from("expected_members")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
