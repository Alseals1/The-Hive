import type { FC } from 'react';
import { useParams } from '@tanstack/react-router';
import { PageShell, PageHeader } from '@/components/shared/PageShell';
import { TeamBottomNav } from '@/components/shared/BottomNav';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { EmptyState } from '@/components/shared/EmptyState';
import { useRoster } from '../hooks/useRoster';
import { RosterList } from './RosterList';

export const RosterPage: FC = () => {
  const { teamId } = useParams({ from: '/teams/$teamId/roster' });
  const { data: members, isLoading, error, refetch } = useRoster(teamId);

  return (
    <PageShell
      header={<PageHeader title="Roster" />}
      footer={<TeamBottomNav teamId={teamId} />}
      withNav
      className="px-4 py-6"
    >
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
          icon="👥"
          title="No members yet"
          description="Team members will appear here once they join"
        />
      )}

      {!isLoading && !error && members && members.length > 0 && (
        <RosterList members={members} />
      )}
    </PageShell>
  );
};
