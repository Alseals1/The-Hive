import { createFileRoute } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { PageShell, PageHeader } from "@/components/shared/PageShell";
import { TeamBottomNav } from "@/components/shared/BottomNav";

export const Route = createFileRoute("/teams/$teamId/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const { teamId } = Route.useParams();

  return (
    <>
      <Helmet><title>Payments | Dugout</title></Helmet>
      <PageShell
        withNav
        header={<PageHeader title="Payments" backTo="/teams" />}
        footer={<TeamBottomNav teamId={teamId} />}
      >
        <div className="px-4 py-6">
          <p className="text-pitch-400 text-sm text-center py-10 font-body">
            No payments due.
          </p>
        </div>
      </PageShell>
    </>
  );
}
