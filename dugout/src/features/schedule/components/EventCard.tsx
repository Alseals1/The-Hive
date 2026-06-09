import { memo } from "react";
import type { FC } from "react";
import { MapPin, Clock, Trophy, Zap, Award, CalendarDays, ChevronRight } from "lucide-react";
import type { EventType } from "@/types";
import type { EventWithAttendance } from "../types";
import { EVENT_TYPE_LABELS } from "../types";
import { AttendanceButtons } from "@/features/attendance/components/AttendanceButtons";

interface EventCardProps {
  event: EventWithAttendance;
  teamId: string;
  canDelete?: boolean;
  onDelete?: (eventId: string) => void;
  onEdit?: (event: EventWithAttendance) => void;
  onViewTournament?: (event: EventWithAttendance) => void;
  onViewSupplies?: (event: EventWithAttendance) => void;
  onViewRoster?: (event: EventWithAttendance) => void;
}

function EventTypeIcon({ type }: { type: EventType }) {
  const cls = "flex-shrink-0 text-pitch-300";
  switch (type) {
    case "game":       return <Trophy size={15} className={cls} />;
    case "practice":   return <Zap size={15} className={cls} />;
    case "tournament": return <Award size={15} className={cls} />;
    default:           return <CalendarDays size={15} className={cls} />;
  }
}

function formatEventDate(startsAt: string): { date: string; time: string } {
  const d = new Date(startsAt);
  const date = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return { date, time };
}

export const EventCard: FC<EventCardProps> = memo(
  ({ event, teamId, canDelete, onDelete, onEdit, onViewTournament, onViewSupplies, onViewRoster }) => {
    const { date, time } = formatEventDate(event.starts_at);
    const typeLabel = EVENT_TYPE_LABELS[event.type];

    return (
      <div className="bg-pitch-800 rounded-card border border-pitch-700 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display text-lg font-700 uppercase tracking-wide text-pitch-50 leading-tight flex-1 min-w-0 truncate">
              {event.title}
            </h3>
            <span className="flex-shrink-0 flex items-center gap-1 text-[11px] font-display font-600 uppercase tracking-wider px-2 py-1 rounded-md bg-pitch-700 text-pitch-200">
              <EventTypeIcon type={event.type} />
              {typeLabel}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-pitch-300">
            <span className="flex items-center gap-1">
              <Clock size={11} className="flex-shrink-0" />
              {date} · {time}
            </span>
            {event.location && (
              <span className="flex items-center gap-1 min-w-0">
                <MapPin size={11} className="flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* RSVP counts */}
        {event.attendanceCounts && (
          <div className="px-4 pb-2 flex gap-4 text-xs text-pitch-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-field inline-block" />
              {event.attendanceCounts.yes} going
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
              {event.attendanceCounts.maybe} maybe
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              {event.attendanceCounts.no} out
            </span>
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

        {/* Tournament itinerary affordance */}
        {event.type === "tournament" && onViewTournament && (
          <button
            onClick={() => onViewTournament(event)}
            className="w-full px-4 py-3 border-t border-pitch-700 flex items-center justify-between text-xs font-display font-600 uppercase tracking-wider text-zinc-200 active:bg-pitch-700 transition-colors"
          >
            <span>View Itinerary</span>
            <ChevronRight size={14} />
          </button>
        )}

        {/* Supplies signup */}
        {onViewSupplies && (
          <button
            onClick={() => onViewSupplies(event)}
            className="w-full px-4 py-3 border-t border-pitch-700 flex items-center justify-between text-xs font-display font-600 uppercase tracking-wider text-zinc-200 active:bg-pitch-700 transition-colors"
          >
            <span>Supplies</span>
            <ChevronRight size={14} />
          </button>
        )}

        {/* Who's Coming roster */}
        {onViewRoster && (
          <button
            onClick={() => onViewRoster(event)}
            className="w-full px-4 py-3 border-t border-pitch-700 flex items-center justify-between text-xs font-display font-600 uppercase tracking-wider text-zinc-200 active:bg-pitch-700 transition-colors"
          >
            <span>Who's Coming</span>
            <ChevronRight size={14} />
          </button>
        )}

        {/* Admin actions */}
        {canDelete && (onEdit || onDelete) && (
          <div className="border-t border-pitch-700 px-4 py-2.5 flex items-center justify-end gap-4">
            {onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="text-xs text-zinc-200 font-display font-600 uppercase tracking-wider active:text-pitch-100"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(event.id)}
                className="text-xs text-red-500 font-display font-600 uppercase tracking-wider active:text-red-400"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);
