import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  generateJoinCode,
  getJoinCodeByTeamId,
  getTeamByJoinCode,
  joinTeamByCode,
  deleteJoinCode,
} from "../services/joinCode";
import { toast } from "sonner";
import type { TeamRole } from "@/types";

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

export function useDeleteJoinCode(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteJoinCode(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["join-code", teamId] });
      toast.success("Join code removed");
    },
    onError: () => toast.error("Failed to remove join code"),
  });
}

export function useJoinTeamByCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, role }: { code: string; role?: TeamRole }) =>
      joinTeamByCode(code, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
  });
}
