import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/teams/$teamId')({
  beforeLoad: async ({ params }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw redirect({ to: '/auth/login' })

    // Check if the team exists
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('id', params.teamId)
      .maybeSingle()

    if (!team) {
      toast.error('Team not found')
      throw redirect({ to: '/teams' })
    }

    // Check if the current user is a member of this team
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', params.teamId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) {
      toast.error("You don't have access to this team")
      throw redirect({ to: '/teams' })
    }

    return { userRole: membership.role }
  },
  component: () => <Outlet />,
})
