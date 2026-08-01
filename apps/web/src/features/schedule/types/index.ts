import type { EventType, AttendanceStatus, Tables } from "@/types";

export type Event = Tables<"events">;

export type EventInsert = {
  team_id: string;
  title: string;
  type: EventType;
  description?: string | null;
  location?: string | null;
  starts_at: string;
  ends_at?: string | null;
  parent_event_id?: string | null;
};

export type SubEventInsert = {
  team_id: string;
  parent_event_id: string;
  title: string;
  starts_at: string;
  ends_at?: string | null;
};

export interface SubEvent {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  type: EventType;
};

export interface EventWithAttendance extends Event {
  myStatus?: AttendanceStatus | null;
  attendanceCounts?: {
    yes: number;
    no: number;
    maybe: number;
  };
}

export type EventPatch = {
  title?: string;
  type?: EventType;
  description?: string | null;
  location?: string | null;
  starts_at?: string;
  ends_at?: string | null;
  parent_event_id?: string | null;
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  game: "Game",
  practice: "Practice",
  tournament: "Tournament",
  other: "Other",
};

export const EVENT_TYPE_ICON: Record<EventType, string> = {
  game: "trophy",
  practice: "zap",
  tournament: "award",
  other: "calendar-days",
};
