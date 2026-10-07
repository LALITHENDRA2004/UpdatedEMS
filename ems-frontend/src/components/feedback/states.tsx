import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { errorMessage } from '@/lib/errors'
import { ease } from './motion'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: ReactNode
  action?: ReactNode
}

/** An empty folder with the icon on its tab — the product's filing motif, drawn in hairlines. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease }}
      className="flex flex-col items-center px-6 py-16 text-center"
    >
      <div className="relative mb-6">
        <svg width="112" height="76" viewBox="0 0 112 76" fill="none" aria-hidden>
          <path
            d="M8.5 14.5a4 4 0 0 1 4-4h26l7 7h54a4 4 0 0 1 4 4v42a4 4 0 0 1-4 4h-87a4 4 0 0 1-4-4z"
            className="fill-surface-2 stroke-border-strong"
          />
          <path d="M8.5 27.5h95" className="stroke-border-strong" strokeDasharray="3 3" />
          <rect x="12.5" y="6.5" width="30" height="11" rx="3" className="fill-manila-soft stroke-manila" />
        </svg>
        <div className="absolute left-[18px] top-[7px] flex text-manila-ink [&_svg]:size-[9px]">{icon}</div>
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <h3 className="font-display text-lg font-semibold">This page didn’t load</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">{errorMessage(error)}</p>
      {onRetry && (
        <Button className="mt-6" onClick={onRetry}>
          <RotateCw /> Try again
        </Button>
      )}
    </div>
  )
}
