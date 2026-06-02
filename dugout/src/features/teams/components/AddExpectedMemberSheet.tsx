import { useState } from "react";
import type { FC } from "react";
import { X } from "lucide-react";
import { useAddExpectedMember } from "@/features/teams/hooks/useExpectedMembers";
import { Input } from "@/components/ui/input";

interface AddExpectedMemberSheetProps {
  teamId: string;
  onClose: () => void;
}

export const AddExpectedMemberSheet: FC<AddExpectedMemberSheetProps> = ({
  teamId,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const { mutate: add, isPending, error } = useAddExpectedMember(teamId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    add(
      { name: name.trim(), note: note.trim() || undefined },
      {
        onSuccess: () => {
          setName("");
          setNote("");
          onClose();
        },
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-pitch-800 border-t border-pitch-700 rounded-t-2xl px-4 pt-4 pb-10 z-10">
        <div className="w-10 h-1 bg-pitch-600 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-700 uppercase tracking-wide text-pitch-50">
            Add Expected Member
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-pitch-400 active:bg-pitch-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5"
            >
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Parent or player name"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="note"
              className="block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5"
            >
              Note (optional)
            </label>
            <Input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Jersey #, player name"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error instanceof Error ? error.message : "Something went wrong."}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm disabled:opacity-40"
          >
            {isPending ? "Adding…" : "Add Member"}
          </button>
        </form>
      </div>
    </div>
  );
};
