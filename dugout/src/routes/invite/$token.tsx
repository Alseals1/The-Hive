import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { XCircle, LogIn, UserPlus } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useInviteByToken, useAcceptInvite } from "@/features/teams/hooks/useInvites";
import { useUser } from "@/hooks/useAuth";
import { PageShell, PageHeader } from "@/components/shared/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const Route = createFileRoute("/invite/$token")({
  component: InviteAcceptPage,
});


function InviteAcceptPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useUser();
  const { data: invite, isLoading: inviteLoading } = useInviteByToken(token);
  const { mutate: accept, isPending, error } = useAcceptInvite();

  const isLoading = authLoading || inviteLoading;

  const teamData = invite
    ? Array.isArray(invite.teams)
      ? invite.teams[0]
      : invite.teams
    : null;

  function storeAndGo(to: "/auth/signup" | "/auth/login") {
    sessionStorage.setItem("invite_token", token);
    if (invite?.role) {
      sessionStorage.setItem("invite_role", invite.role);
    }
    navigate({ to });
  }

  function handleAccept() {
    accept(token, {
      onSuccess: (teamId) => {
        navigate({ to: "/teams/$teamId/schedule", params: { teamId } });
      },
    });
  }

  return (
    <>
    <Helmet><title>Join Team | Dugout</title></Helmet>
    <PageShell header={<PageHeader title="Join Team" />}>
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        {isLoading && <LoadingSpinner size="lg" />}

        {!isLoading && !invite && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-pitch-700 flex items-center justify-center mb-5">
              <XCircle size={28} className="text-red-400" />
            </div>
            <h2 className="font-display text-2xl font-700 uppercase tracking-wide text-pitch-50 mb-2">
              Invite Invalid
            </h2>
            <p className="text-sm text-pitch-300 mb-8 max-w-xs leading-relaxed">
              This invite link has expired, already been used, or doesn't exist.
            </p>
            <button
              onClick={() => navigate({ to: "/auth/login" })}
              className="px-6 py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm w-full max-w-xs"
            >
              Go to Login
            </button>
          </>
        )}

        {!isLoading && invite && teamData && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-ember-muted border border-ember/20 flex items-center justify-center mb-5">
              <span className="font-display text-3xl font-800 text-ember">D</span>
            </div>
            <h2 className="font-display text-2xl font-700 uppercase tracking-wide text-pitch-50 mb-2">
              You're invited
            </h2>
            <p className="text-pitch-300 text-sm mb-1">
              Join{" "}
              <span className="font-display font-700 uppercase text-pitch-50">
                {teamData.name}
              </span>
            </p>
            <p className="text-sm text-pitch-400 mb-1">
              as a{" "}
              <span className="text-ember font-display font-600 uppercase tracking-wide">
                {invite.role}
              </span>
            </p>
            {teamData.season && (
              <p className="text-xs text-pitch-500 mb-8">{teamData.season} season</p>
            )}
            {!teamData.season && <div className="mb-8" />}

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

            {/* Authenticated — show join button */}
            {user && (
              <>
                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 w-full max-w-xs">
                    {error instanceof Error ? error.message : "Something went wrong."}
                  </p>
                )}
                <button
                  onClick={handleAccept}
                  disabled={isPending}
                  className="px-6 py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm w-full max-w-xs disabled:opacity-40"
                >
                  {isPending ? "Joining…" : "Join Team"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </PageShell>
    </>
  );
}
