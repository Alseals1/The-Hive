import { supabase } from "@/lib/supabase";
import type { SupplyItem, SupplyItemInsert } from "../types/supplyItems";

export async function getSupplyItems(eventId: string): Promise<SupplyItem[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("event_supply_items")
    .select(
      `id, event_id, team_id, label, sort_order, created_at,
       event_supply_claims (
         user_id,
         profiles!event_supply_claims_user_id_fkey (full_name)
       )`
    )
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const claim = Array.isArray(row.event_supply_claims)
      ? row.event_supply_claims[0]
      : row.event_supply_claims;

    const claimerProfile = claim?.profiles as { full_name: string | null } | null | undefined;

    return {
      id: row.id,
      event_id: row.event_id,
      team_id: row.team_id,
      label: row.label,
      sort_order: row.sort_order,
      created_at: row.created_at,
      claimer_name: claimerProfile?.full_name ?? null,
      claimer_user_id: claim?.user_id ?? null,
      claimed_by_me: claim?.user_id === user.id,
    };
  });
}

export async function addSupplyItem(input: SupplyItemInsert): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("event_supply_items").insert({
    event_id: input.event_id,
    team_id: input.team_id,
    label: input.label,
    created_by: user.id,
  });

  if (error) throw new Error(error.message);
}

export async function deleteSupplyItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from("event_supply_items")
    .delete()
    .eq("id", itemId);

  if (error) throw new Error(error.message);
}

export async function claimSupplyItem(itemId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("event_supply_claims")
    .insert({ item_id: itemId, user_id: user.id });

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "Someone just claimed this item — the list has been refreshed."
      );
    }
    throw new Error(error.message);
  }
}

export async function unclaimSupplyItem(itemId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("event_supply_claims")
    .delete()
    .eq("item_id", itemId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
