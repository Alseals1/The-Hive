import { useState } from "react";
import type { FC } from "react";
import { X, Plus, Trash2, MapPin, Clock, Pencil } from "lucide-react";
import type { EventWithAttendance, SubEvent } from "../types";
import { useTournamentSubEvents, useDeleteSubEvent } from "../hooks/useEvents";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CreateSubEventSheet } from "./CreateSubEventSheet";

interface TournamentSheetProps {
  tournament: EventWithAttendance;
  teamId: string;
  canManage: boolean;
  onClose: () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export const TournamentSheet: FC<TournamentSheetProps> = ({
  tournament,
  teamId,
  canManage,
  onClose,
}) => {
  const [editingSubEvent, setEditingSubEvent] = useState<SubEvent | undefined>(undefined);
  const [showAddSub, setShowAddSub] = useState(false);

  const { data: subEvents, isLoading } = useTournamentSubEvents(tournament.id);
  const { mutate: deleteSub, isPending: isDeleting } = useDeleteSubEvent(
    teamId,
    tournament.id,
  );

  function handleEdit(sub: SubEvent) {
    setEditingSubEvent(sub);
    setShowAddSub(true);
  }

  function handleCloseSubSheet() {
    setShowAddSub(false);
    setEditingSubEvent(undefined);
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <div
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative bg-pitch-800 border-t border-pitch-700 rounded-t-2xl z-10 max-h-[85vh] flex flex-col">
          {/* Handle */}
          <div className="pt-4 pb-2 flex justify-center flex-shrink-0">
            <div className="w-10 h-1 bg-pitch-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-4 pb-4 flex items-start justify-between gap-3 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-display font-600 uppercase tracking-widest text-ember mb-1">
                Tournament
              </p>
              <h2 className="font-display text-2xl font-700 uppercase tracking-wide text-pitch-50 leading-tight truncate">
                {tournament.title}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-pitch-400">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {formatDate(tournament.starts_at)}
                </span>
                {tournament.location && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin size={11} />
                    <span className="truncate">{tournament.location}</span>
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-pitch-400 active:bg-pitch-700 flex-shrink-0"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Itinerary */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-display font-600 uppercase tracking-widest text-pitch-400">
                Itinerary
              </p>
              {canManage && (
                <button
                  onClick={() => { setEditingSubEvent(undefined); setShowAddSub(true); }}
                  className="flex items-center gap-1.5 text-xs font-display font-600 uppercase tracking-wider text-ember active:text-ember-600"
                >
                  <Plus size={13} />
                  Add
                </button>
              )}
            </div>

            {isLoading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            )}

            {!isLoading && (!subEvents || subEvents.length === 0) && (
              <div className="py-8 text-center">
                <p className="text-sm text-pitch-400 font-body">No itinerary yet.</p>
                {canManage && (
                  <button
                    onClick={() => { setEditingSubEvent(undefined); setShowAddSub(true); }}
                    className="mt-3 text-xs font-display font-600 uppercase tracking-wider text-ember"
                  >
                    + Add first item
                  </button>
                )}
              </div>
            )}

            {!isLoading && subEvents && subEvents.length > 0 && (
              <div className="space-y-1">
                {subEvents.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl bg-pitch-700/50 border border-pitch-700"
                  >
                    {/* Time */}
                    <div className="w-16 flex-shrink-0 text-right">
                      <span className="text-xs font-display font-600 text-pitch-300 tabular-nums">
                        {formatTime(sub.starts_at)}
                      </span>
                    </div>

                    {/* Dot */}
                    <div className="w-1.5 h-1.5 rounded-full bg-ember flex-shrink-0" />

                    {/* Title */}
                    <p className="flex-1 text-sm font-display font-600 uppercase tracking-wide text-pitch-100 min-w-0 truncate">
                      {sub.title}
                    </p>

                    {/* End time */}
                    {sub.ends_at && (
                      <span className="text-[10px] text-pitch-500 font-body flex-shrink-0">
                        → {formatTime(sub.ends_at)}
                      </span>
                    )}

                    {/* Admin actions */}
                    {canManage && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(sub)}
                          className="text-pitch-500 active:text-pitch-200 p-1"
                          aria-label="Edit"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => deleteSub(sub.id)}
                          disabled={isDeleting}
                          className="text-pitch-500 active:text-red-400 disabled:opacity-30 p-1"
                          aria-label="Remove"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom CTA — only when itinerary already has items, to avoid duplicate empty-state CTAs */}
          {canManage && !isLoading && subEvents && subEvents.length > 0 && (
            <div className="px-4 pb-8 pt-2 flex-shrink-0 border-t border-pitch-700">
              <button
                onClick={() => { setEditingSubEvent(undefined); setShowAddSub(true); }}
                className="w-full py-3.5 rounded-xl border border-dashed border-pitch-600 text-pitch-400 text-xs font-display font-600 uppercase tracking-wider active:bg-pitch-700"
              >
                + Add to Itinerary
              </button>
            </div>
          )}
        </div>
      </div>

      {showAddSub && (
        <CreateSubEventSheet
          teamId={teamId}
          parentEventId={tournament.id}
          parentStartsAt={tournament.starts_at}
          parentEndsAt={tournament.ends_at}
          onClose={handleCloseSubSheet}
          existing={editingSubEvent}
        />
      )}
    </>
  );
};
