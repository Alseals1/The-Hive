import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { joinTeamByCode, getTeamByJoinCode, AlreadyMemberError } from "@/features/teams/services/joinCode";
import { acceptInvite } from "@/features/teams/services/invites";
import type { TeamRole } from "@/types";

/**
 * Runs once at the root layout level.
 * On SIGNED_IN, checks sessionStorage for a pending join_code or invite_token,
 * calls the appropriate service, and redirects to the team schedule page.
 * Keys are cleared immediately to prevent double-execution on token refresh.
 */
export function usePendingJoin() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event !== "SIGNED_IN") return;

        const joinCode = sessionStorage.getItem("join_code");
        const joinRole = sessionStorage.getItem("join_role") as TeamRole | null;
        const inviteToken = sessionStorage.getItem("invite_token");

        if (!joinCode && !inviteToken) return;

        // Clear before the async call so a token refresh can't re-trigger this
        sessionStorage.removeItem("join_code");
        sessionStorage.removeItem("join_role");
        sessionStorage.removeItem("invite_token");
        sessionStorage.removeItem("invite_role");

        const pending = inviteToken
          ? acceptInvite(inviteToken)
          : joinTeamByCode(joinCode!, joinRole ?? undefined);

        pending
          .then((teamId) => {
            navigate({ to: "/teams/$teamId/schedule", params: { teamId } });
          })
          .catch(async (err) => {
            if (err instanceof AlreadyMemberError && joinCode) {
              const team = await getTeamByJoinCode(joinCode);
              if (team) {
                navigate({ to: "/teams/$teamId/roster", params: { teamId: team.teamId } });
              }
              return;
            }
            // Other failures (invalid code, expired invite, etc.) — no action needed.
          });
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);
}
