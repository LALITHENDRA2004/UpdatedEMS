import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  loading,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !loading && onOpenChange(o)}
      title={title}
      className="max-w-sm"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} autoFocus>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-muted">{description}</p>
    </Dialog>
  )
}
