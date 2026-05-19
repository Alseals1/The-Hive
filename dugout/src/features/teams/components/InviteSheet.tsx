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
  { value: "player", label: "Player", description: "A player on the team" },
  { value: "parent", label: "Parent", description: "Parent or guardian" },
  { value: "coach", label: "Coach", description: "Coach or assistant coach" },
  { value: "manager", label: "Manager", description: "Team manager" },
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-2xl px-4 pt-4 pb-10 z-10 max-h-[80vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-dugout-dark">Invite to Team</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-dugout-mid hover:bg-stone-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {!inviteUrl ? (
          <>
            {/* Role selector */}
            <p className="text-sm font-medium text-dugout-dark mb-3">
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
                      ? "border-brand-500 bg-brand-50"
                      : "border-stone-200 bg-white"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      role === option.value
                        ? "border-brand-500 bg-brand-500"
                        : "border-stone-300"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${role === option.value ? "text-brand-600" : "text-dugout-dark"}`}
                    >
                      {option.label}
                    </p>
                    <p className="text-xs text-dugout-mid">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-4">
                {error instanceof Error ? error.message : "Failed to create invite."}
              </p>
            )}

            <button
              onClick={handleGenerate}
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-brand-500 text-white text-base font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Link size={18} />
              {isPending ? "Generating…" : "Generate Invite Link"}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-dugout-dark">Invite link</p>
              <span className="px-2 py-0.5 text-xs rounded-full bg-brand-50 text-brand-600 font-medium capitalize">
                {role}
              </span>
            </div>

            {/* Link display */}
            <div className="flex items-center gap-2 px-4 py-3 bg-stone-100 rounded-xl mb-2">
              <p className="text-sm text-dugout-mid flex-1 truncate">{inviteUrl}</p>
            </div>
            <p className="text-xs text-dugout-light mb-6">
              Expires in 7 days · Anyone with this link can join
            </p>

            <button
              onClick={handleCopy}
              className="w-full py-3 rounded-xl bg-brand-500 text-white text-base font-semibold flex items-center justify-center gap-2"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "Copied!" : "Copy Link"}
            </button>

            <button
              onClick={() => setInviteUrl(null)}
              className="w-full py-3 mt-3 rounded-xl border border-stone-200 text-dugout-dark text-base font-medium"
            >
              Create Another
            </button>
          </>
        )}
      </div>
    </div>
  );
};
