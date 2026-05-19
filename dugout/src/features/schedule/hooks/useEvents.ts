import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTeamEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getTournamentSubEvents,
  createSubEvent,
} from "../services/events";
import type { EventInsert, EventPatch, SubEventInsert } from "../types";

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

export function useTournamentSubEvents(parentEventId: string) {
  return useQuery({
    queryKey: ["subevents", parentEventId],
    queryFn: () => getTournamentSubEvents(parentEventId),
    staleTime: 30_000,
    enabled: !!parentEventId,
  });
}

export function useCreateSubEvent(teamId: string, parentEventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubEventInsert) => createSubEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subevents", parentEventId] });
    },
  });
}

export function useDeleteSubEvent(teamId: string, parentEventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subevents", parentEventId] });
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
