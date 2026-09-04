import { supabase } from "@/lib/supabase";
import type { EventInsert, EventPatch, SubEventInsert, SubEvent } from "../types";

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
      parent_event_id,
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
    .is("parent_event_id", null)
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
      parent_event_id: event.parent_event_id,
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
 * Fetch sub-events (itinerary items) for a tournament event.
 */
export async function getTournamentSubEvents(parentEventId: string): Promise<SubEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, starts_at, ends_at, type")
    .eq("parent_event_id", parentEventId)
    .order("starts_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as SubEvent[];
}

/**
 * Create a sub-event (itinerary item) under a tournament. Admins/coaches only.
 */
export async function createSubEvent(input: SubEventInsert): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("events").insert({
    team_id: input.team_id,
    parent_event_id: input.parent_event_id,
    title: input.title,
    type: "other",
    starts_at: input.starts_at,
    ends_at: input.ends_at ?? null,
    created_by: user.id,
  });

  if (error) throw new Error(error.message);
}

/**
 * Update an event. Admins/coaches only (enforced by RLS).
 */
export async function updateEvent(eventId: string, patch: EventPatch) {
  const { error } = await supabase
    .from("events")
    .update(patch)
    .eq("id", eventId);
  if (error) throw new Error(error.message);
}

/**
 * Delete an event. Admins/coaches only (enforced by RLS).
 */
export async function deleteEvent(eventId: string) {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw new Error(error.message);
}
