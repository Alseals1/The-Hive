import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { XCircle, LogIn, UserPlus, CheckCircle, Trophy } from "lucide-react";
import { Helmet } from "react-helmet-async";
import {
  useTeamByJoinCode,
  useJoinTeamByCode,
} from "@/features/teams/hooks/useJoinCode";
import { AlreadyMemberError } from "@/features/teams/services/joinCode";
import type { TeamRole } from "@/types";
import { useUser } from "@/hooks/useAuth";
import { PageShell, PageHeader } from "@/components/shared/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const Route = createFileRoute("/join/$code")({
  component: JoinTeamPage,
});

const ROLE_LABELS: Record<TeamRole, string> = {
  admin: "Admin",
  coach: "Coach",
  manager: "Manager",
  player: "Player",
  parent: "Parent",
};

function JoinTeamPage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useUser();
  const { data: teamPreview, isLoading: teamLoading } = useTeamByJoinCode(code);
  const { mutate: join, isPending, isSuccess, data: joinedTeamId, error } = useJoinTeamByCode();

  const isLoading = authLoading || teamLoading;
  const isAlreadyMember = error instanceof AlreadyMemberError;

  // Auto-redirect when the user is already on the team
  useEffect(() => {
    if (isAlreadyMember && teamPreview) {
      const t = setTimeout(() => {
        navigate({ to: "/teams/$teamId/roster", params: { teamId: teamPreview.teamId } });
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [isAlreadyMember, teamPreview, navigate]);

  function storeAndGo(to: "/auth/signup" | "/auth/login") {
    sessionStorage.setItem("join_code", code);
    navigate({ to });
  }

  function handleJoin() {
    join(code);
  }

  // ── Success screen ───────────────────────────────────────────────────────────
  if (isSuccess && joinedTeamId && teamPreview) {
    return (
      <>
        <Helmet><title>Welcome to the Team | Dugout</title></Helmet>
        <PageShell header={<PageHeader title="You're In!" />}>
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-6">
              <Trophy size={36} className="text-green-400" />
            </div>

            {/* Headline */}
            <h2 className="font-display text-3xl font-800 uppercase tracking-wide text-pitch-50 mb-1">
              Welcome to the Team
            </h2>

            {/* Team name */}
            <p className="font-display text-xl font-700 uppercase tracking-wide text-ember mb-3">
              {teamPreview.name}
            </p>

            {/* Role badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-pitch-700 border border-pitch-600 text-xs font-display font-600 uppercase tracking-wider text-pitch-200 mb-10">
              {ROLE_LABELS[teamPreview.joinRole]}
            </span>

            {/* CTA */}
            <button
              onClick={() => navigate({ to: "/teams/$teamId/schedule", params: { teamId: joinedTeamId } })}
              className="px-6 py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm w-full max-w-xs"
            >
              Go to Team
            </button>
          </div>
        </PageShell>
      </>
    );
  }

  // ── Default / join flow ──────────────────────────────────────────────────────
  return (
    <>
    <Helmet><title>Join Team | Dugout</title></Helmet>
    <PageShell header={<PageHeader title="Join Team" />}>
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        {isLoading && <LoadingSpinner size="lg" />}

        {!isLoading && !teamPreview && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-pitch-700 flex items-center justify-center mb-5">
              <XCircle size={28} className="text-red-400" />
            </div>
            <h2 className="font-display text-2xl font-700 uppercase tracking-wide text-pitch-50 mb-2">
              Code Invalid
            </h2>
            <p className="text-sm text-pitch-300 mb-8 max-w-xs leading-relaxed">
              This join code doesn't exist or is no longer valid.
            </p>
            <button
              onClick={() => navigate({ to: "/auth/login" })}
              className="px-6 py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm w-full max-w-xs"
            >
              Go to Login
            </button>
          </>
        )}

        {!isLoading && teamPreview && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-ember-muted border border-ember/20 flex items-center justify-center mb-5">
              <span className="font-display text-3xl font-800 text-ember">D</span>
            </div>
            <h2 className="font-display text-2xl font-700 uppercase tracking-wide text-pitch-50 mb-2">
              Join the Team
            </h2>
            <p className="text-pitch-300 text-sm mb-1">
              <span className="font-display font-700 uppercase text-pitch-50">
                {teamPreview.name}
              </span>
            </p>
            <p className="text-sm text-pitch-400 mb-1">
              {teamPreview.sport}
              {teamPreview.season ? ` • ${teamPreview.season} season` : ""}
            </p>
            <div className="mb-8" />

            {/* Not authenticated — show signup / login options */}
            {!user && (
              <div className="w-full max-w-xs space-y-3">
                <button
                  onClick={() => storeAndGo("/auth/signup")}
                  className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} />
                  Create Account & Join
                </button>
                <button
                  onClick={() => storeAndGo("/auth/login")}
                  className="w-full py-3.5 rounded-xl border border-pitch-600 text-pitch-200 font-display font-600 uppercase tracking-wider text-sm flex items-center justify-center gap-2 active:bg-pitch-800"
                >
                  <LogIn size={16} />
                  Sign In & Join
                </button>
              </div>
            )}

            {/* Authenticated — show join button or already-member state */}
            {user && (
              <>
                {isAlreadyMember ? (
                  <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                    <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 w-full">
                      <CheckCircle size={16} className="shrink-0" />
                      You are already on this team
                    </div>
                    <p className="text-xs text-pitch-400">Redirecting you to the roster…</p>
                  </div>
                ) : (
                  <>
                    {error && (
                      <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 w-full max-w-xs">
                        {error instanceof Error ? error.message : "Something went wrong."}
                      </p>
                    )}
                    <button
                      onClick={handleJoin}
                      disabled={isPending}
                      className="px-6 py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm w-full max-w-xs disabled:opacity-40"
                    >
                      {isPending ? "Joining…" : "Join Team"}
                    </button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </PageShell>
    </>
  );
}
