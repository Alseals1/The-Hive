import { Link, useRouterState } from '@tanstack/react-router'

interface NavItem {
  to: string
  label: string
  icon: string
  matchPrefix?: string
}

const teamNavItems = (teamId: string): NavItem[] => [
  { to: `/teams/${teamId}/schedule`, label: 'Schedule', icon: '📅' },
  { to: `/teams/${teamId}/announcements`, label: 'News', icon: '📣' },
  { to: `/teams/${teamId}/roster`, label: 'Roster', icon: '👥' },
  { to: `/teams/${teamId}/payments`, label: 'Payments', icon: '💳' },
  { to: `/teams/${teamId}/settings`, label: 'Settings', icon: '⚙️' },
]

export function TeamBottomNav({ teamId }: { teamId: string }) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 safe-area-pb z-20">
      <div className="flex items-center justify-around px-2 h-16">
        {teamNavItems(teamId).map((item) => {
          const isActive = currentPath.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-brand-600' : 'text-dugout-light'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
