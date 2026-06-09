import { useRef, useState } from "react";
import type { FC } from "react";
import { X, Pin } from "lucide-react";
import { createAnnouncementSchema } from "@/lib/validationSchemas";
import { FormError } from "@/components/shared/FormError";
import { Input } from "@/components/ui/input";
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

const labelCls =
  "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

type CreateAnnouncementErrors = {
  title?: string;
  body?: string;
};

export const CreateAnnouncementSheet: FC<CreateAnnouncementSheetProps> = ({
  teamId,
  onClose,
  existing,
}) => {
  const isEditing = !!existing;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [pinned, setPinned] = useState(existing?.pinned ?? false);
  const [fieldErrors, setFieldErrors] = useState<CreateAnnouncementErrors>({});
  const titleRef = useRef<HTMLInputElement>(null);

  const { mutate: create, isPending: isCreating, error: createError } =
    useCreateAnnouncement(teamId);
  const { mutate: update, isPending: isUpdating, error: updateError } =
    useUpdateAnnouncement(teamId);

  const isPending = isCreating || isUpdating;
  const error = createError ?? updateError;

  function validate(): CreateAnnouncementErrors {
    const result = createAnnouncementSchema.safeParse({ title, body });
    if (!result.success) {
      const errs: CreateAnnouncementErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === "title" || field === "body") {
          errs[field] = issue.message;
        }
      });
      return errs;
    }
    return {};
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      titleRef.current?.focus();
      return;
    }
    setFieldErrors({});

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
            <Input
              ref={titleRef}
              id="ann-title"
              type="text"
              aria-required="true"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: undefined }));
              }}
              placeholder="Practice rescheduled"
              error={fieldErrors.title}
              errorId="ann-title-error"
              maxLength={100}
            />
          </div>

          {/* Body */}
          <div>
            <label htmlFor="ann-body" className={labelCls}>
              Message <span className="text-ember">*</span>
            </label>
            <textarea
              id="ann-body"
              aria-required="true"
              aria-describedby="ann-body-error"
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (fieldErrors.body) setFieldErrors(prev => ({ ...prev, body: undefined }));
              }}
              rows={5}
              maxLength={1000}
              placeholder="Write your announcement here…"
              className="w-full px-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-700/40 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors resize-none"
            />
            <p
              className={`text-right text-xs font-body mt-1 ${
                body.length >= 1000
                  ? "text-ember"
                  : body.length >= 800
                    ? "text-amber-400"
                    : "text-pitch-400"
              }`}
            >
              {body.length}/1000
            </p>
            <FormError message={fieldErrors.body} id="ann-body-error" />
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
            disabled={isPending}
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
