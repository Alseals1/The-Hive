import type { AttendanceStatus, Tables } from "@/types";

export type AttendanceRecord = Tables<"attendance">;

export const ATTENDANCE_OPTIONS: {
  status: AttendanceStatus;
  label: string;
  color: string;
  activeColor: string;
  dotColor: string;
}[] = [
  {
    status: "yes",
    label: "Going",
    color: "border-pitch-600 text-zinc-200",
    activeColor: "border-field bg-field-muted text-field",
    dotColor: "bg-field",
  },
  {
    status: "maybe",
    label: "Maybe",
    color: "border-pitch-600 text-zinc-200",
    activeColor: "border-yellow-400 bg-yellow-400/10 text-yellow-400",
    dotColor: "bg-yellow-400",
  },
  {
    status: "no",
    label: "Can't Go",
    color: "border-pitch-600 text-zinc-200",
    activeColor: "border-red-500 bg-red-500/10 text-red-400",
    dotColor: "bg-red-500",
  },
];
