import type { FC } from "react";
import { toast } from "sonner";
import type { AttendanceStatus } from "@/types";
import { ATTENDANCE_OPTIONS } from "../types";
import { useUpsertAttendance } from "../hooks/useAttendance";

interface AttendanceButtonsProps {
  teamId: string;
  eventId: string;
  currentStatus: AttendanceStatus | null | undefined;
  locked?: boolean;
}

export const AttendanceButtons: FC<AttendanceButtonsProps> = ({
  teamId,
  eventId,
  currentStatus,
  locked,
}) => {
  const { mutate, isPending } = useUpsertAttendance(teamId);

  return (
    <div>
      <div className="flex gap-2">
        {ATTENDANCE_OPTIONS.map((option) => {
          const isActive = currentStatus === option.status;
          return (
            <button
              key={option.status}
              type="button"
              disabled={isPending || locked}
              aria-pressed={isActive}
              aria-disabled={locked}
              onClick={() => {
                if (locked) return;
                const messages: Record<AttendanceStatus, string> = {
                  yes: "You're in. See you at the field.",
                  maybe: "Got it — we'll keep your spot warm.",
                  no: "Got it — you'll be missed.",
                };
                mutate({ eventId, status: option.status }, {
                  onSuccess: () => toast.success(messages[option.status]),
                });
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-display font-600 uppercase tracking-wider transition-colors disabled:opacity-40 ${
                locked ? "cursor-not-allowed" : ""
              } ${isActive ? option.activeColor : option.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? option.dotColor : 'bg-pitch-500'}`} />
              {option.label}
            </button>
          );
        })}
      </div>
      {locked && (
        <p className="mt-2 text-[11px] font-body text-pitch-400">
          RSVP closed · event has ended
        </p>
      )}
    </div>
  );
};
