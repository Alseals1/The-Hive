import { useEffect, useState } from "react";
import type { FC } from "react";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/shared/PageShell";
import { TeamBottomNav } from "@/components/shared/BottomNav";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { useTeam, useUpdateTeam } from "../hooks/useSettings";

const inputCls = "w-full px-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-800 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const labelCls = "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

export const TeamSettingsPage: FC = () => {
  const { teamId } = useParams({ from: "/teams/$teamId/settings" });
  const { userRole } = useRouteContext({ from: "/teams/$teamId" });
  const { data: team, isLoading, error } = useTeam(teamId);
  const { mutate: update, isPending, error: updateError, isSuccess } = useUpdateTeam(teamId);

  const [name, setName] = useState("");
  const [season, setSeason] = useState("");
  const [sport, setSport] = useState("baseball");

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
      header={<PageHeader title="Settings" />}
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
            {!canEdit && (
              <div className="px-4 py-3 bg-pitch-700 rounded-xl border border-pitch-600">
                <p className="text-sm text-pitch-300 font-body">
                  Only team admins can edit settings.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="settings-name" className={labelCls}>
                Team Name <span className="text-ember">*</span>
              </label>
              <input
                id="settings-name"
                type="text"
                required
                disabled={!canEdit}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Riverside Rockets"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="settings-sport" className={labelCls}>Sport</label>
              <input
                id="settings-sport"
                type="text"
                disabled={!canEdit}
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                placeholder="Baseball"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="settings-season" className={labelCls}>
                Season{" "}
                <span className="text-pitch-500 text-[10px] normal-case tracking-normal font-body font-400">optional</span>
              </label>
              <input
                id="settings-season"
                type="text"
                disabled={!canEdit}
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="Spring 2026"
                className={inputCls}
              />
            </div>

            {updateError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {updateError instanceof Error ? updateError.message : "Failed to save."}
              </p>
            )}

            {isSuccess && (
              <p className="text-sm text-field font-display font-600 uppercase tracking-wider">
                Saved
              </p>
            )}

            {canEdit && (
              <button
                type="submit"
                disabled={isPending || !name.trim()}
                className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm disabled:opacity-40"
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
