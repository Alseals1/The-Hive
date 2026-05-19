import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeamEvents, createEvent, updateEvent, deleteEvent } from "../services/events";
import type { EventInsert, EventPatch } from "../types";

export function useTeamEvents(teamId: string) {
  return useQuery({
    queryKey: ["events", teamId],
    queryFn: () => getTeamEvents(teamId),
    staleTime: 60_000,
    enabled: !!teamId,
  });
}

export function useCreateEvent(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EventInsert) => createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", teamId] });
    },
  });
}

export function useUpdateEvent(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, patch }: { eventId: string; patch: EventPatch }) =>
      updateEvent(eventId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", teamId] });
    },
  });
}

export function useDeleteEvent(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", teamId] });
    },
  });
}
