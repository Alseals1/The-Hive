import { useState } from "react";
import type { FC } from "react";
import { Plus } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useSupplyItems,
  useAddSupplyItem,
  useDeleteSupplyItem,
  useClaimSupplyItem,
  useUnclaimSupplyItem,
} from "../hooks/useSupplyItems";
import { SupplyItemRow } from "./SupplyItemRow";

interface SupplySignupSectionProps {
  eventId: string;
  teamId: string;
  canManage: boolean;
}

const inputCls =
  "w-full px-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-700/40 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors";
const labelCls =
  "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

export const SupplySignupSection: FC<SupplySignupSectionProps> = ({
  eventId,
  teamId,
  canManage,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [claimError, setClaimError] = useState<string | null>(null);

  const { data: items, isLoading } = useSupplyItems(eventId);
  const { mutate: addItem, isPending: isAdding, error: addError } = useAddSupplyItem(eventId);
  const { mutate: deleteItem } = useDeleteSupplyItem(eventId);
  const { mutate: claim, isPending: isClaiming } = useClaimSupplyItem(eventId);
  const { mutate: unclaim, isPending: isUnclaiming } = useUnclaimSupplyItem(eventId);

  const isClaimPending = isClaiming || isUnclaiming;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    addItem(
      { event_id: eventId, team_id: teamId, label: newLabel.trim() },
      {
        onSuccess: () => {
          setNewLabel("");
          setShowAddForm(false);
        },
      }
    );
  }

  function handleClaim(itemId: string) {
    setClaimError(null);
    claim(itemId, {
      onError: (err) => {
        setClaimError(err instanceof Error ? err.message : "Failed to claim item.");
      },
    });
  }

  function handleUnclaim(itemId: string) {
    setClaimError(null);
    unclaim(itemId);
  }

  const claimedCount = (items ?? []).filter((i) => i.claimer_user_id !== null).length;
  const totalCount = (items ?? []).length;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-display font-600 uppercase tracking-widest text-pitch-400">
          Supplies
        </p>
        {canManage && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 text-xs font-display font-600 uppercase tracking-wider text-ember active:text-ember-600"
          >
            <Plus size={13} />
            Add
          </button>
        )}
      </div>

      {/* Inline add form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-3 space-y-3">
          <div>
            <label htmlFor="supply-label" className={labelCls}>
              Item <span className="text-ember">*</span>
            </label>
            <input
              id="supply-label"
              type="text"
              autoFocus
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Oranges, Water bottles…"
              maxLength={120}
              className={inputCls}
            />
          </div>

          {addError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {addError instanceof Error ? addError.message : "Something went wrong."}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowAddForm(false); setNewLabel(""); }}
              className="flex-1 py-3 rounded-xl border border-pitch-700 text-pitch-400 text-xs font-display font-600 uppercase tracking-wider active:bg-pitch-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !newLabel.trim()}
              className="flex-1 py-3 rounded-xl bg-ember text-white text-xs font-display font-700 uppercase tracking-wider disabled:opacity-40"
            >
              {isAdding ? "Adding…" : "Add Item"}
            </button>
          </div>
        </form>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-6">
          <LoadingSpinner size="sm" />
        </div>
      )}

      {/* Claim error banner */}
      {claimError && (
        <p className="mb-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {claimError}
        </p>
      )}

      {/* Empty state */}
      {!isLoading && totalCount === 0 && (
        <div className="py-6 text-center">
          <p className="text-sm text-pitch-400 font-body">No supplies added yet.</p>
          {canManage && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-3 text-xs font-display font-600 uppercase tracking-wider text-ember"
            >
              + Add first item
            </button>
          )}
        </div>
      )}

      {/* Items list */}
      {!isLoading && totalCount > 0 && (
        <>
          <div className="space-y-1">
            {(items ?? []).map((item) => (
              <SupplyItemRow
                key={item.id}
                item={item}
                canManage={canManage}
                onClaim={handleClaim}
                onUnclaim={handleUnclaim}
                onDelete={deleteItem}
                isClaimPending={isClaimPending}
              />
            ))}
          </div>

          <p className="mt-2 text-xs text-pitch-500 font-body">
            {claimedCount} of {totalCount} item{totalCount !== 1 ? "s" : ""} claimed
          </p>
        </>
      )}
    </div>
  );
};
