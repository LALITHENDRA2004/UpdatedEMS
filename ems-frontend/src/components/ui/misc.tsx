import type { HTMLAttributes, ReactNode } from 'react'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-surface-2', className)} {...props} />
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-border bg-surface', className)} {...props} />
}

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border-strong bg-surface-2 px-1 font-mono text-[11px] text-muted',
        className,
      )}
      {...props}
    />
  )
}

const AVATAR_TONES = [
  'bg-[oklch(0.92_0.04_160)] text-[oklch(0.38_0.08_160)] dark:bg-[oklch(0.32_0.05_160)] dark:text-[oklch(0.86_0.07_160)]',
  'bg-[oklch(0.93_0.04_80)] text-[oklch(0.45_0.09_70)] dark:bg-[oklch(0.33_0.05_75)] dark:text-[oklch(0.88_0.08_80)]',
  'bg-[oklch(0.92_0.03_250)] text-[oklch(0.42_0.08_250)] dark:bg-[oklch(0.32_0.05_250)] dark:text-[oklch(0.86_0.06_250)]',
  'bg-[oklch(0.93_0.03_30)] text-[oklch(0.45_0.1_30)] dark:bg-[oklch(0.33_0.05_30)] dark:text-[oklch(0.87_0.06_30)]',
  'bg-[oklch(0.92_0.01_70)] text-[oklch(0.4_0.01_70)] dark:bg-[oklch(0.32_0.01_70)] dark:text-[oklch(0.86_0.01_70)]',
]

/** Deterministic tinted monogram — no stock photos, no gradients. */
export function Avatar({ name, seed, className }: { name: string; seed: string | number; className?: string }) {
  const key = String(seed)
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold tracking-wide',
        AVATAR_TONES[h % AVATAR_TONES.length],
        className,
      )}
    >
      {name}
    </span>
  )
}

export function Tooltip({ content, children, side = 'top' }: { content: ReactNode; children: ReactNode; side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <TooltipPrimitive.Root delayDuration={300}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-pop"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export const TooltipProvider = TooltipPrimitive.Provider
