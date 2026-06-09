import type { FC } from "react";
import { ChevronRight } from "lucide-react";
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
  admin:   "Admin",
  coach:   "Coach",
  manager: "Manager",
  player:  "Player",
  parent:  "Parent",
};

const roleColors: Record<TeamRole, string> = {
  admin:   "bg-ember-muted text-ember",
  coach:   "bg-field-muted text-field",
  manager: "bg-blue-500/10 text-blue-400",
  player:  "bg-purple-500/10 text-purple-400",
  parent:  "bg-pitch-600 text-pitch-200",
};

export const TeamCard: FC<TeamCardProps> = ({ name, sport, season, role, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-pitch-800 rounded-card border border-pitch-700 p-4 text-left active:bg-pitch-700 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl font-700 uppercase tracking-wide text-pitch-50 overflow-hidden line-clamp-2 leading-tight">
            {name}
          </h3>
          <p className="text-xs text-pitch-300 mt-0.5 font-body">
            {sport.charAt(0).toUpperCase() + sport.slice(1)}
            {season ? ` · ${season}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[11px] font-display font-600 uppercase tracking-wider px-2.5 py-1 rounded-md ${roleColors[role]}`}>
            {roleLabel[role]}
          </span>
          <ChevronRight size={16} className="text-pitch-500" />
        </div>
      </div>
    </button>
  );
};
