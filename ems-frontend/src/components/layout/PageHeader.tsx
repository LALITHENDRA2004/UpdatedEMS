import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  /** Small label above the title, e.g. a breadcrumb. */
  eyebrow?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, eyebrow, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-border px-4 pb-5 pt-5 sm:flex-row sm:items-end sm:justify-between md:px-8 md:pt-7',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 text-xs text-muted">{eyebrow}</div>}
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function PageBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-4 py-5 md:px-8 md:py-6', className)}>{children}</div>
}
