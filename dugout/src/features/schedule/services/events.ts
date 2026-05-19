import { supabase } from "@/lib/supabase";
import type { EventInsert } from "../types";

/**
 * Fetch all upcoming events for a team, with the current user's RSVP status.
 * Ordered by start time ascending.
 */
export async function getTeamEvents(teamId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id,
      team_id,
      title,
      type,
      description,
      location,
      starts_at,
      ends_at,
      created_by,
      created_at,
      updated_at,
      attendance!left (
        status,
        user_id
      )
    `,
    )
    .eq("team_id", teamId)
    .order("starts_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((event) => {
    const myAttendance = event.attendance?.find((a) => a.user_id === user.id);
    const counts = (event.attendance ?? []).reduce(
      (acc, a) => {
        acc[a.status as "yes" | "no" | "maybe"] =
          (acc[a.status as "yes" | "no" | "maybe"] ?? 0) + 1;
        return acc;
      },
      { yes: 0, no: 0, maybe: 0 },
    );

    return {
      id: event.id,
      team_id: event.team_id,
      title: event.title,
      type: event.type,
      description: event.description,
      location: event.location,
      starts_at: event.starts_at,
      ends_at: event.ends_at,
      created_by: event.created_by,
      created_at: event.created_at,
      updated_at: event.updated_at,
      myStatus: myAttendance?.status ?? null,
      attendanceCounts: counts,
    };
  });
}

/**
 * Create a new event. Admins/coaches only (enforced by RLS).
 */
export async function createEvent(input: EventInsert) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("events")
    .insert({ ...input, created_by: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete an event. Admins/coaches only (enforced by RLS).
 */
export async function deleteEvent(eventId: string) {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw new Error(error.message);
}
