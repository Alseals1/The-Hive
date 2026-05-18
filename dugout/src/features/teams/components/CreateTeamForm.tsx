import { useState } from "react";
import type { FC } from "react";
import { useCreateTeam } from "../hooks/useTeams";

interface CreateTeamFormProps {
  onSuccess: (teamId: string) => void;
  onCancel: () => void;
}

export const CreateTeamForm: FC<CreateTeamFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [season, setSeason] = useState("");
  const { mutate, isPending, error } = useCreateTeam();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(
      { name: name.trim(), season: season.trim() || null },
      { onSuccess: (team) => onSuccess(team.id) },
    );
  }

  return (
    <div className="px-4 pt-2 pb-8">
      <h2 className="text-lg font-bold text-dugout-dark mb-6">Create a Team</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="team-name"
            className="block text-sm font-medium text-dugout-dark mb-1"
          >
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            id="team-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Riverside Rockets"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label
            htmlFor="team-season"
            className="block text-sm font-medium text-dugout-dark mb-1"
          >
            Season{" "}
            <span className="text-dugout-light text-xs font-normal">
              (optional)
            </span>
          </label>
          <input
            id="team-season"
            type="text"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="Spring 2026"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            {error.message}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-dugout-mid font-semibold text-base active:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="flex-1 py-3 rounded-xl bg-brand-500 text-white font-semibold text-base active:bg-brand-600 disabled:opacity-50"
          >
            {isPending ? "Creating…" : "Create Team"}
          </button>
        </div>
      </form>
    </div>
  );
};
