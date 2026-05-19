import type { FC } from 'react';
import type { RosterMember, RosterSection } from '../types';
import { ROLE_PRIORITY, ROLE_LABELS } from '../types';
import type { TeamRole } from '@/types';
import { RosterSectionHeader } from './RosterSectionHeader';
import { RosterGrid } from './RosterGrid';

interface RosterListProps {
  members: RosterMember[];
}

/**
 * Group members by role and sort within groups
 */
function groupAndSortMembers(members: RosterMember[]): RosterSection[] {
  // Create map of role -> members
  const grouped = new Map<TeamRole, RosterMember[]>();

  // Group members by role
  members.forEach((member) => {
    const roleMembers = grouped.get(member.role) || [];
    roleMembers.push(member);
    grouped.set(member.role, roleMembers);
  });

  // Sort each group alphabetically by name
  grouped.forEach((roleMembers) => {
    roleMembers.sort((a, b) => {
      const nameA = a.profile.full_name || '';
      const nameB = b.profile.full_name || '';
      return nameA.localeCompare(nameB);
    });
  });

  // Build sections in role priority order
  const sections: RosterSection[] = [];
  const roleOrder = Object.entries(ROLE_PRIORITY)
    .sort(([, a], [, b]) => a - b)
    .map(([role]) => role as TeamRole);

  roleOrder.forEach((role) => {
    const roleMembers = grouped.get(role) || [];
    if (roleMembers.length > 0) {
      sections.push({
        role,
        label: ROLE_LABELS[role] || role,
        members: roleMembers,
      });
    }
  });

  return sections;
}


export const RosterList: FC<RosterListProps> = ({ members }) => {
  const sections = groupAndSortMembers(members);

  return (
    <div className="pb-4">
      {sections.map((section) => (
        <div key={section.role}>
          <RosterSectionHeader role={section.role} count={section.members.length} />
          <RosterGrid members={section.members} />
        </div>
      ))}
    </div>
  );
};
