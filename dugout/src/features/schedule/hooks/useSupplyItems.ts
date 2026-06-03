import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSupplyItems,
  addSupplyItem,
  deleteSupplyItem,
  claimSupplyItem,
  unclaimSupplyItem,
} from "../services/supplyItems";
import type { SupplyItemInsert } from "../types/supplyItems";
import { toast } from "sonner";

export function useSupplyItems(eventId: string) {
  return useQuery({
    queryKey: ["supply-items", eventId],
    queryFn: () => getSupplyItems(eventId),
    staleTime: 30_000,
    enabled: !!eventId,
  });
}

export function useAddSupplyItem(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplyItemInsert) => addSupplyItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supply-items", eventId] });
      toast.success("Supply item added");
    },
    onError: () => {
      toast.error("Failed to add supply item");
    },
  });
}

export function useDeleteSupplyItem(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteSupplyItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supply-items", eventId] });
      toast.success("Supply item removed");
    },
    onError: () => {
      toast.error("Failed to remove supply item");
    },
  });
}

export function useClaimSupplyItem(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => claimSupplyItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supply-items", eventId] });
      toast.success("Supply claimed");
    },
    onError: () => {
      toast.error("Failed to claim supply");
    },
  });
}

export function useUnclaimSupplyItem(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => unclaimSupplyItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supply-items", eventId] });
      toast.success("Removed from supply list");
    },
    onError: () => {
      toast.error("Failed to update supply list");
    },
  });
}
