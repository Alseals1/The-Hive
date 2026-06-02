import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  generateJoinCode,
  getJoinCodeByTeamId,
  getTeamByJoinCode,
  joinTeamByCode,
} from "../services/joinCode";

export function useJoinCode(teamId: string) {
  return useQuery({
    queryKey: ["join-code", teamId],
    queryFn: () => getJoinCodeByTeamId(teamId),
    staleTime: 5 * 60_000, // 5 minutes
  });
}

export function useGenerateJoinCode(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateJoinCode(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["join-code", teamId] });
    },
  });
}

export function useTeamByJoinCode(code: string) {
  return useQuery({
    queryKey: ["team-by-code", code],
    queryFn: () => getTeamByJoinCode(code),
    enabled: !!code,
    staleTime: 30_000,
    retry: false,
  });
}

export function useJoinTeamByCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinTeamByCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
  });
}
