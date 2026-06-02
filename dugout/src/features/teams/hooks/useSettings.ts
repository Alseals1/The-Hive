import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { getTeam, updateTeam } from "../services/settings";
import { deleteTeam, leaveTeam } from "../services/teams";
import type { TeamUpdateInput } from "../services/settings";

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId],
    queryFn: () => getTeam(teamId),
    staleTime: 60_000,
    enabled: !!teamId,
  });
}

export function useUpdateTeam(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TeamUpdateInput) => updateTeam(teamId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
  });
}

export function useDeleteTeam(teamId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
      navigate({ to: "/teams" });
    },
  });
}

export function useLeaveTeam(teamId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
      navigate({ to: "/teams" });
    },
  });
}
