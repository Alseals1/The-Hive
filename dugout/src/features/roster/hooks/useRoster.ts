import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { fetchRosterWithProfiles } from "../services/roster";
import type { RosterMember } from "../types";

/**
 * Hook to fetch and cache roster members for a team.
 *
 * Uses TanStack Query with:
 * - 5-minute stale time for background refresh
 * - 2x retry with exponential backoff
 * - Automatic error handling via RLS
 *
 * @param teamId - Team ID to fetch roster for
 * @returns Query result with roster data, loading state, error, and refetch
 *
 * @example
 * const { data, isLoading, error, refetch } = useRoster(teamId);
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} onRetry={refetch} />;
 * return <RosterList members={data} />;
 */
export function useRoster(
  teamId: string,
): UseQueryResult<RosterMember[], Error> {
  return useQuery({
    queryKey: ["roster", teamId],
    queryFn: () => fetchRosterWithProfiles(teamId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
