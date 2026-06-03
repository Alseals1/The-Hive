import { supabase } from "@/lib/supabase";
import type { Payment, PaymentStatus, PaymentWithProfile } from "../types";

export async function getTeamPayments(
  teamId: string,
): Promise<PaymentWithProfile[]> {
  const { data, error } = await supabase
    .from("payments")
    .select(`*, profiles!payments_user_id_fkey(full_name)`)
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const profileRow = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;

    return {
      id: row.id,
      amount_cents: row.amount_cents,
      description: row.description,
      due_date: row.due_date,
      status: row.status,
      team_id: row.team_id,
      user_id: row.user_id,
      created_by: row.created_by,
      paid_at: row.paid_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      memberName: profileRow?.full_name ?? null,
    };
  });
}

export async function getMyPayments(teamId: string): Promise<Payment[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, amount_cents, description, due_date, status, team_id, user_id, created_by, paid_at, created_at, updated_at",
    )
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function createPaymentsForTeam(
  teamId: string,
  memberIds: string[],
  input: { description: string; amount_cents: number; due_date: string | null },
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const records = memberIds.map((memberId) => ({
    team_id: teamId,
    user_id: memberId,
    created_by: user?.id ?? null,
    description: input.description,
    amount_cents: input.amount_cents,
    due_date: input.due_date,
  }));

  const { error } = await supabase.from("payments").insert(records);

  if (error) throw new Error(error.message);
}

export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
): Promise<void> {
  const { error } = await supabase
    .from("payments")
    .update({
      status,
      paid_at: status === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
