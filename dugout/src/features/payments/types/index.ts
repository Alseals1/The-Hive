import type { Tables, PaymentStatus } from "@/types";

export type { PaymentStatus };

export type Payment = Omit<Tables<"payments">, "stripe_session_id">;

export interface PaymentWithProfile extends Payment {
  memberName: string | null;
}

export type PaymentInsert = Omit<
  Payment,
  "id" | "created_at" | "updated_at" | "paid_at" | "status"
>;

export type PaymentPatch = {
  status: PaymentStatus;
  paid_at?: string | null;
};
