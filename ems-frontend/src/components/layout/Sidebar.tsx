import { NavLink, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { ChevronsUpDown, LogOut, Moon, Search, Sun, UserRound } from 'lucide-react'
import { useSession } from '@/auth/use-auth'
import { authStore } from '@/auth/auth-store'
import { can } from '@/auth/permissions'
import { useTheme } from '@/app/theme'
import { useMyOrganization } from '@/features/settings/api'
import { ROLE_LABEL } from '@/lib/format'
import { cn, initials } from '@/lib/utils'
import { Avatar, Kbd, Skeleton } from '@/components/ui/misc'
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from '@/components/ui/menu'
import { NAV } from './nav'
import { LogoMark } from './Logo'
import { spring } from '@/components/feedback/motion'

const SHORTCUT = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K'

interface SidebarProps {
  onNavigate?: () => void
  onOpenSearch: () => void
}

export function Sidebar({ onNavigate, onOpenSearch }: SidebarProps) {
  const session = useSession()
  const org = useMyOrganization()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  return (
    <div className="flex h-full flex-col gap-2 px-3 py-3">
      {/* Workspace */}
      <div className="flex items-center gap-2.5 px-1.5 py-1.5">
        <LogoMark className="size-7" />
        <div className="min-w-0 flex-1">
          {org.data ? (
            <p className="truncate font-display text-[15px] font-semibold leading-tight">{org.data.name}</p>
          ) : (
            <Skeleton className="h-4 w-28" />
          )}
        </div>
      </div>

      <button
        onClick={onOpenSearch}
        className="mt-1 flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-[13px] text-subtle transition-colors hover:border-border-strong hover:text-muted"
      >
        <Search className="size-3.5" />
        <span className="flex-1 text-left">Search…</span>
        <Kbd>{SHORTCUT}</Kbd>
      </button>

      <nav className="mt-3 flex flex-col gap-px" aria-label="Main">
        {NAV.filter((n) => !n.requires || can(session?.role, n.requires)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            viewTransition
            className={({ isActive }) =>
              cn(
                'relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors',
                isActive ? 'text-foreground' : 'text-muted hover:bg-surface/60 hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  // A file-tab: white card with a manila edge, sliding between items.
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-md border border-border bg-surface shadow-[0_1px_2px_rgb(28_39_51/0.06)] before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-r-full before:bg-manila"
                    transition={spring.indicator}
                  />
                )}
                <item.icon className={cn('relative size-4 transition-colors', isActive ? 'text-foreground' : 'text-subtle')} />
                <span className="relative">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <Menu>
          <MenuTrigger className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left outline-none transition-colors hover:bg-surface/60">
            <Avatar name={initials(session?.email)} seed={session?.email ?? ''} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium leading-tight">{session?.email}</p>
              <p className="text-xs text-muted">{session && ROLE_LABEL[session.role]}</p>
            </div>
            <ChevronsUpDown className="size-3.5 text-subtle" />
          </MenuTrigger>
          <MenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width)">
            <MenuLabel>Signed in as {session && ROLE_LABEL[session.role]}</MenuLabel>
            <MenuItem
              onSelect={() => {
                onNavigate?.()
                navigate('/settings/profile')
              }}
            >
              <UserRound /> Your profile
            </MenuItem>
            <MenuItem onSelect={toggle}>
              {theme === 'dark' ? <Sun /> : <Moon />} {theme === 'dark' ? 'Light' : 'Dark'} theme
            </MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => authStore.signOut()}>
              <LogOut /> Sign out
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>
  )
}
