import { supabase } from "@/lib/supabase";
import type { AttendanceStatus } from "@/types";

/**
 * Upsert the current user's RSVP for an event.
 */
export async function upsertAttendance(
  eventId: string,
  status: AttendanceStatus,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("attendance").upsert(
    {
      event_id: eventId,
      user_id: user.id,
      status,
    },
    { onConflict: "event_id,user_id" },
  );

  if (error) throw new Error(error.message);
}
