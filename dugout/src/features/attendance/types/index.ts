import type { AttendanceStatus, Tables } from "@/types";

export type AttendanceRecord = Tables<"attendance">;

export const ATTENDANCE_OPTIONS: {
  status: AttendanceStatus;
  label: string;
  emoji: string;
  color: string;
  activeColor: string;
}[] = [
  {
    status: "yes",
    label: "Going",
    emoji: "✅",
    color: "border-stone-200 text-dugout-mid",
    activeColor: "border-field-500 bg-field-50 text-field-700",
  },
  {
    status: "maybe",
    label: "Maybe",
    emoji: "🤔",
    color: "border-stone-200 text-dugout-mid",
    activeColor: "border-yellow-400 bg-yellow-50 text-yellow-700",
  },
  {
    status: "no",
    label: "Can't Go",
    emoji: "❌",
    color: "border-stone-200 text-dugout-mid",
    activeColor: "border-red-400 bg-red-50 text-red-600",
  },
];
