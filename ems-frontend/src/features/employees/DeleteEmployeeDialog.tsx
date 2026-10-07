import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { errorMessage } from '@/lib/errors'
import type { Employee } from '@/types/api'
import { useDeleteEmployee } from './api'

interface Props {
  employee: Employee | null
  onClose: () => void
  onDeleted?: () => void
}

export function DeleteEmployeeDialog({ employee, onClose, onDeleted }: Props) {
  const remove = useDeleteEmployee()
  return (
    <ConfirmDialog
      open={!!employee}
      onOpenChange={(o) => !o && onClose()}
      title="Remove employee?"
      description={
        <>
          <span className="font-medium text-foreground">
            {employee?.firstName} {employee?.lastName}
          </span>{' '}
          will be permanently removed from your organization. This can’t be undone.
        </>
      }
      confirmLabel="Remove"
      loading={remove.isPending}
      onConfirm={() =>
        employee &&
        remove.mutate(employee.id, {
          onSuccess: () => {
            toast.success('Employee removed')
            onClose()
            onDeleted?.()
          },
          onError: (err) => toast.error(errorMessage(err)),
        })
      }
    />
  )
}
