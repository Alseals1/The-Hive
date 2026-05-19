import { useEffect, useState } from "react";
import type { FC } from "react";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/shared/PageShell";
import { TeamBottomNav } from "@/components/shared/BottomNav";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { useTeam, useUpdateTeam } from "../hooks/useSettings";

export const TeamSettingsPage: FC = () => {
  const { teamId } = useParams({ from: "/teams/$teamId/settings" });
  const { userRole } = useRouteContext({ from: "/teams/$teamId" });
  const { data: team, isLoading, error } = useTeam(teamId);
  const { mutate: update, isPending, error: updateError, isSuccess } = useUpdateTeam(teamId);

  const [name, setName] = useState("");
  const [season, setSeason] = useState("");
  const [sport, setSport] = useState("baseball");

  // Sync form when team data loads
  useEffect(() => {
    if (team) {
      setName(team.name ?? "");
      setSeason(team.season ?? "");
      setSport(team.sport ?? "baseball");
    }
  }, [team]);

  const canEdit = userRole === "admin";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    update({
      name: name.trim(),
      season: season.trim() || null,
      sport: sport.trim() || "baseball",
    });
  }

  return (
    <PageShell
      header={<PageHeader title="Team Settings" />}
      footer={<TeamBottomNav teamId={teamId} />}
      withNav
    >
      <div className="px-4 py-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && !isLoading && (
          <ErrorMessage message={error instanceof Error ? error.message : "Failed to load team"} />
        )}

        {!isLoading && !error && team && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Read-only notice for non-admins */}
            {!canEdit && (
              <div className="px-4 py-3 bg-stone-100 rounded-xl">
                <p className="text-sm text-dugout-mid">
                  Only team admins can edit settings.
                </p>
              </div>
            )}

            {/* Team Name */}
            <div>
              <label
                htmlFor="settings-name"
                className="block text-sm font-medium text-dugout-dark mb-1"
              >
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                id="settings-name"
                type="text"
                required
                disabled={!canEdit}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Riverside Rockets"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-stone-100 disabled:text-dugout-mid"
              />
            </div>

            {/* Sport */}
            <div>
              <label
                htmlFor="settings-sport"
                className="block text-sm font-medium text-dugout-dark mb-1"
              >
                Sport
              </label>
              <input
                id="settings-sport"
                type="text"
                disabled={!canEdit}
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                placeholder="Baseball"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-stone-100 disabled:text-dugout-mid"
              />
            </div>

            {/* Season */}
            <div>
              <label
                htmlFor="settings-season"
                className="block text-sm font-medium text-dugout-dark mb-1"
              >
                Season{" "}
                <span className="text-dugout-light text-xs font-normal">(optional)</span>
              </label>
              <input
                id="settings-season"
                type="text"
                disabled={!canEdit}
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="Spring 2026"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-stone-100 disabled:text-dugout-mid"
              />
            </div>

            {updateError && (
              <p className="text-sm text-red-500">
                {updateError instanceof Error ? updateError.message : "Failed to save."}
              </p>
            )}

            {isSuccess && (
              <p className="text-sm text-field-600 font-medium">
                ✓ Settings saved
              </p>
            )}

            {canEdit && (
              <button
                type="submit"
                disabled={isPending || !name.trim()}
                className="w-full py-3 rounded-xl bg-brand-500 text-white text-base font-semibold disabled:opacity-50"
              >
                {isPending ? "Saving…" : "Save Changes"}
              </button>
            )}
          </form>
        )}
      </div>
    </PageShell>
  );
};
