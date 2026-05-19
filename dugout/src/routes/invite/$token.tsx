import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useInviteByToken, useAcceptInvite } from "@/features/teams/hooks/useInvites";
import { PageShell } from "@/components/shared/PageShell";
import { PageHeader } from "@/components/shared/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const Route = createFileRoute("/invite/$token")({
  component: InviteAcceptPage,
});

function InviteAcceptPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { data: invite, isLoading } = useInviteByToken(token);
  const { mutate: accept, isPending, error } = useAcceptInvite();

  const teamData = invite
    ? Array.isArray(invite.teams)
      ? invite.teams[0]
      : invite.teams
    : null;

  function handleAccept() {
    accept(token, {
      onSuccess: (teamId) => {
        navigate({ to: "/teams/$teamId/schedule", params: { teamId } });
      },
    });
  }

  return (
    <PageShell header={<PageHeader title="Join Team" />}>
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        {isLoading && <LoadingSpinner size="lg" />}

        {!isLoading && !invite && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-dugout-dark mb-2">
              Invite Invalid
            </h2>
            <p className="text-sm text-dugout-mid mb-8">
              This invite link has expired, already been used, or doesn't exist.
            </p>
            <button
              onClick={() => navigate({ to: "/auth/login" })}
              className="px-6 py-3 rounded-xl bg-brand-500 text-white text-base font-semibold w-full max-w-xs"
            >
              Go to Login
            </button>
          </>
        )}

        {!isLoading && invite && teamData && (
          <>
            <div className="text-5xl mb-4">⚾</div>
            <h2 className="text-xl font-bold text-dugout-dark mb-2">
              You're invited!
            </h2>
            <p className="text-dugout-mid text-sm mb-1">
              Join{" "}
              <span className="font-semibold text-dugout-dark">
                {teamData.name}
              </span>{" "}
              as a{" "}
              <span className="font-semibold text-brand-500">
                {invite.role}
              </span>
            </p>
            {teamData.season && (
              <p className="text-xs text-dugout-light mb-8">
                {teamData.season} season
              </p>
            )}
            {!teamData.season && <div className="mb-8" />}

            {error && (
              <p className="text-sm text-red-500 mb-4">
                {error instanceof Error
                  ? error.message
                  : "Something went wrong."}
              </p>
            )}

            <button
              onClick={handleAccept}
              disabled={isPending}
              className="px-6 py-3 rounded-xl bg-brand-500 text-white text-base font-semibold w-full max-w-xs disabled:opacity-50"
            >
              {isPending ? "Joining…" : "Join Team"}
            </button>
          </>
        )}
      </div>
    </PageShell>
  );
}
