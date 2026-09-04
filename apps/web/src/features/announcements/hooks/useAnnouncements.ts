import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AnnouncementInsert, AnnouncementPatch, ReactionEmoji } from "../types";
import {
  getTeamAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleReaction,
} from "../services/announcements";
import { toast } from "sonner";

export function useTeamAnnouncements(teamId: string) {
  return useQuery({
    queryKey: ["announcements", teamId],
    queryFn: () => getTeamAnnouncements(teamId),
    staleTime: 60_000,
    enabled: !!teamId,
  });
}

export function useCreateAnnouncement(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AnnouncementInsert) => createAnnouncement(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", teamId] });
      toast.success("Announcement posted");
    },
    onError: () => {
      toast.error("Failed to post announcement");
    },
  });
}

export function useUpdateAnnouncement(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: AnnouncementPatch }) =>
      updateAnnouncement(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", teamId] });
      toast.success("Announcement updated");
    },
    onError: () => {
      toast.error("Failed to update announcement");
    },
  });
}

export function useDeleteAnnouncement(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", teamId] });
      toast.success("Announcement deleted");
    },
    onError: () => {
      toast.error("Failed to delete announcement");
    },
  });
}

export function useToggleReaction(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      announcementId,
      emoji,
    }: {
      announcementId: string;
      emoji: ReactionEmoji;
    }) => toggleReaction(announcementId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", teamId] });
    },
  });
}
