import { Link, useRouterState } from '@tanstack/react-router'
import { Calendar, Megaphone, Users, DollarSign, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
}

const teamNavItems = (teamId: string): NavItem[] => [
  { to: `/teams/${teamId}/schedule`,      label: 'Schedule', Icon: Calendar   },
  { to: `/teams/${teamId}/announcements`, label: 'News',     Icon: Megaphone  },
  { to: `/teams/${teamId}/roster`,        label: 'Roster',   Icon: Users      },
  { to: `/teams/${teamId}/payments`,      label: 'Payments', Icon: DollarSign },
  { to: `/teams/${teamId}/settings`,      label: 'Settings', Icon: Settings   },
]

export function TeamBottomNav({ teamId }: { teamId: string }) {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-pitch-800 border-t border-pitch-700 safe-area-pb z-20">
      <div className="flex items-center justify-around px-1 h-16">
        {teamNavItems(teamId).map((item) => {
          const isActive = currentPath.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive ? 'text-ember' : 'text-pitch-400'
              }`}
            >
              <item.Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] font-display font-600 tracking-wider uppercase ${
                  isActive ? 'text-ember' : 'text-pitch-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-[env(safe-area-inset-bottom,0px)] h-0.5 w-6 bg-ember rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
