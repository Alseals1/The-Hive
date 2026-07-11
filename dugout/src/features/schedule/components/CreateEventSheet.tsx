import { useRef, useState } from "react";
import type { FC } from "react";
import { X, Trophy, Zap, Award, CalendarDays } from "lucide-react";
import { useCreateEvent, useUpdateEvent } from "../hooks/useEvents";
import { createEventSchema } from "@/lib/validationSchemas";
import { FormError } from "@/components/shared/FormError";
import { Input } from "@/components/ui/input";
import { useScrollTrap } from "@/hooks/useScrollTrap";
import type { EventType } from "@/types";
import type { EventWithAttendance } from "../types";
import { EVENT_TYPE_LABELS } from "../types";

interface CreateEventSheetProps {
  teamId: string;
  onClose: () => void;
  existing?: EventWithAttendance;
}

const EVENT_TYPES: EventType[] = ["game", "practice", "tournament", "other"];

const labelCls = "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

type CreateEventErrors = {
  title?: string;
  startsAt?: string;
};

function toLocalDatetimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EventTypeButtonIcon({ type }: { type: EventType }) {
  const cls = "flex-shrink-0";
  switch (type) {
    case "game":       return <Trophy size={16} className={cls} />;
    case "practice":   return <Zap size={16} className={cls} />;
    case "tournament": return <Award size={16} className={cls} />;
    default:           return <CalendarDays size={16} className={cls} />;
  }
}

export const CreateEventSheet: FC<CreateEventSheetProps> = ({ teamId, onClose, existing }) => {
  useScrollTrap();
  const isEditing = !!existing;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [type, setType] = useState<EventType>(existing?.type ?? "practice");
  const [location, setLocation] = useState(existing?.location ?? "");
  const [startsAt, setStartsAt] = useState(toLocalDatetimeValue(existing?.starts_at));
  const [endsAt, setEndsAt] = useState(toLocalDatetimeValue(existing?.ends_at));
  const [description, setDescription] = useState(existing?.description ?? "");
  const [fieldErrors, setFieldErrors] = useState<CreateEventErrors>({});
  const titleRef = useRef<HTMLInputElement>(null);

  const { mutate: create, isPending: isCreating, error: createError } = useCreateEvent(teamId);
  const { mutate: update, isPending: isUpdating, error: updateError } = useUpdateEvent(teamId);

  const isPending = isCreating || isUpdating;
  const error = createError ?? updateError;

  function validate(): CreateEventErrors {
    const result = createEventSchema.safeParse({ title, startsAt });
    if (!result.success) {
      const errs: CreateEventErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === "title" || field === "startsAt") {
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

    const patch = {
      title: title.trim(),
      type,
      location: location.trim() || null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      description: description.trim() || null,
    };

    if (isEditing && existing) {
      update({ eventId: existing.id, patch }, { onSuccess: onClose });
    } else {
      create({ team_id: teamId, ...patch }, { onSuccess: onClose });
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
            {isEditing ? "Edit Event" : "Add Event"}
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
          {/* Event Type */}
          <div>
            <p className={labelCls}>Event Type</p>
            <div className="grid grid-cols-4 gap-2">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-[11px] font-display font-600 uppercase tracking-wide transition-colors ${
                    type === t
                      ? "border-ember bg-ember-muted text-ember"
                      : "border-pitch-700 text-pitch-400"
                  }`}
                >
                  <EventTypeButtonIcon type={t} />
                  <span>{EVENT_TYPE_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="event-title" className={labelCls}>
              Title <span className="text-ember">*</span>
            </label>
            <Input
              ref={titleRef}
              id="event-title"
              type="text"
              aria-required="true"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: undefined }));
              }}
              placeholder="vs. Eagles"
              error={fieldErrors.title}
              errorId="event-title-error"
              maxLength={100}
            />
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-starts" className={labelCls}>
                Starts <span className="text-ember">*</span>
              </label>
              <input
                id="event-starts"
                type="datetime-local"
                aria-required="true"
                aria-describedby="event-starts-error"
                value={startsAt}
                onChange={(e) => {
                  setStartsAt(e.target.value);
                  if (fieldErrors.startsAt) setFieldErrors(prev => ({ ...prev, startsAt: undefined }));
                }}
                className="w-full px-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-700/40 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors"
              />
              <FormError message={fieldErrors.startsAt} id="event-starts-error" />
            </div>
            <div>
              <label htmlFor="event-ends" className={labelCls}>
                Ends{" "}
                <span className="text-pitch-500 text-[10px] normal-case tracking-normal font-body font-400">opt</span>
              </label>
              <input
                id="event-ends"
                type="datetime-local"
                value={endsAt}
                min={startsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-700/40 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="event-location" className={labelCls}>
              Location{" "}
              <span className="text-pitch-500 text-[10px] normal-case tracking-normal font-body font-400">opt</span>
            </label>
            <input
              id="event-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Riverside Park Field 3"
              maxLength={100}
              className="w-full px-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-700/40 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="event-desc" className={labelCls}>
              Notes{" "}
              <span className="text-pitch-500 text-[10px] normal-case tracking-normal font-body font-400">opt</span>
            </label>
            <textarea
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Bring batting helmets…"
              className="w-full px-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-700/40 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors resize-none"
            />
            <p
              className={`text-right text-xs font-body mt-1 ${
                description.length >= 300
                  ? "text-ember"
                  : description.length >= 240
                    ? "text-amber-400"
                    : "text-pitch-500"
              }`}
            >
              {description.length}/300
            </p>
          </div>

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
              ? isEditing ? "Saving…" : "Adding…"
              : isEditing ? "Save Changes" : "Add Event"}
          </button>
        </form>
      </div>
    </div>
  );
};
