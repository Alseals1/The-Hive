import type { FC } from "react";
import { useState } from "react";
import {
  DollarSign,
  Plus,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Hourglass,
} from "lucide-react";
import { useParams, useRouteContext } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { PageShell, PageHeader } from "@/components/shared/PageShell";
import { TeamBottomNav } from "@/components/shared/BottomNav";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useTeamPayments,
  useMyPayments,
  useUpdatePaymentStatus,
  useVerifyPayment,
  useDeclinePayment,
} from "../hooks/usePayments";
import { PaymentCard } from "./PaymentCard";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { CreatePaymentSheet } from "./CreatePaymentSheet";
import type { PaymentStatus, PaymentWithProfile } from "../types";

// pending_confirmation is intentionally excluded from this cycle
const STATUS_CYCLE: Record<
  Exclude<PaymentStatus, "pending_confirmation">,
  Exclude<PaymentStatus, "pending_confirmation">
> = {
  pending: "paid",
  paid: "overdue",
  overdue: "waived",
  waived: "pending",
};

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function groupByDescription(
  payments: PaymentWithProfile[],
): Map<string, PaymentWithProfile[]> {
  const map = new Map<string, PaymentWithProfile[]>();
  for (const p of payments) {
    const existing = map.get(p.description);
    if (existing) {
      existing.push(p);
    } else {
      map.set(p.description, [p]);
    }
  }
  return map;
}

interface CoachPaymentsViewProps {
  teamId: string;
  onCreateNew: () => void;
}

function CoachPaymentsView({ teamId, onCreateNew }: CoachPaymentsViewProps) {
  const { data: payments, isLoading, error, refetch } = useTeamPayments(teamId);
  const { mutate: updateStatus } = useUpdatePaymentStatus(teamId);
  const { mutate: verifyPayment, isPending: isVerifying } = useVerifyPayment(teamId);
  const { mutate: declinePayment, isPending: isDeclining } = useDeclinePayment(teamId);
  const [pendingChange, setPendingChange] = useState<{ id: string; newStatus: Exclude<PaymentStatus, "pending_confirmation"> } | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={
          error instanceof Error ? error.message : "Couldn't load payments."
        }
        onRetry={() => refetch()}
      />
    );
  }

  const allPayments = payments ?? [];
  const grouped = groupByDescription(allPayments);

  if (allPayments.length === 0) {
    return (
      <div className="px-4 py-6">
        <EmptyState
          icon={<DollarSign size={24} />}
          title="No dues tracked yet"
          description="Create a payment request to collect dues or fees from your team."
          action={{ label: "Create Payment", onClick: onCreateNew }}
        />
      </div>
    );
  }

  const totalPaid = allPayments.filter((p) => p.status === "paid").length;
  const overdueCount = allPayments.filter((p) => p.status === "overdue").length;
  const needsVerificationCount = allPayments.filter(
    (p) => p.status === "pending_confirmation",
  ).length;

  return (
    <div className="px-4 py-4 space-y-6 overflow-x-hidden">
      {/* Global summary strip */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0 bg-pitch-700/40 border border-pitch-600/40 rounded-xl px-4 py-3 flex items-center gap-3">
          <TrendingUp size={16} className="text-field flex-shrink-0" />
          <div>
            <p className="text-[10px] font-display uppercase tracking-widest text-pitch-400">
              Total Paid
            </p>
            <p className="font-display font-900 text-xl text-field leading-none mt-0.5">
              {totalPaid}
              <span className="text-pitch-500 font-700 text-base">
                /{allPayments.length}
              </span>
            </p>
          </div>
        </div>
        {needsVerificationCount > 0 && (
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
            <Hourglass size={16} className="text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-display uppercase tracking-widest text-amber-400/70">
                Verify
              </p>
              <p className="font-display font-900 text-xl text-amber-400 leading-none mt-0.5">
                {needsVerificationCount}
              </p>
            </div>
          </div>
        )}
        {overdueCount > 0 && (
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-display uppercase tracking-widest text-red-400/70">
                Overdue
              </p>
              <p className="font-display font-900 text-xl text-red-400 leading-none mt-0.5">
                {overdueCount}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Grouped by description */}
      {[...grouped.entries()].map(([description, batch]) => {
        const paidCount = batch.filter((p) => p.status === "paid").length;
        const total = batch.length;
        const amountCents = batch[0]?.amount_cents ?? 0;
        const dueDate = batch.find((p) => p.due_date)?.due_date ?? null;
        const paidPercent = total > 0 ? Math.round((paidCount / total) * 100) : 0;
        const hasOverdue = batch.some((p) => p.status === "overdue");

        return (
          <div key={description} className="space-y-2">
            {/* Batch summary — scoreboard card */}
            <div
              className={`rounded-2xl p-4 border ${
                hasOverdue
                  ? "bg-red-950/20 border-red-500/25"
                  : "bg-pitch-700/40 border-pitch-600/40"
              }`}
            >
              <div className="flex items-start gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-display uppercase tracking-widest text-pitch-400 mb-0.5 truncate">
                    {description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-900 text-3xl tracking-tight text-pitch-50">
                      {formatCents(amountCents)}
                    </span>
                    {dueDate && (
                      <span className="text-xs font-body text-pitch-500">
                        · due {formatShortDate(dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                {/* Scoreboard fraction */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-baseline gap-0.5 justify-end">
                    <span className="font-display font-900 text-3xl text-field leading-none">
                      {paidCount}
                    </span>
                    <span className="font-display font-700 text-xl text-pitch-500 leading-none">
                      /{total}
                    </span>
                  </div>
                  <p className="text-[9px] font-display uppercase tracking-widest text-pitch-400 mt-0.5">
                    PAID
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-pitch-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-field rounded-full transition-all duration-700"
                  style={{ width: `${paidPercent}%` }}
                />
              </div>
            </div>

            {/* Individual member rows */}
            <div className="space-y-1">
              {batch.map((payment) => {
                if (payment.status === "pending_confirmation") {
                  // Verification row — not clickable for cycling
                  return (
                    <div
                      key={payment.id}
                      className="w-full flex items-center justify-between px-4 py-3 bg-amber-950/20 border border-amber-500/25 rounded-xl gap-3"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Hourglass size={13} className="text-amber-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="font-body text-sm text-pitch-100 truncate block">
                            {payment.memberName ?? "Unknown"}
                          </span>
                          {payment.notes && (
                            <span className="text-[11px] font-body text-amber-400/80">
                              {payment.notes}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => verifyPayment({ id: payment.id })}
                          disabled={isVerifying || isDeclining}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-field/15 border border-field/30 text-field text-xs font-display font-700 uppercase tracking-wide active:bg-field/25 transition-colors disabled:opacity-50"
                          aria-label="Verify payment"
                        >
                          <CheckCircle2 size={12} strokeWidth={2.5} />
                          Verify
                        </button>
                        <button
                          onClick={() => declinePayment({ id: payment.id })}
                          disabled={isVerifying || isDeclining}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-display font-700 uppercase tracking-wide active:bg-red-500/25 transition-colors disabled:opacity-50"
                          aria-label="Decline payment"
                        >
                          <XCircle size={12} strokeWidth={2.5} />
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                }

                // Standard cycleable row
                return (
                  <button
                    key={payment.id}
                    onClick={() =>
                      setPendingChange({ id: payment.id, newStatus: STATUS_CYCLE[payment.status as keyof typeof STATUS_CYCLE] })
                    }
                    className="w-full flex items-center justify-between px-4 py-3 bg-pitch-800/70 border border-pitch-700/50 rounded-xl active:bg-pitch-700/60 transition-colors text-left gap-3"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {payment.status === "overdue" && (
                        <AlertCircle
                          size={13}
                          className="text-red-400 flex-shrink-0"
                        />
                      )}
                      <span className="font-body text-sm text-pitch-100 truncate">
                        {payment.memberName ?? "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PaymentStatusBadge status={payment.status} size="sm" />
                      <ChevronRight size={13} className="text-pitch-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* FAB */}
      <button
        onClick={onCreateNew}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-ember shadow-lg shadow-ember/30 flex items-center justify-center z-10 active:scale-95 transition-transform"
        aria-label="Create payment"
      >
        <Plus size={24} className="text-white" />
      </button>

      <ConfirmDialog
        open={pendingChange !== null}
        onClose={() => setPendingChange(null)}
        onConfirm={() => {
          if (pendingChange) {
            updateStatus({ id: pendingChange.id, status: pendingChange.newStatus });
          }
          setPendingChange(null);
        }}
        title="Change Payment Status?"
        description="This will update the member's payment status. Are you sure?"
        confirmLabel="Update Status"
      />
    </div>
  );
}

function PlayerPaymentsView({ teamId }: { teamId: string }) {
  const { data: payments, isLoading, error, refetch } = useMyPayments(teamId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={
          error instanceof Error ? error.message : "Couldn't load payments."
        }
        onRetry={() => refetch()}
      />
    );
  }

  const allPayments = payments ?? [];

  if (allPayments.length === 0) {
    return (
      <div className="px-4 py-6">
        <EmptyState
          icon={<DollarSign size={24} />}
          title="You're all clear"
          description="No payments due right now."
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {allPayments.map((payment) => (
        <PaymentCard key={payment.id} payment={payment} teamId={teamId} />
      ))}
    </div>
  );
}

export const PaymentsPage: FC = () => {
  const { teamId } = useParams({ from: "/teams/$teamId/payments" });
  const { userRole } = useRouteContext({ from: "/teams/$teamId" });
  const [showCreate, setShowCreate] = useState(false);

  const isCoach = userRole === "admin" || userRole === "coach";

  return (
    <>
      <Helmet>
        <title>Payments | Dugout</title>
      </Helmet>
      <PageShell
        header={
          <PageHeader
            title="Payments"
            backTo="/teams"
          />
        }
        footer={<TeamBottomNav teamId={teamId} />}
        withNav
      >
        {showCreate && (
          <CreatePaymentSheet
            teamId={teamId}
            onClose={() => setShowCreate(false)}
          />
        )}

        {isCoach ? (
          <CoachPaymentsView
            teamId={teamId}
            onCreateNew={() => setShowCreate(true)}
          />
        ) : (
          <PlayerPaymentsView teamId={teamId} />
        )}
      </PageShell>
    </>
  );
};
