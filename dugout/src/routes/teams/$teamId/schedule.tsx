import { createFileRoute } from '@tanstack/react-router'
import { SchedulePage } from '@/features/schedule/components/SchedulePage'

export const Route = createFileRoute('/teams/$teamId/schedule')({
  component: SchedulePage,
})
