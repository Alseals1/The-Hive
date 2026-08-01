import { useState } from "react";
import type { FC } from "react";
import { Trash2, X } from "lucide-react";
import type { SupplyItem } from "../types/supplyItems";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface SupplyItemRowProps {
  item: SupplyItem;
  canManage: boolean;
  onClaim: (itemId: string) => void;
  onUnclaim: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  isClaimPending: boolean;
}

export const SupplyItemRow: FC<SupplyItemRowProps> = ({
  item,
  canManage,
  onClaim,
  onUnclaim,
  onDelete,
  isClaimPending,
}) => {
  const isClaimed = item.claimer_user_id !== null;
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-pitch-700/50 border border-pitch-700">
        {/* Label */}
        <p
          className={[
            "flex-1 text-sm font-display font-600 uppercase tracking-wide min-w-0 truncate",
            isClaimed && !item.claimed_by_me ? "line-through opacity-40 text-pitch-400" : "text-pitch-100",
          ].join(" ")}
        >
          {item.label}
        </p>

        {/* Claim state */}
        {!isClaimed && (
          <button
            onClick={() => onClaim(item.id)}
            disabled={isClaimPending}
            className="flex-shrink-0 border border-dashed border-pitch-600 text-pitch-400 text-xs font-display font-600 uppercase tracking-wider rounded-xl px-3 py-1.5 active:bg-pitch-700 disabled:opacity-40"
          >
            Claim
          </button>
        )}

        {isClaimed && item.claimed_by_me && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-display font-600 uppercase tracking-wide text-field">
              You
            </span>
            <button
              onClick={() => onUnclaim(item.id)}
              disabled={isClaimPending}
              className="text-pitch-500 active:text-red-400 disabled:opacity-30 p-0.5"
              aria-label="Unclaim"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {isClaimed && !item.claimed_by_me && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-field flex-shrink-0" />
            <span className="text-xs text-pitch-300 font-body italic truncate max-w-[90px]">
              {item.claimer_name ?? "Someone"}
            </span>
          </div>
        )}

        {/* Admin delete */}
        {canManage && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-pitch-500 active:text-red-400 p-1 flex-shrink-0"
            aria-label="Remove item"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          onDelete(item.id);
          setConfirmDelete(false);
        }}
        title="Remove Item?"
        description="Remove this supply item? This cannot be undone."
        confirmLabel="Remove"
      />
    </>
  );
};
