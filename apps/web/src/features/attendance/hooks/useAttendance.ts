import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertAttendance } from "../services/attendance";
import type { AttendanceStatus } from "@/types";
import { toast } from "sonner";

export function useUpsertAttendance(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      status,
    }: {
      eventId: string;
      status: AttendanceStatus;
    }) => upsertAttendance(eventId, status),
    onSuccess: () => {
      // Refetch events so RSVP counts + my status update
      queryClient.invalidateQueries({ queryKey: ["events", teamId] });
      toast.success("RSVP saved");
    },
    onError: () => {
      toast.error("Failed to save RSVP");
    },
  });
}
