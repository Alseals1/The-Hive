import type { FC } from 'react';
import type { RosterMember } from '../types';
import { RosterMemberCard } from './RosterMemberCard';

interface RosterGridProps {
  members: RosterMember[];
  isAdmin?: boolean;
  onMemberOptions?: (member: RosterMember) => void;
}

/**
 * RosterGrid - Responsive grid layout for roster member cards
 * Mobile: 1 column (full width)
 * Tablet (md): 2 columns
 * Desktop (lg): 3 columns
 */
export const RosterGrid: FC<RosterGridProps> = ({ members, isAdmin, onMemberOptions }) => {
  return (
    <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {members.map((member) => (
        <RosterMemberCard
          key={member.id}
          member={member}
          isAdmin={isAdmin}
          onOptionsPress={onMemberOptions ? () => onMemberOptions(member) : undefined}
        />
      ))}
    </div>
  );
};
