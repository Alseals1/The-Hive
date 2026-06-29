import { useState } from "react";
import type { FC } from "react";
import { X, Copy, Check, Link, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCreateInvite } from "@/features/teams/hooks/useInvites";
import {
  useJoinCode,
  useGenerateJoinCode,
} from "@/features/teams/hooks/useJoinCode";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { TeamRole } from "@/types";

function formatExpiryDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

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

type TabType = "join-code" | "role-invite";

export const InviteSheet: FC<InviteSheetProps> = ({ teamId, onClose }) => {
  const [tab, setTab] = useState<TabType>("join-code");
  const [role, setRole] = useState<TeamRole>("parent");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Join code hooks
  const { data: joinCode, isLoading: codeLoading } = useJoinCode(teamId);
  const { mutate: generateCode, isPending: codeGenerating } =
    useGenerateJoinCode(teamId);

  // Role invite hooks
  const { mutate: createInvite, isPending: inviteCreating, error } =
    useCreateInvite(teamId);

  const joinCodeUrl = joinCode
    ? `${window.location.origin}/join/${joinCode}`
    : null;

  function handleGenerateJoinCode() {
    generateCode();
    setResetConfirm(false);
  }

  function handleGenerateRoleInvite() {
    createInvite(role, {
      onSuccess: ({ token, expires_at }) => {
        const url = `${window.location.origin}/invite/${token}`;
        setInviteUrl(url);
        setInviteExpiresAt(expires_at);
      },
    });
  }

  async function handleCopy() {
    const urlToCopy = joinCodeUrl || inviteUrl;
    if (!urlToCopy) return;
    await navigator.clipboard.writeText(urlToCopy);
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

        {/* Tab selector */}
        <div className="flex gap-2 mb-6 border-b border-pitch-700">
          <button
            onClick={() => setTab("join-code")}
            className={`flex-1 pb-3 text-xs font-display font-600 uppercase tracking-widest transition-colors ${
              tab === "join-code"
                ? "text-ember border-b-2 border-ember"
                : "text-pitch-400"
            }`}
          >
            Join Code
          </button>
          <button
            onClick={() => setTab("role-invite")}
            className={`flex-1 pb-3 text-xs font-display font-600 uppercase tracking-widest transition-colors ${
              tab === "role-invite"
                ? "text-ember border-b-2 border-ember"
                : "text-pitch-400"
            }`}
          >
            Role Invite
          </button>
        </div>

        {/* Join Code Tab */}
        {tab === "join-code" && (
          <>
            {codeLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin">
                  <RefreshCw size={20} className="text-ember" />
                </div>
              </div>
            ) : joinCode ? (
              <>
                <p className="text-xs font-display font-600 uppercase tracking-widest text-pitch-400 mb-3">
                  Share this code or QR
                </p>

                {/* QR Code */}
                <div className="flex justify-center mb-6 p-4 bg-pitch-700/40 rounded-xl">
                  <QRCodeSVG
                    value={joinCodeUrl || ""}
                    size={160}
                    level="H"
                    includeMargin={false}
                    bgColor="#1a1f2e"
                    fgColor="#f5f5f5"
                  />
                </div>

                {/* Join Code Display */}
                <div className="mb-6">
                  <p className="text-[11px] text-pitch-500 uppercase font-display font-600 tracking-wider mb-2">
                    Team Code
                  </p>
                  <div className="text-center">
                    <p className="font-display text-4xl font-800 uppercase tracking-wide text-ember mb-2">
                      {joinCode}
                    </p>
                    <p className="text-xs text-pitch-400">
                      Anyone can use this code to join
                    </p>
                  </div>
                </div>

                {/* Copy URL Button */}
                <button
                  onClick={handleCopy}
                  className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm flex items-center justify-center gap-2 mb-3"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>

                {/* Reset Code Button */}
                <button
                  onClick={() => setResetConfirm(true)}
                  className="w-full py-3.5 rounded-xl border border-pitch-600 text-pitch-300 font-display font-600 uppercase tracking-wider text-xs flex items-center justify-center gap-2 active:bg-pitch-800"
                >
                  <RefreshCw size={14} />
                  Reset Code
                </button>

                <ConfirmDialog
                  open={resetConfirm}
                  onClose={() => setResetConfirm(false)}
                  onConfirm={() => {
                    handleGenerateJoinCode();
                    setResetConfirm(false);
                  }}
                  title="Reset Join Code?"
                  description="This will invalidate all existing links. Anyone who has the current link will no longer be able to use it."
                  confirmLabel="Reset Code"
                  isPending={codeGenerating}
                />
              </>
            ) : (
              <>
                <p className="text-xs text-pitch-400 mb-6">
                  Generate a permanent code that parents can use to join your team.
                </p>
                <button
                  onClick={handleGenerateJoinCode}
                  disabled={codeGenerating}
                  className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Link size={16} />
                  {codeGenerating ? "Generating…" : "Generate Code"}
                </button>
              </>
            )}
          </>
        )}

        {/* Role Invite Tab */}
        {tab === "role-invite" && (
          <>
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
                        <p
                          className={`text-sm font-display font-600 uppercase tracking-wide ${
                            role === option.value
                              ? "text-ember"
                              : "text-pitch-100"
                          }`}
                        >
                          {option.label}
                        </p>
                        <p className="text-xs text-pitch-400">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-red-400 mb-4">
                    {error instanceof Error
                      ? error.message
                      : "Failed to create invite."}
                  </p>
                )}

                <button
                  onClick={handleGenerateRoleInvite}
                  disabled={inviteCreating}
                  className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Link size={16} />
                  {inviteCreating ? "Generating…" : "Generate Invite Link"}
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
                  <p className="text-sm text-pitch-300 flex-1 truncate font-body">
                    {inviteUrl}
                  </p>
                </div>
                <p className="text-xs text-pitch-500 mb-6 font-body">
                  {inviteExpiresAt
                    ? `Expires ${formatExpiryDate(inviteExpiresAt)} · Anyone with this link can join`
                    : 'Anyone with this link can join'}
                </p>

                <button
                  onClick={handleCopy}
                  className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>

                <button
                  onClick={() => { setInviteUrl(null); setInviteExpiresAt(null); }}
                  className="w-full py-3.5 mt-3 rounded-xl border border-pitch-600 text-pitch-300 font-display font-600 uppercase tracking-wider text-xs"
                >
                  Create Another
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
