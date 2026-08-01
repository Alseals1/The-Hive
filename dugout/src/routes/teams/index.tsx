import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Plus, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useMyTeams, useCanCreateTeam } from "@/features/teams/hooks/useTeams";
import { TeamCard } from "@/features/teams/components/TeamCard";
import { CreateTeamForm } from "@/features/teams/components/CreateTeamForm";
import { PageShell, PageHeader } from "@/components/shared/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";

export const Route = createFileRoute("/teams/")({
  component: TeamsPage,
});

function TeamsPage() {
  const navigate = useNavigate();
  const { data: teams, isLoading, isError, refetch } = useMyTeams();
  const { data: canCreate = false } = useCanCreateTeam();
  const [showCreate, setShowCreate] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth/login" });
  }

  function handleTeamClick(teamId: string) {
    navigate({ to: "/teams/$teamId/schedule", params: { teamId } });
  }

  function handleCreateSuccess(teamId: string) {
    setShowCreate(false);
    toast.success("Your dugout is ready. Time to build your crew.");
    navigate({ to: "/teams/$teamId/schedule", params: { teamId } });
  }

  return (
    <>
    <Helmet><title>My Teams | Dugout</title></Helmet>
    <PageShell
      header={
        <PageHeader
          title="My Teams"
          action={
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate({ to: "/profile" })}
                className="p-2 text-pitch-400 active:text-pitch-200"
                aria-label="Profile"
              >
                <User size={18} strokeWidth={2} />
              </button>
              <button
                onClick={handleSignOut}
                className="text-xs font-display font-600 uppercase tracking-wider text-pitch-400 active:text-pitch-200 py-2 px-1"
              >
                Sign out
              </button>
            </div>
          }
        />
      }
    >
      {showCreate ? (
        <CreateTeamForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreate(false)}
        />
      ) : (
        <div className="px-4 py-4 space-y-3">
          {isLoading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {isError && (
            <ErrorMessage
              message="Couldn't load your teams."
              onRetry={refetch}
            />
          )}

          {!isLoading && !isError && teams?.length === 0 && (
            <EmptyState
              icon={<Plus size={24} />}
              title="No teams yet"
              description={
                canCreate
                  ? "Create your first team or ask your coach for an invite code."
                  : "Ask your coach for an invite code to join a team."
              }
              action={
                canCreate
                  ? { label: "Create a Team", onClick: () => setShowCreate(true) }
                  : undefined
              }
            />
          )}

          {teams && teams.length > 0 && (
            <>
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  id={team.id}
                  name={team.name}
                  sport={team.sport}
                  season={team.season}
                  role={team.role}
                  onClick={() => handleTeamClick(team.id)}
                />
              ))}
              {canCreate && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="w-full py-3.5 rounded-xl border border-dashed border-pitch-600 text-pitch-400 text-xs font-display font-600 uppercase tracking-wider active:bg-pitch-800 transition-colors"
                >
                  + Create another team
                </button>
              )}
            </>
          )}
        </div>
      )}
    </PageShell>
    </>
  );
}
