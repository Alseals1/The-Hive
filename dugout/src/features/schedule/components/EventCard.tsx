import { memo } from "react";
import type { FC } from "react";
import { MapPin, Clock } from "lucide-react";
import type { EventWithAttendance } from "../types";
import { EVENT_TYPE_EMOJI, EVENT_TYPE_LABELS } from "../types";
import { AttendanceButtons } from "@/features/attendance/components/AttendanceButtons";

interface EventCardProps {
  event: EventWithAttendance;
  teamId: string;
  canDelete?: boolean;
  onDelete?: (eventId: string) => void;
}

function formatEventDate(startsAt: string): { date: string; time: string } {
  const d = new Date(startsAt);
  const date = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return { date, time };
}

export const EventCard: FC<EventCardProps> = memo(
  ({ event, teamId, canDelete, onDelete }) => {
    const { date, time } = formatEventDate(event.starts_at);
    const emoji = EVENT_TYPE_EMOJI[event.type];
    const typeLabel = EVENT_TYPE_LABELS[event.type];

    return (
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl leading-none flex-shrink-0">{emoji}</span>
              <h3 className="font-semibold text-dugout-dark text-base truncate">
                {event.title}
              </h3>
            </div>
            <span className="flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-stone-100 text-dugout-mid">
              {typeLabel}
            </span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-1 text-sm text-dugout-mid mt-1">
            <Clock size={13} className="flex-shrink-0" />
            <span>
              {date} · {time}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-1 text-sm text-dugout-mid mt-0.5">
              <MapPin size={13} className="flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {/* RSVP counts */}
        {event.attendanceCounts && (
          <div className="px-4 pb-2 flex gap-3 text-xs text-dugout-mid">
            <span>✅ {event.attendanceCounts.yes}</span>
            <span>🤔 {event.attendanceCounts.maybe}</span>
            <span>❌ {event.attendanceCounts.no}</span>
          </div>
        )}

        {/* Attendance buttons */}
        <div className="px-4 pb-4">
          <AttendanceButtons
            teamId={teamId}
            eventId={event.id}
            currentStatus={event.myStatus}
          />
        </div>

        {/* Delete (admins only) */}
        {canDelete && onDelete && (
          <div className="border-t border-stone-100 px-4 py-2">
            <button
              onClick={() => onDelete(event.id)}
              className="text-xs text-red-400 font-medium hover:text-red-500"
            >
              Delete event
            </button>
          </div>
        )}
      </div>
    );
  },
);
