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
import { toast } from "sonner";

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
      toast.success("Event created");
    },
    onError: () => {
      toast.error("Failed to create event");
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

export function useCreateSubEvent(_teamId: string, parentEventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubEventInsert) => createSubEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subevents", parentEventId] });
      toast.success("Event created");
    },
    onError: () => {
      toast.error("Failed to create event");
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
      toast.success("Event deleted");
    },
    onError: () => {
      toast.error("Failed to delete event");
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
      toast.success("Event updated");
    },
    onError: () => {
      toast.error("Failed to update event");
    },
  });
}

export function useDeleteEvent(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", teamId] });
      toast.success("Event deleted");
    },
    onError: () => {
      toast.error("Failed to delete event");
    },
  });
}
