import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Command } from 'cmdk'
import { Dialog as D } from 'radix-ui'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, Moon, Plus, Search, UserPlus, UserRound } from 'lucide-react'
import { useSession } from '@/auth/use-auth'
import { authStore } from '@/auth/auth-store'
import { can } from '@/auth/permissions'
import { useTheme } from '@/app/theme'
import { useEmployees } from '@/features/employees/api'
import { Avatar } from '@/components/ui/misc'
import { ease } from '@/components/feedback/motion'
import { initials } from '@/lib/utils'
import { NAV } from './nav'

const itemClass =
  'flex h-9 cursor-default select-none items-center gap-2.5 rounded-md px-2.5 text-[13px] text-foreground ' +
  'data-[selected=true]:bg-surface-2 [&_svg]:size-4 [&_svg]:text-muted'

export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate()
  const session = useSession()
  const { toggle } = useTheme()
  const employees = useEmployees()
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  const run = (fn: () => void) => {
    onOpenChange(false)
    setQuery('')
    fn()
  }

  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <D.Portal forceMount>
            <D.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-[oklch(0.2_0.01_70/0.3)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              />
            </D.Overlay>
            <D.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="fixed left-1/2 top-[14vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-pop outline-none"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.14, ease }}
              >
                <D.Title className="sr-only">Command menu</D.Title>
                <Command
                  loop
                  className="flex flex-col"
                  // Plain substring match: cmdk's fuzzy scoring surfaces unrelated people for short queries.
                  filter={(value, search, keywords) =>
                    [value, ...(keywords ?? [])].join(' ').toLowerCase().includes(search.trim().toLowerCase()) ? 1 : 0
                  }
                >
                  <div className="flex items-center gap-2.5 border-b border-border px-4">
                    <Search className="size-4 text-subtle" />
                    <Command.Input
                      value={query}
                      onValueChange={setQuery}
                      placeholder="Search people or jump to…"
                      className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
                    />
                  </div>
                  <Command.List className="max-h-[min(60vh,380px)] overflow-y-auto p-1.5 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-subtle">
                    <Command.Empty className="py-10 text-center text-[13px] text-muted">No results.</Command.Empty>

                    <Command.Group heading="Actions">
                      {can(session?.role, 'employee:create') && (
                        <Command.Item className={itemClass} onSelect={() => run(() => navigate('/employees?new=1'))}>
                          <Plus /> New employee
                        </Command.Item>
                      )}
                      {can(session?.role, 'invitation:create') && (
                        <Command.Item className={itemClass} onSelect={() => run(() => navigate('/team?invite=1'))}>
                          <UserPlus /> Invite a member
                        </Command.Item>
                      )}
                      <Command.Item className={itemClass} onSelect={() => run(toggle)}>
                        <Moon /> Toggle theme
                      </Command.Item>
                    </Command.Group>

                    <Command.Group heading="Go to">
                      {NAV.filter((n) => !n.requires || can(session?.role, n.requires)).map((n) => (
                        <Command.Item key={n.to} className={itemClass} onSelect={() => run(() => navigate(n.to))}>
                          <n.icon /> {n.label}
                        </Command.Item>
                      ))}
                      <Command.Item className={itemClass} onSelect={() => run(() => navigate('/settings/profile'))}>
                        <UserRound /> Your profile
                      </Command.Item>
                    </Command.Group>

                    {query.length > 0 && employees.data && employees.data.length > 0 && (
                      <Command.Group heading="People">
                        {employees.data.slice(0, 200).map((e) => (
                          <Command.Item
                            key={e.id}
                            value={`${e.firstName} ${e.lastName} ${e.email} ${e.jobTitle} #${e.id}`}
                            className={itemClass}
                            onSelect={() => run(() => navigate(`/employees/${e.id}`))}
                          >
                            <Avatar name={initials(e.firstName, e.lastName)} seed={e.id} className="size-5 text-[9px]" />
                            <span className="truncate">
                              {e.firstName} {e.lastName}
                            </span>
                            <span className="ml-auto truncate text-xs text-muted">{e.jobTitle}</span>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}

                    <Command.Group heading="Account">
                      <Command.Item className={itemClass} onSelect={() => run(() => authStore.signOut())}>
                        <LogOut /> Sign out
                      </Command.Item>
                    </Command.Group>
                  </Command.List>
                </Command>
              </motion.div>
            </D.Content>
          </D.Portal>
        )}
      </AnimatePresence>
    </D.Root>
  )
}
