import { Loader2, X } from "lucide-react";
import { useScrollTrap } from "@/hooks/useScrollTrap";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isPending?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  isPending = false,
}) => {
  useScrollTrap();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-pitch-800 border-t border-pitch-700 rounded-t-2xl px-4 pt-4 pb-10 z-10 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-pitch-600 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-700 uppercase tracking-wide text-pitch-50">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-pitch-400 active:bg-pitch-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-pitch-300 font-body mb-6 leading-relaxed">
          {description}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-4 py-3.5 rounded-xl bg-pitch-700 border border-pitch-600 text-pitch-300 font-display font-600 uppercase tracking-wider text-xs disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-3.5 rounded-xl bg-red-600 text-white font-display font-700 uppercase tracking-wider text-xs disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
