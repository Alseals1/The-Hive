import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInvite, getInviteByToken, acceptInvite } from "../services/invites";
import type { TeamRole } from "@/types";

export function useCreateInvite(teamId: string) {
  return useMutation({
    mutationFn: (role: TeamRole) => createInvite(teamId, role),
  });
}

export function useInviteByToken(token: string) {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: () => getInviteByToken(token),
    enabled: !!token,
    staleTime: 30_000,
    retry: false,
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
  });
}
