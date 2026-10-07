import { Badge } from '@/components/ui/badge'
import { STATUS_LABEL } from '@/lib/format'
import type { EmployeeStatus } from '@/types/api'

const TONE = {
  ACTIVE: 'accent',
  ON_LEAVE: 'warning',
  INACTIVE: 'neutral',
  TERMINATED: 'danger',
} as const satisfies Record<EmployeeStatus, string>

export function StatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <Badge tone={TONE[status]} dot>
      {STATUS_LABEL[status]}
    </Badge>
  )
}
