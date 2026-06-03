import type { FC } from "react";
import { CheckCircle2, Clock, AlertTriangle, MinusCircle } from "lucide-react";
import type { PaymentStatus } from "../types";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; Icon: typeof CheckCircle2; className: string }
> = {
  paid: {
    label: "PAID",
    Icon: CheckCircle2,
    className: "bg-field/15 text-field border border-field/35",
  },
  pending: {
    label: "PENDING",
    Icon: Clock,
    className: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  },
  overdue: {
    label: "OVERDUE",
    Icon: AlertTriangle,
    className: "bg-red-500/15 text-red-400 border border-red-500/30",
  },
  waived: {
    label: "WAIVED",
    Icon: MinusCircle,
    className: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
  },
};

export const PaymentStatusBadge: FC<PaymentStatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const { label, Icon, className } = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-display font-700 uppercase tracking-widest ${className} ${
        size === "sm"
          ? "px-2 py-0.5 text-[9px]"
          : "px-2.5 py-1 text-[10px]"
      }`}
    >
      <Icon size={size === "sm" ? 9 : 11} strokeWidth={2.5} />
      {label}
    </span>
  );
};
