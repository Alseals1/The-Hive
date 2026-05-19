import { useState } from "react";
import type { FC } from "react";
import { X } from "lucide-react";
import { useCreateSubEvent, useUpdateEvent } from "../hooks/useEvents";
import type { SubEvent } from "../types";

interface CreateSubEventSheetProps {
  teamId: string;
  parentEventId: string;
  onClose: () => void;
  existing?: SubEvent;
}

const inputCls =
  "w-full px-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-700/40 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors";
const labelCls =
  "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

function toLocalDatetimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const CreateSubEventSheet: FC<CreateSubEventSheetProps> = ({
  teamId,
  parentEventId,
  onClose,
  existing,
}) => {
  const isEditing = !!existing;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [startsAt, setStartsAt] = useState(toLocalDatetimeValue(existing?.starts_at));
  const [endsAt, setEndsAt] = useState(toLocalDatetimeValue(existing?.ends_at));

  const { mutate: create, isPending: isCreating, error: createError } =
    useCreateSubEvent(teamId, parentEventId);
  const { mutate: update, isPending: isUpdating, error: updateError } =
    useUpdateEvent(teamId);

  const isPending = isCreating || isUpdating;
  const error = createError ?? updateError;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startsAt) return;

    if (isEditing && existing) {
      update(
        {
          eventId: existing.id,
          patch: {
            title: title.trim(),
            starts_at: new Date(startsAt).toISOString(),
            ends_at: endsAt ? new Date(endsAt).toISOString() : null,
          },
        },
        { onSuccess: onClose },
      );
    } else {
      create(
        {
          team_id: teamId,
          parent_event_id: parentEventId,
          title: title.trim(),
          starts_at: new Date(startsAt).toISOString(),
          ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        },
        { onSuccess: onClose },
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-pitch-800 border-t border-pitch-700 rounded-t-2xl px-4 pt-4 pb-10 z-10">
        <div className="w-10 h-1 bg-pitch-600 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-700 uppercase tracking-wide text-pitch-50">
            {isEditing ? "Edit Item" : "Add to Itinerary"}
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
            <label htmlFor="sub-title" className={labelCls}>
              Title <span className="text-ember">*</span>
            </label>
            <input
              id="sub-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Game 1 vs Eagles"
              className={inputCls}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sub-starts" className={labelCls}>
                Start <span className="text-ember">*</span>
              </label>
              <input
                id="sub-starts"
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="sub-ends" className={labelCls}>
                End{" "}
                <span className="text-pitch-500 text-[10px] normal-case tracking-normal font-body font-400">opt</span>
              </label>
              <input
                id="sub-ends"
                type="datetime-local"
                value={endsAt}
                min={startsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error instanceof Error ? error.message : "Something went wrong."}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !title.trim() || !startsAt}
            className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm disabled:opacity-40"
          >
            {isPending
              ? isEditing ? "Saving…" : "Adding…"
              : isEditing ? "Save Changes" : "Add to Itinerary"}
          </button>
        </form>
      </div>
    </div>
  );
};
