import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { errorMessage } from '@/lib/errors'
import { fadeUp } from './motion'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: ReactNode
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center px-6 py-16 text-center"
    >
      <div className="relative mb-5">
        {/* Line-drawn "stack of cards" motif behind the icon */}
        <svg width="88" height="64" viewBox="0 0 88 64" fill="none" aria-hidden className="text-border-strong">
          <rect x="14.5" y="10.5" width="59" height="43" rx="5.5" stroke="currentColor" strokeDasharray="3 3" />
          <rect x="8.5" y="16.5" width="71" height="43" rx="5.5" className="fill-surface" stroke="currentColor" />
        </svg>
        <div className="absolute inset-x-0 bottom-3 flex justify-center text-muted [&_svg]:size-5">{icon}</div>
      </div>
      <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-3 rounded-md border border-danger/25 bg-danger-soft px-2 py-1 font-mono text-xs text-danger">
        request failed
      </div>
      <h3 className="text-[15px] font-semibold tracking-tight">Couldn’t load this</h3>
      <p className="mt-1 max-w-sm text-[13px] text-muted">{errorMessage(error)}</p>
      {onRetry && (
        <Button className="mt-5" onClick={onRetry}>
          <RotateCw /> Try again
        </Button>
      )}
    </div>
  )
}
