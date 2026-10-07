import type { HTMLAttributes, ReactNode } from 'react'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-surface-2', className)} {...props} />
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-border bg-surface shadow-panel', className)} {...props} />
}

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded border border-border-strong bg-surface px-1 text-[11px] font-medium text-muted shadow-[0_1px_0_var(--border-strong)]',
        className,
      )}
      {...props}
    />
  )
}

// Muted "ID photo" backdrops: slate, sage, clay, dusk, sand. Text is always ink-tinted for contrast.
const AVATAR_TONES = [
  'bg-[#dfe6ee] text-[#2c4058] dark:bg-[#24303e] dark:text-[#b9c9dc]',
  'bg-[#e1ebe3] text-[#2f5440] dark:bg-[#20302a] dark:text-[#b4d3c0]',
  'bg-[#f0e2db] text-[#6b3a26] dark:bg-[#36261f] dark:text-[#e3c0ae]',
  'bg-[#e6e1ef] text-[#45386a] dark:bg-[#2a2638] dark:text-[#cbc1e4]',
  'bg-[#efe8d8] text-[#5e4b1c] dark:bg-[#332d1f] dark:text-[#e0d1a6]',
]

interface AvatarProps {
  name: string
  seed: string | number
  className?: string
  /** Shared-element name for View Transitions (e.g. row → personnel file). */
  viewTransitionName?: string
}

/** Deterministic monogram tile — reads like the photo slot on an ID card. */
export function Avatar({ name, seed, className, viewTransitionName }: AvatarProps) {
  const key = String(seed)
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return (
    <span
      aria-hidden
      style={viewTransitionName ? { viewTransitionName } : undefined}
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold',
        AVATAR_TONES[h % AVATAR_TONES.length],
        className,
      )}
    >
      {name}
    </span>
  )
}

export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}) {
  return (
    <TooltipPrimitive.Root delayDuration={250}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-pop data-[state=delayed-open]:animate-[pop-in_120ms_ease-out]"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export const TooltipProvider = TooltipPrimitive.Provider
