import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/teams/')({
  component: TeamsPage,
})

function TeamsPage() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    await navigate({ to: '/auth/login' })
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-dugout-dark">⚾ My Teams</h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-dugout-mid active:text-dugout-dark"
        >
          Sign out
        </button>
      </header>

      {/* Empty state */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">⚾</div>
        <h2 className="text-xl font-bold text-dugout-dark mb-2">No teams yet</h2>
        <p className="text-dugout-mid mb-8">
          Create your first team or ask your coach for an invite link.
        </p>
        <button className="w-full max-w-xs bg-brand-500 text-white font-semibold py-3 rounded-xl text-base active:bg-brand-600">
          + Create a Team
        </button>
      </main>
    </div>
  )
}
