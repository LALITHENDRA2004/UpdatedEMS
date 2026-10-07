import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { motion } from 'framer-motion'
import { PageBody, PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils'

const TABS = [
  { to: '/settings/organization', label: 'Organization' },
  { to: '/settings/profile', label: 'Profile' },
]

export function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageHeader title="Settings" description="Workspace and personal preferences." className="border-b-0 pb-4" />
      <nav className="-mt-px flex gap-5 border-b border-border px-4 md:px-8" aria-label="Settings">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              cn('relative py-2.5 text-[13px] font-medium transition-colors', isActive ? 'text-foreground' : 'text-muted hover:text-foreground')
            }
          >
            {({ isActive }) => (
              <>
                {t.label}
                {isActive && (
                  <motion.span layoutId="settings-tab" className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <PageBody className="max-w-3xl">{children}</PageBody>
    </>
  )
}

export function SettingsSection({
  title,
  description,
  children,
  footer,
  tone,
}: {
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  tone?: 'danger'
}) {
  return (
    <section
      className={cn('mb-6 rounded-lg border bg-surface', tone === 'danger' ? 'border-danger/30' : 'border-border')}
    >
      <div className="px-5 pb-4 pt-5">
        <h2 className={cn('text-[14px] font-semibold', tone === 'danger' && 'text-danger')}>{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
        <div className="mt-5">{children}</div>
      </div>
      {footer && (
        <div
          className={cn(
            'flex items-center justify-end gap-3 rounded-b-lg border-t px-5 py-3',
            tone === 'danger' ? 'border-danger/20 bg-danger-soft/40' : 'border-border bg-surface-2/50',
          )}
        >
          {footer}
        </div>
      )}
    </section>
  )
}
