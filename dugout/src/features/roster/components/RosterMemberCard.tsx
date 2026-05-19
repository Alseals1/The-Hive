import type { FC } from 'react';
import { memo } from 'react';
import type { RosterMember } from '../types';
import { ROLE_COLORS, ROLE_LABELS } from '../types';

interface RosterMemberCardProps {
  member: RosterMember;
}

/**
 * Get initials from a name
 * @param name Full name
 * @returns Two letter initials
 */
function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * RosterMemberCard - Displays individual team member with avatar, name, role badge, and email
 * Memoized to prevent unnecessary re-renders
 */
export const RosterMemberCard: FC<RosterMemberCardProps> = memo(({ member }) => {
  const colors = ROLE_COLORS[member.role];
  const roleLabel = ROLE_LABELS[member.role];
  const initials = getInitials(member.profile.full_name);
  const hasAvatar = member.profile.avatar_url;

  return (
    <div className="bg-white rounded-card border border-stone-200 p-4 flex items-start gap-3 min-h-[56px]">
      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
        style={{
          backgroundImage: hasAvatar ? `url(${member.profile.avatar_url})` : undefined,
          backgroundColor: hasAvatar ? undefined : '#e7e5e4',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!hasAvatar && <span className="text-dugout-dark">{initials}</span>}
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-dugout-dark truncate">
              {member.profile.full_name || 'Unknown'}
            </h3>
            {member.profile.email && (
              <p className="text-xs text-dugout-mid truncate mt-0.5">
                {member.profile.email}
              </p>
            )}
          </div>
          {/* Role Badge */}
          <span
            className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${colors.bg} ${colors.text}`}
          >
            {roleLabel}
          </span>
        </div>
      </div>
    </div>
  );
});

RosterMemberCard.displayName = 'RosterMemberCard';
