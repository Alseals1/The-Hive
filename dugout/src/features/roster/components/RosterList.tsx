import { useState } from 'react';
import type { FC } from 'react';
import { Plus } from 'lucide-react';
import type { RosterMember, RosterSection } from '../types';
import { ROLE_PRIORITY, ROLE_LABELS } from '../types';
import type { TeamRole } from '@/types';
import type { ExpectedMember } from '@/features/teams/services/expectedMembers';
import { useDeleteExpectedMember, useUpdateExpectedMember } from '@/features/teams/hooks/useExpectedMembers';
import { useUpdateMemberRole, useRemoveMember } from '../hooks/useRoster';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RosterSectionHeader } from './RosterSectionHeader';
import { RosterGrid } from './RosterGrid';
import { ExpectedMemberRow } from './ExpectedMemberRow';
import { MemberActionSheet } from './MemberActionSheet';
import { ChangeRoleSheet } from './ChangeRoleSheet';
import { MemberDetailSheet } from './MemberDetailSheet';

interface RosterListProps {
  members: RosterMember[];
  teamId?: string;
  expectedMembers?: ExpectedMember[] | null;
  canInvite?: boolean;
  onAddExpected?: () => void;
  isAdmin?: boolean;
  currentUserId?: string;
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
  isAdmin,
  currentUserId,
}) => {
  const sections = groupAndSortMembers(members);
  const resolvedTeamId = teamId || members[0]?.team_id || '';
  const { mutate: deleteExpected, isPending: isDeleting } = useDeleteExpectedMember(resolvedTeamId);
  const { mutate: updateExpected } = useUpdateExpectedMember(resolvedTeamId);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionMember, setActionMember] = useState<RosterMember | null>(null);
  const [changeRoleMember, setChangeRoleMember] = useState<RosterMember | null>(null);
  const [removeConfirmMember, setRemoveConfirmMember] = useState<RosterMember | null>(null);
  const [viewMember, setViewMember] = useState<RosterMember | null>(null);

  const { mutate: updateRole, isPending: isUpdatingRole, error: updateRoleError } =
    useUpdateMemberRole(resolvedTeamId);
  const { mutate: removeMember, isPending: isRemoving, error: removeError } =
    useRemoveMember(resolvedTeamId);

  const adminCount = members.filter(m => m.role === 'admin').length;

  return (
    <div className="pb-4">
      {sections.map((section) => (
        <div key={section.role}>
          <RosterSectionHeader role={section.role} count={section.members.length} />
          <RosterGrid
            members={section.members}
            isAdmin={isAdmin}
            onMemberOptions={isAdmin ? (member) => setActionMember(member) : undefined}
            onMemberView={(member) => setViewMember(member)}
          />
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
                onEdit={(id, name, note) => updateExpected({ id, updates: { name, note } })}
                canDelete={canInvite}
                isAdmin={isAdmin}
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

      {(updateRoleError || removeError) && (
        <p className="text-sm text-red-400 text-center mt-3 font-body px-4">
          {(updateRoleError ?? removeError)?.message ?? 'Something went wrong'}
        </p>
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

      {actionMember && currentUserId && (
        <MemberActionSheet
          member={actionMember}
          currentUserId={currentUserId}
          adminCount={adminCount}
          onChangeRole={() => {
            setChangeRoleMember(actionMember);
            setActionMember(null);
          }}
          onRemove={() => {
            setRemoveConfirmMember(actionMember);
            setActionMember(null);
          }}
          onClose={() => setActionMember(null)}
        />
      )}

      {changeRoleMember && (
        <ChangeRoleSheet
          member={changeRoleMember}
          isPending={isUpdatingRole}
          onConfirm={(newRole: TeamRole) => {
            updateRole(
              { memberId: changeRoleMember.id, role: newRole },
              { onSuccess: () => setChangeRoleMember(null) },
            );
          }}
          onClose={() => setChangeRoleMember(null)}
        />
      )}

      <ConfirmDialog
        open={removeConfirmMember !== null}
        onClose={() => setRemoveConfirmMember(null)}
        onConfirm={() => {
          if (removeConfirmMember) {
            removeMember(removeConfirmMember.id, {
              onSuccess: () => setRemoveConfirmMember(null),
            });
          }
        }}
        title="Remove Member?"
        description={`${removeConfirmMember?.profile.full_name ?? 'This member'} will be removed from the team.`}
        confirmLabel="Remove"
        isPending={isRemoving}
      />

      {viewMember && (
        <MemberDetailSheet
          member={viewMember}
          onClose={() => setViewMember(null)}
        />
      )}
    </div>
  );
};
