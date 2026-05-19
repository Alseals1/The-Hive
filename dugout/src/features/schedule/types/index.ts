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
};

export interface EventWithAttendance extends Event {
  myStatus?: AttendanceStatus | null;
  attendanceCounts?: {
    yes: number;
    no: number;
    maybe: number;
  };
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  game: "Game",
  practice: "Practice",
  tournament: "Tournament",
  other: "Other",
};

export const EVENT_TYPE_EMOJI: Record<EventType, string> = {
  game: "⚾",
  practice: "🏃",
  tournament: "🏆",
  other: "📌",
};
