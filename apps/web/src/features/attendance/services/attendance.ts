import { supabase } from "@/lib/supabase";
import type { AttendanceStatus } from "@/types";
import type { AttendanceRosterEntry } from "../types";

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

export async function getAttendanceRoster(eventId: string): Promise<AttendanceRosterEntry[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select("id, user_id, status, profiles(full_name, avatar_url)")
    .eq("event_id", eventId);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      userId: row.user_id,
      fullName: profile?.full_name ?? "Unknown",
      avatarUrl: profile?.avatar_url ?? null,
      status: row.status as AttendanceStatus,
    };
  });
}
