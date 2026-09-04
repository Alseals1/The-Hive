import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTeam, getMyTeams, getCanCreateTeam } from "../services/teams";

export function useMyTeams() {
  return useQuery({
    queryKey: ["teams", "mine"],
    queryFn: getMyTeams,
    staleTime: 60_000,
  });
}

export function useCanCreateTeam() {
  return useQuery({
    queryKey: ["profile", "can-create-team"],
    queryFn: getCanCreateTeam,
    staleTime: 5 * 60_000,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
  });
}
