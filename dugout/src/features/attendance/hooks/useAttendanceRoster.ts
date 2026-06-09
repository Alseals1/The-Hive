import { useQuery } from "@tanstack/react-query";
import { getAttendanceRoster } from "../services/attendance";

export function useAttendanceRoster(eventId: string) {
  return useQuery({
    queryKey: ["attendance", "roster", eventId],
    queryFn: () => getAttendanceRoster(eventId),
    enabled: !!eventId,
  });
}
