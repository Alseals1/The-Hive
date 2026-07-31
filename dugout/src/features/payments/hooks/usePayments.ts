import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaymentStatus } from "../types";
import {
  getTeamPayments,
  getMyPayments,
  createPaymentsForTeam,
  updatePaymentStatus,
  verifyPayment,
  declinePayment,
} from "../services/payments";
import { toast } from "sonner";

export function useTeamPayments(teamId: string) {
  return useQuery({
    queryKey: ["payments", "team", teamId],
    queryFn: () => getTeamPayments(teamId),
    staleTime: 30_000,
    enabled: !!teamId,
  });
}

export function useMyPayments(teamId: string) {
  return useQuery({
    queryKey: ["payments", "mine", teamId],
    queryFn: () => getMyPayments(teamId),
    staleTime: 30_000,
    enabled: !!teamId,
  });
}

export function useCreateTeamPayments(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberIds,
      description,
      amount_cents,
      due_date,
    }: {
      memberIds: string[];
      description: string;
      amount_cents: number;
      due_date: string | null;
    }) => createPaymentsForTeam(teamId, memberIds, { description, amount_cents, due_date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "team", teamId] });
      toast.success("Payment request sent");
    },
    onError: () => {
      toast.error("Failed to create payment");
    },
  });
}

export function useUpdatePaymentStatus(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PaymentStatus }) =>
      updatePaymentStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments", "team", teamId] });
      queryClient.invalidateQueries({ queryKey: ["payments", "mine", teamId] });
      toast.success(variables.status === "paid" ? "Marked as paid" : "Payment updated");
    },
    onError: () => {
      toast.error("Failed to update payment");
    },
  });
}

export function useSelfReportPayment(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, method }: { id: string; method: string }) =>
      updatePaymentStatus(id, "pending_confirmation", method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "mine", teamId] });
      queryClient.invalidateQueries({ queryKey: ["payments", "team", teamId] });
      toast.success("Payment reported — awaiting confirmation");
    },
    onError: () => {
      toast.error("Failed to report payment");
    },
  });
}

export function useVerifyPayment(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => verifyPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "team", teamId] });
      queryClient.invalidateQueries({ queryKey: ["payments", "mine", teamId] });
      toast.success("Payment verified");
    },
    onError: () => {
      toast.error("Failed to verify payment");
    },
  });
}

export function useDeclinePayment(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => declinePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "team", teamId] });
      queryClient.invalidateQueries({ queryKey: ["payments", "mine", teamId] });
      toast.success("Payment declined — returned to pending");
    },
    onError: () => {
      toast.error("Failed to decline payment");
    },
  });
}
