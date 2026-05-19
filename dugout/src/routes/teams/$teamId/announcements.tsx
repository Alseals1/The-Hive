import { createFileRoute } from '@tanstack/react-router'
import { AnnouncementsPage } from '@/features/announcements/components/AnnouncementsPage'

export const Route = createFileRoute('/teams/$teamId/announcements')({
  component: AnnouncementsPage,
})
