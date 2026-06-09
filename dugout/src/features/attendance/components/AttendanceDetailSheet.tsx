import type { FC } from "react";
import { X, Users } from "lucide-react";
import { useAttendanceRoster } from "../hooks/useAttendanceRoster";
import type { AttendanceRosterEntry } from "../types";
import type { AttendanceStatus } from "@/types";

interface AttendanceDetailSheetProps {
  event: { id: string; title: string };
  onClose: () => void;
}

interface RosterSection {
  status: AttendanceStatus;
  label: string;
  headerClass: string;
  entries: AttendanceRosterEntry[];
}

function AvatarCircle({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-ember flex items-center justify-center text-white font-display font-bold text-sm uppercase flex-shrink-0">
      {initial}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse bg-pitch-700 rounded h-9 w-full" />
      ))}
    </div>
  );
}

export const AttendanceDetailSheet: FC<AttendanceDetailSheetProps> = ({
  event,
  onClose,
}) => {
  const { data: roster, isLoading } = useAttendanceRoster(event.id);

  const going = (roster ?? []).filter((r) => r.status === "yes");
  const maybe = (roster ?? []).filter((r) => r.status === "maybe");
  const cantGo = (roster ?? []).filter((r) => r.status === "no");

  const sections: RosterSection[] = [
    { status: "yes",   label: "Going",     headerClass: "text-field",     entries: going  },
    { status: "maybe", label: "Maybe",     headerClass: "text-yellow-400", entries: maybe  },
    { status: "no",    label: "Can't Go",  headerClass: "text-red-400",    entries: cantGo },
  ].filter((s) => s.entries.length > 0);

  const hasAnyRsvps = (roster ?? []).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative bg-pitch-800 border-t border-pitch-700 rounded-t-2xl z-10 max-h-[85vh] flex flex-col">
        {/* Handle */}
        <div className="pt-4 pb-2 flex justify-center flex-shrink-0">
          <div className="w-10 h-1 bg-pitch-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-4 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-display font-600 uppercase tracking-widest text-ember mb-1">
              Attendance Roster
            </p>
            <h2 className="font-display text-2xl font-700 uppercase tracking-wide text-pitch-50 leading-tight truncate">
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-pitch-400 active:bg-pitch-700 flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {isLoading && <SkeletonRows />}

          {!isLoading && !hasAnyRsvps && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Users size={24} className="text-pitch-400" />
              <p className="text-pitch-400 font-body text-sm">No RSVPs yet</p>
            </div>
          )}

          {!isLoading && hasAnyRsvps && (
            <div>
              {sections.map((section, idx) => (
                <div
                  key={section.status}
                  className={idx > 0 ? "border-t border-pitch-700 pt-4 mt-4" : ""}
                >
                  {/* Section header */}
                  <div className="flex items-center gap-1 mb-2">
                    <span
                      className={`font-display text-xs font-semibold uppercase tracking-wider ${section.headerClass}`}
                    >
                      {section.label}
                    </span>
                    <span className="text-pitch-400 text-xs ml-1">
                      {section.entries.length}
                    </span>
                  </div>

                  {/* Member rows */}
                  <div className="space-y-2">
                    {section.entries.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3">
                        <AvatarCircle name={entry.fullName} />
                        <span className="text-sm text-pitch-100 font-body">
                          {entry.fullName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
