import { useState } from "react";
import type { FC } from "react";
import { X, Copy, Check, Link } from "lucide-react";
import { useCreateInvite } from "@/features/teams/hooks/useInvites";
import type { TeamRole } from "@/types";

interface InviteSheetProps {
  teamId: string;
  onClose: () => void;
}

const ROLE_OPTIONS: { value: TeamRole; label: string; description: string }[] = [
  { value: "player",  label: "Player",  description: "A player on the team"     },
  { value: "parent",  label: "Parent",  description: "Parent or guardian"        },
  { value: "coach",   label: "Coach",   description: "Coach or assistant coach"  },
  { value: "manager", label: "Manager", description: "Team manager"              },
];

export const InviteSheet: FC<InviteSheetProps> = ({ teamId, onClose }) => {
  const [role, setRole] = useState<TeamRole>("parent");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { mutate: create, isPending, error } = useCreateInvite(teamId);

  function handleGenerate() {
    create(role, {
      onSuccess: (token) => {
        const url = `${window.location.origin}/invite/${token}`;
        setInviteUrl(url);
      },
    });
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-pitch-800 border-t border-pitch-700 rounded-t-2xl px-4 pt-4 pb-10 z-10 max-h-[80vh] overflow-y-auto">
        <div className="w-10 h-1 bg-pitch-600 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-700 uppercase tracking-wide text-pitch-50">
            Invite to Team
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-pitch-400 active:bg-pitch-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {!inviteUrl ? (
          <>
            <p className="text-xs font-display font-600 uppercase tracking-widest text-pitch-400 mb-3">
              Joining as
            </p>
            <div className="space-y-2 mb-6">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                    role === option.value
                      ? "border-ember bg-ember-muted"
                      : "border-pitch-700 bg-pitch-700/40"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                      role === option.value
                        ? "border-ember bg-ember"
                        : "border-pitch-500"
                    }`}
                  />
                  <div>
                    <p className={`text-sm font-display font-600 uppercase tracking-wide ${
                      role === option.value ? "text-ember" : "text-pitch-100"
                    }`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-pitch-400">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-400 mb-4">
                {error instanceof Error ? error.message : "Failed to create invite."}
              </p>
            )}

            <button
              onClick={handleGenerate}
              disabled={isPending}
              className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Link size={16} />
              {isPending ? "Generating…" : "Generate Invite Link"}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-display font-600 uppercase tracking-widest text-pitch-400">
                Invite link
              </p>
              <span className="px-2 py-0.5 text-[10px] rounded-md bg-ember-muted text-ember font-display font-600 uppercase tracking-wider">
                {role}
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 bg-pitch-700 rounded-xl mb-1.5">
              <p className="text-sm text-pitch-300 flex-1 truncate font-body">{inviteUrl}</p>
            </div>
            <p className="text-xs text-pitch-500 mb-6 font-body">
              Expires in 7 days · Anyone with this link can join
            </p>

            <button
              onClick={handleCopy}
              className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy Link"}
            </button>

            <button
              onClick={() => setInviteUrl(null)}
              className="w-full py-3.5 mt-3 rounded-xl border border-pitch-600 text-pitch-300 font-display font-600 uppercase tracking-wider text-xs"
            >
              Create Another
            </button>
          </>
        )}
      </div>
    </div>
  );
};
