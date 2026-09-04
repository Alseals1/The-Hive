import { useState, useEffect } from "react";
import type { FC } from "react";
import { toast } from "sonner";
import { X, DollarSign, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/shared/FormError";
import { useRoster } from "@/features/roster/hooks/useRoster";
import { useCreateTeamPayments } from "../hooks/usePayments";

interface CreatePaymentSheetProps {
  teamId: string;
  onClose: () => void;
}

const labelCls =
  "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

type FormErrors = {
  description?: string;
  amount?: string;
};

export const CreatePaymentSheet: FC<CreatePaymentSheetProps> = ({
  teamId,
  onClose,
}) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const { data: roster } = useRoster(teamId);
  const { mutate: createPayments, isPending, error } =
    useCreateTeamPayments(teamId);

  const memberIds = (roster ?? []).map((m) => m.user_id);
  const memberCount = memberIds.length;

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!description.trim()) errs.description = "Description is required";
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      errs.amount = "Enter a valid amount greater than $0";
    }
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    createPayments(
      {
        memberIds,
        description: description.trim(),
        amount_cents: Math.round(parseFloat(amount) * 100),
        due_date: dueDate || null,
      },
      { onSuccess: () => { toast.success("Payment request sent."); onClose(); } },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-pitch-800 border-t border-pitch-700 rounded-t-2xl px-4 pt-4 pb-10 z-10 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-pitch-600 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-700 uppercase tracking-wide text-pitch-50">
              New Payment
            </h2>
            {memberCount > 0 && (
              <p className="text-xs font-body text-pitch-400 mt-0.5 flex items-center gap-1">
                <Users size={11} />
                Sends to {memberCount} team member{memberCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-pitch-400 active:bg-pitch-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label htmlFor="pay-desc" className={labelCls}>
              Description <span className="text-ember">*</span>
            </label>
            <Input
              id="pay-desc"
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (fieldErrors.description)
                  setFieldErrors((p) => ({ ...p, description: undefined }));
              }}
              placeholder="Season Dues, Tournament Fee…"
              error={fieldErrors.description}
              maxLength={100}
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="pay-amount" className={labelCls}>
              Amount <span className="text-ember">*</span>
            </label>
            <div className="relative">
              <DollarSign
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pitch-400 pointer-events-none"
              />
              <input
                id="pay-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (fieldErrors.amount)
                    setFieldErrors((p) => ({ ...p, amount: undefined }));
                }}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-700/40 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors"
              />
            </div>
            <FormError message={fieldErrors.amount} />
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="pay-due" className={labelCls}>
              Due Date{" "}
              <span className="text-pitch-500 font-400 normal-case tracking-normal">
                optional
              </span>
            </label>
            <input
              id="pay-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-700/40 text-pitch-50 text-base focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error instanceof Error ? error.message : "Something went wrong."}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || memberCount === 0}
            className="w-full py-3.5 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm disabled:opacity-40"
          >
            {isPending
              ? "Sending…"
              : `Send to ${memberCount} Member${memberCount !== 1 ? "s" : ""}`}
          </button>

          {memberCount === 0 && (
            <p className="text-xs text-pitch-400 text-center font-body">
              Add team members before creating a payment
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
