import type { FC } from "react";
import type { AttendanceStatus } from "@/types";
import { ATTENDANCE_OPTIONS } from "../types";
import { useUpsertAttendance } from "../hooks/useAttendance";

interface AttendanceButtonsProps {
  teamId: string;
  eventId: string;
  currentStatus: AttendanceStatus | null | undefined;
}

export const AttendanceButtons: FC<AttendanceButtonsProps> = ({
  teamId,
  eventId,
  currentStatus,
}) => {
  const { mutate, isPending } = useUpsertAttendance(teamId);

  return (
    <div className="flex gap-2">
      {ATTENDANCE_OPTIONS.map((option) => {
        const isActive = currentStatus === option.status;
        return (
          <button
            key={option.status}
            type="button"
            disabled={isPending}
            aria-pressed={isActive}
            onClick={() => mutate({ eventId, status: option.status })}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-display font-600 uppercase tracking-wider transition-colors disabled:opacity-40 ${
              isActive ? option.activeColor : option.color
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? option.dotColor : 'bg-pitch-500'}`} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
