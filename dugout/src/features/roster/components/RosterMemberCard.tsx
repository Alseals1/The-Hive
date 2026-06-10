import type { FC } from 'react';
import { memo } from 'react';
import { MoreVertical } from 'lucide-react';
import type { RosterMember } from '../types';
import { ROLE_COLORS, ROLE_LABELS } from '../types';

interface RosterMemberCardProps {
  member: RosterMember;
  onOptionsPress?: () => void;
  isAdmin?: boolean;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const RosterMemberCard: FC<RosterMemberCardProps> = memo(({ member, onOptionsPress, isAdmin }) => {
  const colors = ROLE_COLORS[member.role];
  const roleLabel = ROLE_LABELS[member.role];
  const initials = getInitials(member.profile.full_name);
  const hasAvatar = member.profile.avatar_url;

  return (
    <div className="bg-pitch-800 rounded-card border border-pitch-700 p-4 flex items-center gap-3">
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-700 text-sm bg-pitch-700"
        style={hasAvatar ? {
          backgroundImage: `url(${member.profile.avatar_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        {!hasAvatar && (
          <span className="text-pitch-300">{initials}</span>
        )}
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-base font-700 uppercase tracking-wide text-pitch-50 truncate leading-tight">
            {member.profile.full_name || 'Unknown'}
          </h3>
          <span className={`shrink-0 text-[11px] font-display font-600 uppercase tracking-wider px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
            {roleLabel}
          </span>
          {isAdmin && onOptionsPress && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOptionsPress(); }}
              className="p-1.5 -mr-1 text-pitch-400 active:bg-pitch-700 rounded-lg flex-shrink-0"
              aria-label="Member options"
            >
              <MoreVertical size={16} />
            </button>
          )}
        </div>
        {member.profile.email && (
          <p className="text-xs text-pitch-400 truncate mt-0.5">
            {member.profile.email}
          </p>
        )}
      </div>
    </div>
  );
});

RosterMemberCard.displayName = 'RosterMemberCard';
