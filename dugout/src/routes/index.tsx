import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      throw redirect({ to: '/teams' })
    } else {
      throw redirect({ to: '/auth/login' })
    }
  },
})
