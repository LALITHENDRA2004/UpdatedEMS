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
            <p className="truncate text-[13px] font-semibold leading-tight">{org.data.name}</p>
          ) : (
            <Skeleton className="h-3.5 w-24" />
          )}
          <p className="truncate text-xs text-muted">Workspace</p>
        </div>
      </div>

      <button
        onClick={onOpenSearch}
        className="mt-1 flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-[13px] text-subtle transition-colors hover:border-border-strong hover:text-muted"
      >
        <Search className="size-3.5" />
        <span className="flex-1 text-left">Search…</span>
        <Kbd>⌘K</Kbd>
      </button>

      <nav className="mt-3 flex flex-col gap-px" aria-label="Main">
        {NAV.filter((n) => !n.requires || can(session?.role, n.requires)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors',
                isActive ? 'text-foreground' : 'text-muted hover:bg-surface-2/70 hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-md border border-border bg-surface shadow-[0_1px_1px_oklch(0.2_0.01_70/0.04)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <item.icon className={cn('relative size-4', isActive ? 'text-accent' : 'text-subtle')} />
                <span className="relative">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <Menu>
          <MenuTrigger className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left outline-none transition-colors hover:bg-surface-2/70 focus-visible:ring-[3px] focus-visible:ring-ring">
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
