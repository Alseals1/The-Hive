import type { FC } from "react";
import { X } from "lucide-react";
import type { ExpectedMember } from "@/features/teams/services/expectedMembers";

interface ExpectedMemberRowProps {
  member: ExpectedMember;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

export const ExpectedMemberRow: FC<ExpectedMemberRowProps> = ({
  member,
  onDelete,
  canDelete,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-pitch-700/40 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body text-pitch-100 truncate">{member.name}</p>
        {member.note && (
          <p className="text-xs text-pitch-400 truncate">{member.note}</p>
        )}
      </div>
      <div className="flex items-center gap-3 ml-3">
        <span className="text-[11px] font-display font-600 uppercase tracking-widest px-2 py-1 rounded-md bg-pitch-600/50 text-pitch-400">
          Pending
        </span>
        {canDelete && (
          <button
            onClick={() => onDelete(member.id)}
            className="p-1.5 text-pitch-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            aria-label="Delete"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
