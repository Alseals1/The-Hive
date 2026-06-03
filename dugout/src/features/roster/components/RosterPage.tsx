import type { FC } from 'react';
import { useState } from 'react';
import { useParams, useRouteContext } from '@tanstack/react-router';
import { UserPlus, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { PageShell, PageHeader } from '@/components/shared/PageShell';
import { TeamBottomNav } from '@/components/shared/BottomNav';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { EmptyState } from '@/components/shared/EmptyState';
import { InviteSheet } from '@/features/teams/components/InviteSheet';
import { AddExpectedMemberSheet } from '@/features/teams/components/AddExpectedMemberSheet';
import { useExpectedMembers } from '@/features/teams/hooks/useExpectedMembers';
import { useRoster } from '../hooks/useRoster';
import { RosterList } from './RosterList';

export const RosterPage: FC = () => {
  const { teamId } = useParams({ from: '/teams/$teamId/roster' });
  const { userRole } = useRouteContext({ from: '/teams/$teamId' });
  const { data: members, isLoading, error, refetch } = useRoster(teamId);
  const { data: expectedMembers } = useExpectedMembers(teamId);
  const [showInvite, setShowInvite] = useState(false);
  const [showAddExpected, setShowAddExpected] = useState(false);

  const canInvite = userRole === 'admin' || userRole === 'coach';

  return (
    <>
    <Helmet><title>Roster | Dugout</title></Helmet>
    <PageShell
      header={
        <PageHeader
          title="Roster"
          backTo="/teams"
          action={
            canInvite ? (
              <button
                onClick={() => setShowInvite(true)}
                className="p-2 rounded-lg text-pitch-300 active:bg-pitch-700"
                aria-label="Invite member"
              >
                <UserPlus size={22} />
              </button>
            ) : undefined
          }
        />
      }
      footer={<TeamBottomNav teamId={teamId} />}
      withNav
      className="px-4 py-4"
    >
      {showInvite && (
        <InviteSheet teamId={teamId} onClose={() => setShowInvite(false)} />
      )}

      {showAddExpected && (
        <AddExpectedMemberSheet
          teamId={teamId}
          onClose={() => setShowAddExpected(false)}
        />
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load roster'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !error && (!members || members.length === 0) && (
        <EmptyState
          icon={<Users size={24} />}
          title="No members yet"
          description="Team members will appear here once they join"
        />
      )}

      {!isLoading && !error && members && members.length > 0 && (
        <RosterList
          members={members}
          teamId={teamId}
          expectedMembers={expectedMembers}
          canInvite={canInvite}
          onAddExpected={() => setShowAddExpected(true)}
        />
      )}
    </PageShell>
    </>
  );
};
