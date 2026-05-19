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
            onClick={() =>
              mutate({ eventId, status: option.status })
            }
            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border text-xs font-medium transition-colors disabled:opacity-50 ${
              isActive ? option.activeColor : option.color
            }`}
          >
            <span className="text-base leading-none">{option.emoji}</span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
