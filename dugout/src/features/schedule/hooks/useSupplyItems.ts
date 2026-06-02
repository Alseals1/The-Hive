import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSupplyItems,
  addSupplyItem,
  deleteSupplyItem,
  claimSupplyItem,
  unclaimSupplyItem,
} from "../services/supplyItems";
import type { SupplyItemInsert } from "../types/supplyItems";

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
    },
  });
}

export function useDeleteSupplyItem(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteSupplyItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supply-items", eventId] });
    },
  });
}

export function useClaimSupplyItem(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => claimSupplyItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supply-items", eventId] });
    },
  });
}

export function useUnclaimSupplyItem(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => unclaimSupplyItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supply-items", eventId] });
    },
  });
}
