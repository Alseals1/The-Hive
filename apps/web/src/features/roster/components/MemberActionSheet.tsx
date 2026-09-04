import type { FC } from 'react';
import { Shield, UserMinus, X } from 'lucide-react';
import type { RosterMember } from '../types';
import { ROLE_COLORS, ROLE_LABELS } from '../types';

interface MemberActionSheetProps {
  member: RosterMember;
  currentUserId: string;
  adminCount: number;
  onChangeRole: () => void;
  onRemove: () => void;
  onClose: () => void;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const MemberActionSheet: FC<MemberActionSheetProps> = ({
  member, currentUserId, adminCount, onChangeRole, onRemove, onClose,
}) => {
  const colors = ROLE_COLORS[member.role];
  const roleLabel = ROLE_LABELS[member.role];
  const initials = getInitials(member.profile.full_name);
  const hasAvatar = member.profile.avatar_url;

  const isSelf = member.user_id === currentUserId;
  const isLastAdmin = member.role === 'admin' && adminCount === 1;
  const isDisabled = isSelf || isLastAdmin;

  const disabledReason = isSelf
    ? 'You cannot manage your own membership'
    : isLastAdmin
    ? 'Team must have at least one admin'
    : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-pitch-800 border-t border-pitch-700 rounded-t-2xl px-4 pt-4 pb-10 z-10">
        <div className="w-10 h-1 bg-pitch-600 rounded-full mx-auto mb-5" />

        {/* Member header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-pitch-700">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-700 text-sm bg-pitch-700"
            style={hasAvatar ? {
              backgroundImage: `url(${member.profile.avatar_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : undefined}
          >
            {!hasAvatar && <span className="text-pitch-300">{initials}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base font-700 uppercase tracking-wide text-pitch-50 truncate">
              {member.profile.full_name || 'Unknown'}
            </h3>
            <span className={`text-[11px] font-display font-600 uppercase tracking-wider px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
              {roleLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-pitch-400 active:bg-pitch-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={isDisabled ? undefined : onChangeRole}
            disabled={isDisabled}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-display font-600 uppercase tracking-wider text-sm ${
              isDisabled
                ? 'text-pitch-500 opacity-40 cursor-not-allowed'
                : 'text-pitch-100 active:bg-pitch-700/50'
            }`}
          >
            <Shield size={18} className="flex-shrink-0" />
            Change Role
          </button>

          <button
            type="button"
            onClick={isDisabled ? undefined : onRemove}
            disabled={isDisabled}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-display font-600 uppercase tracking-wider text-sm ${
              isDisabled
                ? 'text-red-900 opacity-40 cursor-not-allowed'
                : 'text-red-300 active:bg-red-500/10'
            }`}
          >
            <UserMinus size={18} className="flex-shrink-0" />
            Remove Member
          </button>
        </div>

        {disabledReason && (
          <p className="text-xs text-pitch-500 text-center mt-4 font-body">{disabledReason}</p>
        )}
      </div>
    </div>
  );
};
