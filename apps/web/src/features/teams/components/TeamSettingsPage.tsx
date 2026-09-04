import { useEffect, useState } from "react";
import type { FC } from "react";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { z } from "zod";
import { PageShell, PageHeader } from "@/components/shared/PageShell";
import { TeamBottomNav } from "@/components/shared/BottomNav";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { FormError } from "@/components/shared/FormError";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useTeam, useUpdateTeam, useDeleteTeam, useLeaveTeam } from "../hooks/useSettings";

const teamNameSchema = z.string().trim().min(1, "Team name is required");

const inputCls = "w-full px-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-800 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const labelCls = "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

export const TeamSettingsPage: FC = () => {
  const { teamId } = useParams({ from: "/teams/$teamId/settings" });
  const { userRole } = useRouteContext({ from: "/teams/$teamId" });
  const { data: team, isLoading, error } = useTeam(teamId);
  const { mutate: update, isPending } = useUpdateTeam(teamId);
  const { mutate: doDeleteTeam, isPending: isDeleting } = useDeleteTeam(teamId);
  const { mutate: doLeaveTeam, isPending: isLeaving } = useLeaveTeam(teamId);

  const [name, setName] = useState("");
  const [season, setSeason] = useState("");
  const [sport, setSport] = useState("baseball");
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (team) {
      setName(team.name ?? "");
      setSeason(team.season ?? "");
      setSport(team.sport ?? "baseball");
    }
  }, [team]);

  const canEdit = userRole === "admin";
  const isAdmin = userRole === "admin";
  const isDangerous = isDeleting || isLeaving;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    const result = teamNameSchema.safeParse(name);
    if (!result.success) {
      setNameError(result.error.issues[0]?.message);
      return;
    }
    setNameError(undefined);

    update(
      {
        name: result.data,
        season: season.trim() || null,
        sport: sport.trim() || "baseball",
      },
      {
        onSuccess: () => toast.success("Saved."),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Couldn't save that. Give it another shot."),
      }
    );
  }

  return (
    <>
    <Helmet><title>{team ? `${team.name} Settings | Dugout` : "Settings | Dugout"}</title></Helmet>
    <PageShell
      header={<PageHeader title="Settings" backTo="/teams" />}
      footer={<TeamBottomNav teamId={teamId} />}
      withNav
    >
      <div className="px-4 py-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" label="Loading settings..." />
          </div>
        )}

        {error && !isLoading && (
          <ErrorMessage message={error instanceof Error ? error.message : "Couldn't load team settings."} />
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
                aria-required="true"
                aria-describedby={nameError ? "settings-name-error" : undefined}
                disabled={!canEdit}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(undefined);
                }}
                placeholder="Riverside Rockets"
                maxLength={60}
                className={inputCls}
              />
              <FormError id="settings-name-error" message={nameError} />
            </div>

            <div>
              <label htmlFor="settings-sport" className={labelCls}>Sport</label>
              <select
                id="settings-sport"
                disabled={!canEdit}
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className={inputCls}
              >
                <option value="baseball">Baseball</option>
                <option value="softball">Softball</option>
                <option value="basketball">Basketball</option>
                <option value="soccer">Soccer</option>
                <option value="football">Football</option>
                <option value="volleyball">Volleyball</option>
                <option value="other">Other</option>
              </select>
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
                maxLength={50}
                className={inputCls}
              />
            </div>

            {canEdit && (
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm disabled:opacity-40"
              >
                {isPending ? "Saving…" : "Save Changes"}
              </button>
            )}

            {/* Danger Zone */}
            <div className="mt-8 pt-8 border-t border-pitch-700">
              <h3 className="font-display text-sm font-600 uppercase tracking-wider text-red-400 mb-4">
                Danger Zone
              </h3>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(isAdmin ? "delete-team" : "leave-team")}
                className="w-full py-3 px-4 rounded-xl bg-red-600/10 border border-red-600 text-red-400 font-display font-600 uppercase tracking-wider text-sm hover:bg-red-600/20 transition-colors disabled:opacity-40"
                disabled={isDangerous}
              >
                {isAdmin ? "Delete Team" : "Leave Team"}
              </button>
            </div>
          </form>
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId === "delete-team") {
            doDeleteTeam();
          } else if (deleteConfirmId === "leave-team") {
            doLeaveTeam();
          }
        }}
        title={isAdmin ? "Delete Team?" : "Leave Team?"}
        description={
          isAdmin
            ? "This will permanently delete the team and remove all members. This cannot be undone."
            : "You will be removed from this team."
        }
        confirmLabel={isAdmin ? "Delete Team" : "Leave Team"}
        isPending={isDangerous}
      />
    </PageShell>
    </>
  );
};
