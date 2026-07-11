import type { FC } from "react";
import { X, Clock, MapPin } from "lucide-react";
import type { EventWithAttendance } from "../types";
import { EVENT_TYPE_LABELS } from "../types";
import type { TeamRole } from "@/types";
import { SupplySignupSection } from "./SupplySignupSection";
import { useScrollTrap } from "@/hooks/useScrollTrap";

interface SupplyListSheetProps {
  event: EventWithAttendance;
  teamId: string;
  userRole: TeamRole;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export const SupplyListSheet: FC<SupplyListSheetProps> = ({
  event,
  teamId,
  userRole,
  onClose,
}) => {
  useScrollTrap();
  const canManage = userRole === "admin" || userRole === "coach";
  const typeLabel = EVENT_TYPE_LABELS[event.type];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-pitch-800 border-t border-pitch-700 rounded-t-2xl z-10 max-h-[85vh] flex flex-col">
        {/* Handle */}
        <div className="pt-4 pb-2 flex justify-center flex-shrink-0">
          <div className="w-10 h-1 bg-pitch-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-4 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-display font-600 uppercase tracking-widest text-ember mb-1">
              {typeLabel} · Supplies
            </p>
            <h2 className="font-display text-2xl font-700 uppercase tracking-wide text-pitch-50 leading-tight truncate">
              {event.title}
            </h2>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-pitch-400">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {formatDate(event.starts_at)} · {formatTime(event.starts_at)}
              </span>
              {event.location && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={11} />
                  <span className="truncate">{event.location}</span>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-pitch-400 active:bg-pitch-700 flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Supply list */}
        <div className="flex-1 overflow-y-auto px-4 pb-8" data-scroll-trap-allowed>
          <SupplySignupSection
            eventId={event.id}
            teamId={teamId}
            canManage={canManage}
          />
        </div>
      </div>
    </div>
  );
};
