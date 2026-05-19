import { useState } from "react";
import type { FC } from "react";
import { useCreateTeam } from "../hooks/useTeams";

interface CreateTeamFormProps {
  onSuccess: (teamId: string) => void;
  onCancel: () => void;
}

const inputCls = "w-full px-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-800 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors";
const labelCls = "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

export const CreateTeamForm: FC<CreateTeamFormProps> = ({ onSuccess, onCancel }) => {
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
    <div className="px-4 pt-4 pb-8">
      <h2 className="font-display text-2xl font-700 uppercase tracking-wide text-pitch-50 mb-6">
        Create a Team
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="team-name" className={labelCls}>
            Team Name <span className="text-ember">*</span>
          </label>
          <input
            id="team-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Riverside Rockets"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="team-season" className={labelCls}>
            Season{" "}
            <span className="text-pitch-500 text-[10px] normal-case tracking-normal font-body font-400">
              optional
            </span>
          </label>
          <input
            id="team-season"
            type="text"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="Spring 2026"
            className={inputCls}
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error.message}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl border border-pitch-600 text-pitch-300 font-display font-600 uppercase tracking-wider text-xs active:bg-pitch-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="flex-1 py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-xs active:bg-ember-600 disabled:opacity-40"
          >
            {isPending ? "Creating…" : "Create Team"}
          </button>
        </div>
      </form>
    </div>
  );
};
