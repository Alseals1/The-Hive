import { useState } from "react";
import type { FC } from "react";
import { X, Pin } from "lucide-react";
import type { AnnouncementWithReactions } from "../types";
import {
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from "../hooks/useAnnouncements";

interface CreateAnnouncementSheetProps {
  teamId: string;
  onClose: () => void;
  existing?: AnnouncementWithReactions;
}

const inputCls =
  "w-full px-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-700/40 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors";
const labelCls =
  "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

export const CreateAnnouncementSheet: FC<CreateAnnouncementSheetProps> = ({
  teamId,
  onClose,
  existing,
}) => {
  const isEditing = !!existing;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [pinned, setPinned] = useState(existing?.pinned ?? false);

  const { mutate: create, isPending: isCreating, error: createError } =
    useCreateAnnouncement(teamId);
  const { mutate: update, isPending: isUpdating, error: updateError } =
    useUpdateAnnouncement(teamId);

  const isPending = isCreating || isUpdating;
  const error = createError ?? updateError;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    if (isEditing && existing) {
      update(
        { id: existing.id, patch: { title: title.trim(), body: body.trim(), pinned } },
        { onSuccess: onClose },
      );
    } else {
      create(
        { team_id: teamId, title: title.trim(), body: body.trim(), pinned },
        { onSuccess: onClose },
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-pitch-800 border-t border-pitch-700 rounded-t-2xl px-4 pt-4 pb-10 z-10 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-pitch-600 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-700 uppercase tracking-wide text-pitch-50">
            {isEditing ? "Edit Post" : "New Post"}
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
          {/* Title */}
          <div>
            <label htmlFor="ann-title" className={labelCls}>
              Title <span className="text-ember">*</span>
            </label>
            <input
              id="ann-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Practice rescheduled"
              className={inputCls}
            />
          </div>

          {/* Body */}
          <div>
            <label htmlFor="ann-body" className={labelCls}>
              Message <span className="text-ember">*</span>
            </label>
            <textarea
              id="ann-body"
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Write your announcement here…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Pin toggle */}
          <button
            type="button"
            onClick={() => setPinned((p) => !p)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
              pinned
                ? "border-ember bg-ember-muted text-ember"
                : "border-pitch-700 text-pitch-400"
            }`}
          >
            <Pin size={16} className="flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-display font-600 uppercase tracking-wide">
                Pin to top
              </p>
              <p className="text-xs font-body opacity-70 mt-0.5">
                Pinned posts always appear first
              </p>
            </div>
            <div
              className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                pinned ? "border-ember bg-ember" : "border-pitch-500"
              }`}
            />
          </button>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error instanceof Error ? error.message : "Something went wrong."}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !title.trim() || !body.trim()}
            className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm disabled:opacity-40"
          >
            {isPending
              ? isEditing
                ? "Saving…"
                : "Posting…"
              : isEditing
                ? "Save Changes"
                : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
};
