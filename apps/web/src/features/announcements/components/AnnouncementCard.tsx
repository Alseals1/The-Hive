import { memo } from "react";
import type { FC } from "react";
import type { AnnouncementWithReactions, ReactionEmoji } from "../types";
import { REACTION_OPTIONS } from "../types";
import { useToggleReaction } from "../hooks/useAnnouncements";

interface AnnouncementCardProps {
  announcement: AnnouncementWithReactions;
  teamId: string;
  canPost: boolean;
  onEdit: (a: AnnouncementWithReactions) => void;
  onDelete: (id: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export const AnnouncementCard: FC<AnnouncementCardProps> = memo(
  ({ announcement, teamId, canPost, onEdit, onDelete }) => {
    const { mutate: toggle, isPending } = useToggleReaction(teamId);

    function handleReaction(emoji: ReactionEmoji) {
      toggle({ announcementId: announcement.id, emoji });
    }

    return (
      <div className="bg-pitch-800 rounded-card border border-pitch-700 overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          {/* Pin badge */}
          {announcement.pinned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-display font-600 uppercase tracking-widest text-ember mb-2">
              <span className="w-1 h-1 rounded-full bg-ember" />
              Pinned
            </span>
          )}

          {/* Title */}
          <h3 className="font-display text-lg font-700 uppercase tracking-wide text-pitch-50 leading-tight mb-1.5">
            {announcement.title}
          </h3>

          {/* Body */}
          <p className="text-sm text-pitch-200 font-body leading-relaxed whitespace-pre-wrap">
            {announcement.body}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-pitch-400">
            {announcement.authorName && (
              <>
                <span>{announcement.authorName}</span>
                <span className="text-pitch-600">·</span>
              </>
            )}
            <span>{formatRelativeTime(announcement.created_at)}</span>
          </div>
        </div>

        {/* Reaction pills */}
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {REACTION_OPTIONS.map((opt) => {
            const reaction = announcement.reactions.find(
              (r) => r.emoji === opt.emoji,
            );
            const reacted = reaction?.reacted ?? false;
            const count = reaction?.count ?? 0;

            return (
              <button
                key={opt.emoji}
                type="button"
                disabled={isPending}
                onClick={() => handleReaction(opt.emoji)}
                aria-label={
                  reacted
                    ? `Remove ${opt.label} reaction`
                    : count > 0
                      ? `React with ${opt.label} — ${count} ${count === 1 ? "reaction" : "reactions"}`
                      : `React with ${opt.label}`
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-display font-600 transition-colors disabled:opacity-40 ${
                  reacted
                    ? "border-ember bg-ember-muted text-pitch-50"
                    : "border-pitch-600 text-pitch-400"
                }`}
              >
                <span className="text-sm leading-none">{opt.icon}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Admin actions */}
        {canPost && (
          <div className="border-t border-pitch-700 px-4 py-2.5 flex items-center justify-end gap-4">
            <button
              onClick={() => onEdit(announcement)}
              className="text-xs text-pitch-300 font-display font-600 uppercase tracking-wider active:text-pitch-100"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(announcement.id)}
              className="text-xs text-red-500 font-display font-600 uppercase tracking-wider active:text-red-400"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  },
);

AnnouncementCard.displayName = "AnnouncementCard";
