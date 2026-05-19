import { useState } from "react";
import type { FC } from "react";
import { X } from "lucide-react";
import { useCreateEvent } from "../hooks/useEvents";
import type { EventType } from "@/types";
import { EVENT_TYPE_LABELS, EVENT_TYPE_EMOJI } from "../types";

interface CreateEventSheetProps {
  teamId: string;
  onClose: () => void;
}

const EVENT_TYPES: EventType[] = ["game", "practice", "tournament", "other"];

export const CreateEventSheet: FC<CreateEventSheetProps> = ({
  teamId,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("practice");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [description, setDescription] = useState("");

  const { mutate, isPending, error } = useCreateEvent(teamId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startsAt) return;

    mutate(
      {
        team_id: teamId,
        title: title.trim(),
        type,
        location: location.trim() || null,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        description: description.trim() || null,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-t-2xl px-4 pt-4 pb-10 z-10 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-dugout-dark">Add Event</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-dugout-mid hover:bg-stone-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Type */}
          <div>
            <p className="text-sm font-medium text-dugout-dark mb-2">
              Event Type
            </p>
            <div className="grid grid-cols-4 gap-2">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    type === t
                      ? "border-brand-500 bg-brand-50 text-brand-600"
                      : "border-stone-200 text-dugout-mid"
                  }`}
                >
                  <span className="text-lg leading-none">
                    {EVENT_TYPE_EMOJI[t]}
                  </span>
                  <span>{EVENT_TYPE_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="event-title"
              className="block text-sm font-medium text-dugout-dark mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="vs. Eagles"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="event-starts"
                className="block text-sm font-medium text-dugout-dark mb-1"
              >
                Starts <span className="text-red-500">*</span>
              </label>
              <input
                id="event-starts"
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label
                htmlFor="event-ends"
                className="block text-sm font-medium text-dugout-dark mb-1"
              >
                Ends{" "}
                <span className="text-dugout-light text-xs font-normal">
                  (opt)
                </span>
              </label>
              <input
                id="event-ends"
                type="datetime-local"
                value={endsAt}
                min={startsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="event-location"
              className="block text-sm font-medium text-dugout-dark mb-1"
            >
              Location{" "}
              <span className="text-dugout-light text-xs font-normal">
                (opt)
              </span>
            </label>
            <input
              id="event-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Riverside Park Field 3"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="event-desc"
              className="block text-sm font-medium text-dugout-dark mb-1"
            >
              Notes{" "}
              <span className="text-dugout-light text-xs font-normal">
                (opt)
              </span>
            </label>
            <textarea
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Bring batting helmets…"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error instanceof Error ? error.message : "Failed to create event."}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || !title.trim() || !startsAt}
            className="w-full py-3 rounded-xl bg-brand-500 text-white text-base font-semibold disabled:opacity-50"
          >
            {isPending ? "Adding…" : "Add Event"}
          </button>
        </form>
      </div>
    </div>
  );
};
