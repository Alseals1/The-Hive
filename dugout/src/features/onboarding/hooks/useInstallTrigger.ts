import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyTeams } from "@/features/teams/services/teams";
import { useUser } from "@/hooks/useAuth";
import type { UsePwaResult } from "@/hooks/usePwa";

const SESSION_COUNT_KEY = "dugout:session_count";
const SESSION_TRACKED_KEY = "dugout:session_tracked"; // sessionStorage — resets per tab

const TIME_IN_APP_MS = 60_000; // 60 seconds
const MIN_SESSIONS = 2;

function incrementSessionCount(): number {
  // Only count once per browser tab open
  if (sessionStorage.getItem(SESSION_TRACKED_KEY)) {
    return Number(localStorage.getItem(SESSION_COUNT_KEY) ?? "0");
  }
  sessionStorage.setItem(SESSION_TRACKED_KEY, "1");
  const count = Number(localStorage.getItem(SESSION_COUNT_KEY) ?? "0") + 1;
  localStorage.setItem(SESSION_COUNT_KEY, String(count));
  return count;
}

export function useInstallTrigger(pwa: UsePwaResult): boolean {
  const { user } = useUser();
  const [timeReady, setTimeReady] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const { data: teams } = useQuery({
    queryKey: ["my-teams"],
    queryFn: getMyTeams,
    enabled: !!user,
    staleTime: 60_000,
  });

  const hasTeam = (teams?.length ?? 0) > 0;

  // Track session count on mount
  useEffect(() => {
    if (!user) return;
    const count = incrementSessionCount();
    if (count >= MIN_SESSIONS) setSessionReady(true);
  }, [user]);

  // Start 60-second in-app timer
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => setTimeReady(true), TIME_IN_APP_MS);
    return () => clearTimeout(timer);
  }, [user]);

  const engagementReady = timeReady || sessionReady;

  return (
    !!user &&
    hasTeam &&
    engagementReady &&
    !pwa.isInstalled &&
    pwa.installStatus !== "dismissed" &&
    pwa.installStatus !== "installed"
  );
}
