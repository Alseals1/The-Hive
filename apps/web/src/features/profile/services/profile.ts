import { supabase } from "@/lib/supabase";
import type { TablesUpdate } from "@/types";

export type ProfileUpdateInput = Pick<TablesUpdate<"profiles">, "full_name">;

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, can_create_team, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProfile(
  userId: string,
  input: ProfileUpdateInput,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", userId);

  if (error) throw new Error(error.message);
}
