import type { FC } from "react";
import { Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { useUpdatePaymentStatus } from "../hooks/usePayments";
import type { Payment } from "../types";

interface PaymentCardProps {
  payment: Payment;
  teamId: string;
  canMarkPaid: boolean;
}

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

export const PaymentCard: FC<PaymentCardProps> = ({
  payment,
  teamId,
  canMarkPaid,
}) => {
  const { mutate: updateStatus, isPending } = useUpdatePaymentStatus(teamId);

  const isOverdue = payment.status === "overdue";
  const isPaid = payment.status === "paid";
  const canPay =
    canMarkPaid && (payment.status === "pending" || payment.status === "overdue");

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all ${
        isOverdue
          ? "bg-red-950/30 border border-red-500/30"
          : isPaid
            ? "bg-field/5 border border-field/20"
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

      <div className={`px-4 py-4 ${isOverdue || isPaid ? "pl-5" : ""}`}>
        {/* Top row: title + badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isOverdue && (
              <AlertTriangle
                size={14}
                className="text-red-400 flex-shrink-0 mt-0.5"
              />
            )}
            <h3 className="font-display font-700 text-base uppercase tracking-wide text-pitch-50 leading-tight truncate">
              {payment.description}
            </h3>
          </div>
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
                  : "text-pitch-50"
            }`}
          >
            {formatCents(payment.amount_cents)}
          </span>
        </div>

        {/* Due date */}
        {payment.due_date && !isPaid && (
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

        {/* CTA */}
        {canPay && (
          <button
            onClick={() => updateStatus({ id: payment.id, status: "paid" })}
            disabled={isPending}
            className={`w-full py-3.5 rounded-xl font-display font-700 uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 ${
              isOverdue
                ? "bg-red-500 text-white"
                : "bg-field text-pitch-900"
            }`}
          >
            <CheckCircle size={16} strokeWidth={2.5} />
            {isPending ? "Updating…" : "Mark as Paid"}
          </button>
        )}
      </div>
    </div>
  );
};
