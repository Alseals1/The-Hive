import { useState } from "react";
import type { FC } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Ban } from "lucide-react";
import { useTeamInvites, useRevokeInvite } from "@/features/teams/hooks/useInvites";
import { useJoinCode, useDeleteJoinCode } from "@/features/teams/hooks/useJoinCode";
import { getInviteStatus } from "@/features/teams/services/invites";
import type { TeamRole } from "@/types";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const ROLE_LABELS: Record<TeamRole, string> = {
  admin: "Admin",
  coach: "Coach",
  manager: "Manager",
  player: "Player",
  parent: "Parent",
};

const STATUS_STYLES = {
  active: "bg-green-500/15 text-green-400 border-green-500/25",
  used: "bg-pitch-600/40 text-pitch-400 border-pitch-600/40",
  expired: "bg-red-500/15 text-red-400 border-red-500/25",
} as const;

function StatusBadge({ status }: { status: "active" | "used" | "expired" }) {
  return (
    <span className={`text-[10px] font-display font-600 uppercase tracking-widest px-2 py-0.5 rounded-md border ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-pitch-400 hover:text-pitch-100 hover:bg-pitch-600/50 rounded-lg transition-colors"
      aria-label="Copy link"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
}

interface InviteManagementPanelProps {
  teamId: string;
}

export const InviteManagementPanel: FC<InviteManagementPanelProps> = ({ teamId }) => {
  const [open, setOpen] = useState(false);
  const [revokeInviteId, setRevokeInviteId] = useState<string | null>(null);
  const [confirmRevokeCode, setConfirmRevokeCode] = useState(false);

  const { data: invites, isLoading: invitesLoading } = useTeamInvites(teamId);
  const { data: joinCode, isLoading: codeLoading } = useJoinCode(teamId);
  const { mutate: revokeInvite, isPending: revoking } = useRevokeInvite(teamId);
  const { mutate: deleteCode, isPending: deletingCode } = useDeleteJoinCode(teamId);

  const activeInviteCount =
    (joinCode ? 1 : 0) +
    (invites?.filter((i) => getInviteStatus(i) === "active").length ?? 0);

  return (
    <div className="mt-6 border-t border-pitch-700 pt-4">
      {/* Collapsible header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-display font-600 uppercase tracking-widest text-pitch-300">
            Invites
          </span>
          {activeInviteCount > 0 && (
            <span className="text-[10px] font-display font-600 bg-ember/20 text-ember px-1.5 py-0.5 rounded-md">
              {activeInviteCount} active
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp size={16} className="text-pitch-500" />
        ) : (
          <ChevronDown size={16} className="text-pitch-500" />
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-5">
          {/* ── Join Code ─────────────────────────────────────────────── */}
          <div>
            <p className="text-[11px] font-display font-600 uppercase tracking-widest text-pitch-500 mb-2">
              Join Code
            </p>
            {codeLoading ? (
              <p className="text-xs text-pitch-500">Loading…</p>
            ) : joinCode ? (
              <div className="flex items-center justify-between px-3 py-2.5 bg-pitch-700/40 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-display text-sm font-700 uppercase tracking-wider text-ember">
                    {joinCode}
                  </span>
                  <span className="text-[11px] text-pitch-500 font-display font-600 uppercase tracking-widest">
                    · All roles
                  </span>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <StatusBadge status="active" />
                  <CopyButton url={`${window.location.origin}/join/${joinCode}`} />
                  <button
                    onClick={() => setConfirmRevokeCode(true)}
                    className="p-1.5 text-pitch-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    aria-label="Remove join code"
                  >
                    <Ban size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-pitch-500 py-1">No join code active.</p>
            )}
          </div>

          {/* ── Role Invites ──────────────────────────────────────────── */}
          <div>
            <p className="text-[11px] font-display font-600 uppercase tracking-widest text-pitch-500 mb-2">
              Role Invites
            </p>
            {invitesLoading ? (
              <p className="text-xs text-pitch-500">Loading…</p>
            ) : !invites || invites.length === 0 ? (
              <p className="text-xs text-pitch-500 py-1">No role invites yet.</p>
            ) : (
              <div className="space-y-2">
                {invites.map((invite) => {
                  const status = getInviteStatus(invite);
                  const inviteUrl = `${window.location.origin}/invite/${invite.token}`;
                  const createdDate = new Date(invite.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between px-3 py-2.5 bg-pitch-700/40 rounded-lg"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-display font-600 uppercase tracking-wide text-pitch-100">
                          {ROLE_LABELS[invite.role]}
                        </span>
                        <span className="text-xs text-pitch-500">{createdDate}</span>
                      </div>
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        <StatusBadge status={status} />
                        {status === "active" && (
                          <>
                            <CopyButton url={inviteUrl} />
                            <button
                              onClick={() => setRevokeInviteId(invite.id)}
                              className="p-1.5 text-pitch-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              aria-label="Revoke invite"
                            >
                              <Ban size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm revoke role invite */}
      <ConfirmDialog
        open={revokeInviteId !== null}
        onClose={() => setRevokeInviteId(null)}
        onConfirm={() => {
          if (revokeInviteId) {
            revokeInvite(revokeInviteId, { onSuccess: () => setRevokeInviteId(null) });
          }
        }}
        title="Revoke Invite?"
        description="This invite link will stop working immediately."
        confirmLabel="Revoke"
        isPending={revoking}
      />

      {/* Confirm remove join code */}
      <ConfirmDialog
        open={confirmRevokeCode}
        onClose={() => setConfirmRevokeCode(false)}
        onConfirm={() => {
          deleteCode(undefined, { onSuccess: () => setConfirmRevokeCode(false) });
        }}
        title="Remove Join Code?"
        description="Anyone with the current join link will no longer be able to join."
        confirmLabel="Remove"
        isPending={deletingCode}
      />
    </div>
  );
};
