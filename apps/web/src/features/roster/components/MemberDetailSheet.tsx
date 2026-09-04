import type { FC } from 'react';
import { Calendar, Mail, X } from 'lucide-react';
import type { RosterMember } from '../types';
import { ROLE_COLORS, ROLE_LABELS } from '../types';
import { useScrollTrap } from '@/hooks/useScrollTrap';

interface MemberDetailSheetProps {
  member: RosterMember;
  onClose: () => void;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatJoinedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const MemberDetailSheet: FC<MemberDetailSheetProps> = ({ member, onClose }) => {
  useScrollTrap();
  const colors = ROLE_COLORS[member.role];
  const roleLabel = ROLE_LABELS[member.role];
  const initials = getInitials(member.profile.full_name);
  const hasAvatar = member.profile.avatar_url;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-pitch-800 border-t border-pitch-700 rounded-t-2xl px-4 pt-4 pb-10 z-10 max-h-[85vh] overflow-y-auto" data-scroll-trap-allowed>
        <div className="w-10 h-1 bg-pitch-600 rounded-full mx-auto mb-5" />

        {/* Member header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-pitch-700">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-700 text-base bg-pitch-700"
            style={hasAvatar ? {
              backgroundImage: `url(${member.profile.avatar_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : undefined}
          >
            {!hasAvatar && <span className="text-pitch-300">{initials}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-700 uppercase tracking-wide text-pitch-50 truncate">
              {member.profile.full_name || 'Unknown'}
            </h3>
            <span className={`inline-block mt-1 text-[11px] font-display font-600 uppercase tracking-wider px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
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

        {/* Details */}
        <div className="space-y-4">
          {member.profile.email && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-pitch-700/60 flex items-center justify-center flex-shrink-0">
                <Mail size={16} className="text-pitch-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-display font-600 uppercase tracking-wider text-pitch-500">
                  Email
                </p>
                <p className="text-sm text-pitch-100 font-body truncate">
                  {member.profile.email}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-pitch-700/60 flex items-center justify-center flex-shrink-0">
              <Calendar size={16} className="text-pitch-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-display font-600 uppercase tracking-wider text-pitch-500">
                Member Since
              </p>
              <p className="text-sm text-pitch-100 font-body">
                {formatJoinedDate(member.joined_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
