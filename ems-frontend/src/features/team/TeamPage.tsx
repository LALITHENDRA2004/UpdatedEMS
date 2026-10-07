import { useDeferredValue, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ChevronDown, Search, UserPlus, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import { useCan, useSession } from '@/auth/use-auth'
import { assignableRoles, canChangeRoleOf } from '@/auth/permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, Tooltip } from '@/components/ui/misc'
import { Menu, MenuContent, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '@/components/ui/menu'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, columnHelper, type Columns } from '@/components/data-table/DataTable'
import { TableSkeleton } from '@/components/data-table/TableSkeleton'
import { EmptyState, ErrorState } from '@/components/feedback/states'
import { errorMessage } from '@/lib/errors'
import { formatDate, ROLE_LABEL } from '@/lib/format'
import { initials } from '@/lib/utils'
import type { Role, User } from '@/types/api'
import { useChangeRole, useUsers } from './api'
import { InviteDialog } from './InviteDialog'
import { RoleBadge, ROLE_HINT } from './RoleBadge'

const h = columnHelper<User>()

export function TeamPage() {
  const session = useSession()
  const users = useUsers()
  const canInvite = useCan('invitation:create')
  const { mutate: changeRole } = useChangeRole()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)

  const inviteOpen = canInvite && params.get('invite') === '1'
  const setInviteOpen = (o: boolean) =>
    setParams((p) => (o ? p.set('invite', '1') : p.delete('invite'), p), { replace: !o })

  const columns = useMemo<Columns<User>>(() => {
    const onChange = (u: User, role: Role) => {
      if (role === u.role) return
      changeRole(
        { id: u.id, role },
        {
          onSuccess: () => toast.success(`${u.username} is now ${ROLE_LABEL[role]}`),
          onError: (err) => toast.error(errorMessage(err)),
        },
      )
    }
    return h.columns([
      h.accessor((u) => `${u.username} ${u.email}`, {
        id: 'member',
        header: 'Member',
        sortFn: 'text',
        cell: ({ row: { original: u } }) => (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={initials(u.username)} seed={u.email} />
            <div className="min-w-0">
              <p className="flex items-center gap-2 truncate font-medium">
                {u.username}
                {u.id === session?.userId && (
                  <span className="rounded-sm bg-surface-2 px-1 py-px text-[10px] font-medium uppercase tracking-wide text-muted ring-1 ring-inset ring-border">
                    You
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted">{u.email}</p>
            </div>
          </div>
        ),
      }),
      h.accessor('role', {
        header: 'Role',
        enableGlobalFilter: false,
        sortFn: 'alphanumeric',
        cell: ({ row: { original: u } }) => {
          if (!canChangeRoleOf(session, u)) {
            const reason = u.id === session?.userId ? 'You can’t change your own role' : u.role === 'OWNER' ? 'The owner’s role is fixed' : null
            return reason ? (
              <Tooltip content={reason}>
                <span>
                  <RoleBadge role={u.role} />
                </span>
              </Tooltip>
            ) : (
              <RoleBadge role={u.role} />
            )
          }
          return (
            <Menu>
              <MenuTrigger className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 outline-none hover:bg-surface-2 focus-visible:ring-[3px] focus-visible:ring-ring">
                <RoleBadge role={u.role} />
                <ChevronDown className="size-3 text-subtle" />
              </MenuTrigger>
              <MenuContent align="start" className="w-72">
                <MenuLabel>Change role</MenuLabel>
                <MenuRadioGroup value={u.role} onValueChange={(r) => onChange(u, r as Role)}>
                  {assignableRoles(session?.role).map((r) => (
                    <MenuRadioItem key={r} value={r} className="h-auto py-1.5">
                      <div className="flex flex-col">
                        <span>{ROLE_LABEL[r]}</span>
                        <span className="text-xs text-muted">{ROLE_HINT[r]}</span>
                      </div>
                    </MenuRadioItem>
                  ))}
                </MenuRadioGroup>
              </MenuContent>
            </Menu>
          )
        },
      }),
      h.accessor('createdAt', {
        header: 'Joined',
        sortFn: 'alphanumeric',
        enableGlobalFilter: false,
        meta: { align: 'end', className: 'num text-muted whitespace-nowrap' },
        cell: (c) => formatDate(c.getValue()),
      }),
    ])
  }, [session, changeRole])

  return (
    <>
      <PageHeader
        title="Members"
        description="People who can sign in to this workspace."
        actions={
          canInvite && (
            <Button variant="primary" onClick={() => setInviteOpen(true)}>
              <UserPlus /> Invite
            </Button>
          )
        }
      />
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-8">
        <RoleSummary users={users.data} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members…"
          leading={<Search />}
          className="h-8 w-full sm:w-64"
        />
      </div>

      {users.isPending ? (
        <TableSkeleton cols={3} rows={5} />
      ) : users.isError ? (
        <ErrorState error={users.error} onRetry={() => users.refetch()} />
      ) : (
        <DataTable
          data={users.data}
          columns={columns}
          globalFilter={deferredSearch}
          initialSorting={[{ id: 'createdAt', desc: false }]}
          getRowId={(u) => String(u.id)}
          empty={
            <EmptyState
              icon={users.data.length ? <Search /> : <UsersRound />}
              title={users.data.length ? 'No matches' : 'Just you so far'}
              description={users.data.length ? 'Try a different name or email.' : 'Invite colleagues to share the workload.'}
            />
          }
        />
      )}

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  )
}

function RoleSummary({ users }: { users?: User[] }) {
  if (!users) return <span />
  const counts = users.reduce<Partial<Record<Role, number>>>((acc, u) => ((acc[u.role] = (acc[u.role] ?? 0) + 1), acc), {})
  return (
    <p className="hidden truncate text-xs text-muted sm:block">
      {(Object.keys(ROLE_LABEL) as Role[])
        .filter((r) => counts[r])
        .map((r) => `${counts[r]} ${ROLE_LABEL[r]}${counts[r]! > 1 && r !== 'HR' ? 's' : ''}`)
        .join(' · ')}
    </p>
  )
}
