import { useId, type ReactElement, type ReactNode, cloneElement } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  error?: string
  hint?: ReactNode
  optional?: boolean
  className?: string
  /** A single input-like element; receives id / aria wiring. */
  children: ReactElement<Record<string, unknown>>
}

export function Field({ label, error, hint, optional, className, children }: FieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline justify-between text-[13px] font-medium text-foreground">
        {label}
        {optional && <span className="text-xs font-normal text-subtle">Optional</span>}
      </label>
      {cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-danger"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p key="hint" id={`${id}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
