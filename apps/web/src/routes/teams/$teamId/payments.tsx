import { createFileRoute } from "@tanstack/react-router";
import { PaymentsPage } from "@/features/payments/components/PaymentsPage";

export const Route = createFileRoute("/teams/$teamId/payments")({
  component: PaymentsPage,
});
