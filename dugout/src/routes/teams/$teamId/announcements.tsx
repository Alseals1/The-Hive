import { createFileRoute } from '@tanstack/react-router'
import { PageShell, PageHeader } from '@/components/shared/PageShell'
import { TeamBottomNav } from '@/components/shared/BottomNav'

export const Route = createFileRoute('/teams/$teamId/announcements')({
  component: AnnouncementsPage,
})

function AnnouncementsPage() {
  const { teamId } = Route.useParams()

  return (
    <PageShell
      withNav
      header={<PageHeader title="Announcements" />}
      footer={<TeamBottomNav teamId={teamId} />}
    >
      <div className="px-4 py-6">
        <p className="text-pitch-400 text-sm text-center py-10 font-body">
          No announcements yet.
        </p>
      </div>
    </PageShell>
  )
}
