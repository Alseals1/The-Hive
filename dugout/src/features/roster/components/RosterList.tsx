import { useState } from 'react';
import type { FC } from 'react';
import { Plus } from 'lucide-react';
import type { RosterMember, RosterSection } from '../types';
import { ROLE_PRIORITY, ROLE_LABELS } from '../types';
import type { TeamRole } from '@/types';
import type { ExpectedMember } from '@/features/teams/services/expectedMembers';
import { useDeleteExpectedMember } from '@/features/teams/hooks/useExpectedMembers';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RosterSectionHeader } from './RosterSectionHeader';
import { RosterGrid } from './RosterGrid';
import { ExpectedMemberRow } from './ExpectedMemberRow';

interface RosterListProps {
  members: RosterMember[];
  teamId?: string;
  expectedMembers?: ExpectedMember[] | null;
  canInvite?: boolean;
  onAddExpected?: () => void;
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


export const RosterList: FC<RosterListProps> = ({
  members,
  teamId,
  expectedMembers,
  canInvite,
  onAddExpected,
}) => {
  const sections = groupAndSortMembers(members);
  const { mutate: deleteExpected, isPending: isDeleting } = useDeleteExpectedMember(
    teamId || members[0]?.team_id || ''
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  return (
    <div className="pb-4">
      {sections.map((section) => (
        <div key={section.role}>
          <RosterSectionHeader role={section.role} count={section.members.length} />
          <RosterGrid members={section.members} />
        </div>
      ))}

      {/* Pending section */}
      {canInvite && expectedMembers && expectedMembers.length > 0 && (
        <div>
          <RosterSectionHeader
            role="parent"
            label="Pending"
            count={expectedMembers.length}
          />
          <div className="space-y-2 mb-6">
            {expectedMembers.map((member) => (
              <ExpectedMemberRow
                key={member.id}
                member={member}
                onDelete={() => setDeleteConfirmId(member.id)}
                canDelete={canInvite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add expected member button */}
      {canInvite && onAddExpected && (
        <button
          onClick={onAddExpected}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-dashed border-pitch-600 text-pitch-300 hover:border-ember hover:text-ember transition-colors"
        >
          <Plus size={18} />
          <span className="text-sm font-display font-600 uppercase tracking-wide">
            Add Expected Member
          </span>
        </button>
      )}

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteExpected(deleteConfirmId, {
              onSuccess: () => setDeleteConfirmId(null),
            });
          }
        }}
        title="Remove Member?"
        description="This expected member will be removed from the roster."
        isPending={isDeleting}
      />
    </div>
  );
};
