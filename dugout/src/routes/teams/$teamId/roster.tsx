import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/shared/PageShell";
import { TeamBottomNav } from "@/components/shared/BottomNav";

export const Route = createFileRoute("/teams/$teamId/roster")({
  component: RosterPage,
});

function RosterPage() {
  const { teamId } = Route.useParams();

  return (
    <PageShell
      withNav
      header={<PageHeader title="Roster" />}
      footer={<TeamBottomNav teamId={teamId} />}
    >
      <div className="px-4 py-6">
        <p className="text-dugout-mid text-sm text-center py-10">
          Loading roster…
        </p>
      </div>
    </PageShell>
  );
}
