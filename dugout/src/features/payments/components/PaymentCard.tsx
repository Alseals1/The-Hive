import { type FC, useState } from "react";
import { Calendar, CheckCircle, Hourglass } from "lucide-react";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { useSelfReportPayment } from "../hooks/usePayments";
import type { Payment } from "../types";

interface PaymentCardProps {
  payment: Payment;
  teamId: string;
}

const PAYMENT_METHODS = ["Venmo", "Cash", "Zelle"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const PaymentCard: FC<PaymentCardProps> = ({ payment, teamId }) => {
  const [showMethods, setShowMethods] = useState(false);
  const { mutate: selfReport, isPending } = useSelfReportPayment(teamId);

  const isOverdue = payment.status === "overdue";
  const isPaid = payment.status === "paid";
  const isPendingConfirmation = payment.status === "pending_confirmation";
  const canSelfReport =
    payment.status === "pending" || payment.status === "overdue";

  function handleMethodSelect(method: PaymentMethod) {
    selfReport(
      { id: payment.id, method },
      { onSuccess: () => setShowMethods(false) },
    );
  }

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all ${
        isOverdue
          ? "bg-red-950/30 border border-red-500/30"
          : isPaid
            ? "bg-field/5 border border-field/20"
            : isPendingConfirmation
              ? "bg-amber-950/20 border border-amber-500/25"
              : "bg-pitch-700/50 border border-pitch-600/40"
      }`}
    >
      {/* Left accent stripe */}
      {isOverdue && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-2xl" />
      )}
      {isPaid && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-field rounded-l-2xl" />
      )}
      {isPendingConfirmation && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-l-2xl" />
      )}

      <div className={`px-4 py-4 ${isOverdue || isPaid || isPendingConfirmation ? "pl-5" : ""}`}>
        {/* Top row: title + badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display font-700 text-base uppercase tracking-wide text-pitch-50 leading-tight truncate flex-1 min-w-0">
            {payment.description}
          </h3>
          <PaymentStatusBadge status={payment.status} size="sm" />
        </div>

        {/* Amount — dominant */}
        <div className="mb-3">
          <span
            className={`font-display font-900 text-5xl tracking-tight leading-none ${
              isOverdue
                ? "text-red-300"
                : isPaid
                  ? "text-field"
                  : isPendingConfirmation
                    ? "text-amber-300"
                    : "text-pitch-50"
            }`}
          >
            {formatCents(payment.amount_cents)}
          </span>
        </div>

        {/* Due date */}
        {payment.due_date && !isPaid && !isPendingConfirmation && (
          <div className="flex items-center gap-1.5 mb-4">
            <Calendar size={12} className="text-pitch-400" />
            <span className="text-xs font-body text-pitch-400">
              Due {formatDate(payment.due_date)}
            </span>
          </div>
        )}

        {/* Paid date */}
        {isPaid && payment.paid_at && (
          <div className="flex items-center gap-1.5 mb-3">
            <CheckCircle size={12} className="text-field" />
            <span className="text-xs font-body text-field/80">
              Paid {formatDate(payment.paid_at)}
            </span>
          </div>
        )}

        {/* Awaiting confirmation state */}
        {isPendingConfirmation && (
          <div className="flex items-center gap-2 py-3 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Hourglass size={14} className="text-amber-400 flex-shrink-0" />
            <p className="text-sm font-body text-amber-300">
              Awaiting confirmation
              {payment.notes ? ` · ${payment.notes}` : ""}
            </p>
          </div>
        )}

        {/* Self-report CTA */}
        {canSelfReport && !showMethods && (
          <button
            onClick={() => setShowMethods(true)}
            disabled={isPending}
            className={`w-full py-3.5 rounded-xl font-display font-700 uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 ${
              isOverdue
                ? "bg-red-500 text-white"
                : "bg-field text-pitch-900"
            }`}
          >
            <CheckCircle size={16} strokeWidth={2.5} />
            I paid
          </button>
        )}

        {/* Method selector */}
        {canSelfReport && showMethods && (
          <div className="space-y-2">
            <p className="text-xs font-display uppercase tracking-widest text-pitch-400 text-center">
              How did you pay?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  onClick={() => handleMethodSelect(method)}
                  disabled={isPending}
                  className="py-3 rounded-xl font-display font-700 uppercase tracking-wide text-sm bg-pitch-700/60 border border-pitch-600/50 text-pitch-100 active:bg-pitch-600/60 transition-colors disabled:opacity-50"
                >
                  {method}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMethods(false)}
              className="w-full py-2 text-xs font-body text-pitch-500 active:text-pitch-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
