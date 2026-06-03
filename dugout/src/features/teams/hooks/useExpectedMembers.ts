import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getExpectedMembers,
  addExpectedMember,
  deleteExpectedMember,
} from "../services/expectedMembers";
import { toast } from "sonner";

export function useExpectedMembers(teamId: string) {
  return useQuery({
    queryKey: ["expected-members", teamId],
    queryFn: () => getExpectedMembers(teamId),
  });
}

export function useAddExpectedMember(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, note }: { name: string; note?: string }) =>
      addExpectedMember(teamId, name, note),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expected-members", teamId],
      });
      toast.success("Member added");
    },
    onError: () => {
      toast.error("Failed to add member");
    },
  });
}

export function useDeleteExpectedMember(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpectedMember,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expected-members", teamId],
      });
      toast.success("Member removed");
    },
    onError: () => {
      toast.error("Failed to remove member");
    },
  });
}
