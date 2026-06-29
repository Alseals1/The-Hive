import { useState } from "react";
import type { FC } from "react";
import { X, Pencil, Check } from "lucide-react";
import type { ExpectedMember } from "@/features/teams/services/expectedMembers";

interface ExpectedMemberRowProps {
  member: ExpectedMember;
  onDelete: (id: string) => void;
  onEdit?: (id: string, name: string, note: string | null) => void;
  canDelete: boolean;
  isAdmin?: boolean;
}

export const ExpectedMemberRow: FC<ExpectedMemberRowProps> = ({
  member,
  onDelete,
  onEdit,
  canDelete,
  isAdmin,
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [note, setNote] = useState(member.note ?? "");
  const [nameError, setNameError] = useState("");

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name cannot be empty.");
      return;
    }
    setNameError("");
    onEdit?.(member.id, trimmed, note.trim() || null);
    setEditing(false);
  }

  function handleCancel() {
    setName(member.name);
    setNote(member.note ?? "");
    setNameError("");
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="px-4 py-3 bg-pitch-700/40 rounded-lg space-y-2">
        <div>
          <input
            autoFocus
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(""); }}
            placeholder="Name"
            className="w-full bg-pitch-800 border border-pitch-600 focus:border-ember rounded-lg px-3 py-2 text-sm text-pitch-50 placeholder:text-pitch-500 outline-none"
          />
          {nameError && (
            <p className="text-xs text-red-400 mt-1">{nameError}</p>
          )}
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="w-full bg-pitch-800 border border-pitch-600 focus:border-ember rounded-lg px-3 py-2 text-sm text-pitch-50 placeholder:text-pitch-500 outline-none"
        />
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg text-xs font-display font-600 uppercase tracking-wide text-pitch-300 hover:text-pitch-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ember text-white text-xs font-display font-600 uppercase tracking-wide"
          >
            <Check size={13} />
            Save
          </button>
        </div>
      </div>
    );
  }

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
        {isAdmin && onEdit && (
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-pitch-400 hover:text-pitch-100 hover:bg-pitch-600/50 rounded-lg transition-colors"
            aria-label="Edit"
          >
            <Pencil size={15} />
          </button>
        )}
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
