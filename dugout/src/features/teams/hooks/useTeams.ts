import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTeam, getMyTeams } from "../services/teams";

export function useMyTeams() {
  return useQuery({
    queryKey: ["teams", "mine"],
    queryFn: getMyTeams,
    staleTime: 60_000,
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
