import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/teams/$teamId')({
  beforeLoad: async ({ params }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw redirect({ to: '/auth/login' })

    // Verify user is a member of this team
    const { data } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', params.teamId)
      .eq('user_id', user.id)
      .single()

    if (!data) throw redirect({ to: '/teams' })

    return { userRole: data.role }
  },
  component: () => <Outlet />,
})
