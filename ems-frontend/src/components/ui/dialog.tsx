import type { ReactNode } from 'react'
import { Dialog as D } from 'radix-ui'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ease } from '@/components/feedback/motion'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/** Centered modal. Controlled so framer-motion can animate the exit. */
export function Dialog({ open, onOpenChange, title, description, children, footer, className }: DialogProps) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <D.Portal forceMount>
            <D.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-[oklch(0.2_0.01_70/0.32)] backdrop-blur-[1px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            </D.Overlay>
            <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 pointer-events-none">
              <D.Content asChild forceMount>
                <motion.div
                  className={cn(
                    'pointer-events-auto w-full max-w-md rounded-xl border border-border bg-surface shadow-pop outline-none',
                    className,
                  )}
                  initial={{ opacity: 0, scale: 0.97, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 4 }}
                  transition={{ duration: 0.18, ease }}
                >
                  <div className="flex items-start justify-between gap-4 px-5 pt-5">
                    <div className="space-y-1">
                      <D.Title className="text-[15px] font-semibold tracking-tight">{title}</D.Title>
                      {description ? (
                        <D.Description className="text-[13px] text-muted">{description}</D.Description>
                      ) : (
                        <D.Description className="sr-only">{title}</D.Description>
                      )}
                    </div>
                    <D.Close className="-mr-1.5 -mt-1 rounded-md p-1.5 text-subtle hover:bg-surface-2 hover:text-foreground">
                      <X className="size-4" />
                      <span className="sr-only">Close</span>
                    </D.Close>
                  </div>
                  <div className="px-5 py-4">{children}</div>
                  {footer && (
                    <div className="flex justify-end gap-2 border-t border-border bg-surface-2/50 px-5 py-3 rounded-b-xl">
                      {footer}
                    </div>
                  )}
                </motion.div>
              </D.Content>
            </div>
          </D.Portal>
        )}
      </AnimatePresence>
    </D.Root>
  )
}

interface SheetProps extends Omit<DialogProps, 'footer'> {
  footer?: ReactNode
}

/** Right-hand drawer for create/edit forms — keeps the list visible for context. */
export function Sheet({ open, onOpenChange, title, description, children, footer, className }: SheetProps) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <D.Portal forceMount>
            <D.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-[oklch(0.2_0.01_70/0.28)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </D.Overlay>
            <D.Content asChild forceMount>
              <motion.div
                className={cn(
                  'fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col border-l border-border bg-surface shadow-pop outline-none',
                  className,
                )}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 420, damping: 40 }}
              >
                <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                  <div className="space-y-0.5">
                    <D.Title className="text-[15px] font-semibold tracking-tight">{title}</D.Title>
                    {description ? (
                      <D.Description className="text-[13px] text-muted">{description}</D.Description>
                    ) : (
                      <D.Description className="sr-only">{title}</D.Description>
                    )}
                  </div>
                  <D.Close className="-mr-2 rounded-md p-1.5 text-subtle hover:bg-surface-2 hover:text-foreground">
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                  </D.Close>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
                {footer && <div className="flex justify-end gap-2 border-t border-border px-6 py-3">{footer}</div>}
              </motion.div>
            </D.Content>
          </D.Portal>
        )}
      </AnimatePresence>
    </D.Root>
  )
}
