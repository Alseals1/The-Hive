import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInvite, getInviteByToken, acceptInvite, getTeamInvites, revokeInvite } from "../services/invites";
import { toast } from "sonner";
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

export function useTeamInvites(teamId: string) {
  return useQuery({
    queryKey: ["team-invites", teamId],
    queryFn: () => getTeamInvites(teamId),
    staleTime: 30_000,
  });
}

export function useRevokeInvite(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-invites", teamId] });
      toast.success("Invite revoked");
    },
    onError: () => toast.error("Failed to revoke invite"),
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
