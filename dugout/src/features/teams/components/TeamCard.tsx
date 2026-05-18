import type { FC } from "react";
import type { TeamRole } from "@/types";

interface TeamCardProps {
  id: string;
  name: string;
  sport: string;
  season: string | null;
  role: TeamRole;
  onClick: () => void;
}

const roleLabel: Record<TeamRole, string> = {
  admin: "Admin",
  coach: "Coach",
  manager: "Manager",
  player: "Player",
  parent: "Parent",
};

const roleColors: Record<TeamRole, string> = {
  admin: "bg-brand-100 text-brand-700",
  coach: "bg-field-50 text-field-700",
  manager: "bg-blue-50 text-blue-700",
  player: "bg-purple-50 text-purple-700",
  parent: "bg-stone-100 text-stone-600",
};

export const TeamCard: FC<TeamCardProps> = ({
  name,
  sport,
  season,
  role,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-card border border-stone-200 shadow-sm p-4 text-left active:bg-stone-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-dugout-dark truncate">
            {name}
          </h3>
          <p className="text-sm text-dugout-mid mt-0.5">
            {sport.charAt(0).toUpperCase() + sport.slice(1)}
            {season ? ` · ${season}` : ""}
          </p>
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[role]}`}
        >
          {roleLabel[role]}
        </span>
      </div>
      <div className="mt-3 flex items-center text-brand-600 text-sm font-medium">
        Open team <span className="ml-1">→</span>
      </div>
    </button>
  );
};
