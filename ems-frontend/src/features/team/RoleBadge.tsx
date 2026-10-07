import { Badge } from '@/components/ui/badge'
import { ROLE_LABEL } from '@/lib/format'
import type { Role } from '@/types/api'

const TONE = {
  OWNER: 'accent',
  ADMIN: 'info',
  HR: 'warning',
  MANAGER: 'neutral',
  EMPLOYEE: 'neutral',
} as const satisfies Record<Role, string>

export const ROLE_HINT: Record<Role, string> = {
  OWNER: 'Full control, including deleting the workspace',
  ADMIN: 'Manage people, departments, members and settings',
  HR: 'Add and edit employees and departments',
  MANAGER: 'View employees and departments',
  EMPLOYEE: 'View employees and departments',
}

export function RoleBadge({ role }: { role: Role }) {
  return <Badge tone={TONE[role]}>{ROLE_LABEL[role]}</Badge>
}
