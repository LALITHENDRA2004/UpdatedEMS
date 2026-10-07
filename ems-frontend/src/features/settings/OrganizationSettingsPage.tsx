import { useEffect, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { authStore } from '@/auth/auth-store'
import { useCan } from '@/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/misc'
import { ErrorState } from '@/components/feedback/states'
import { toApiError } from '@/lib/errors'
import { handleFormError } from '@/lib/forms'
import { formatDate } from '@/lib/format'
import type { Organization } from '@/types/api'
import { useDeleteOrganization, useMyOrganization, useUpdateOrganization } from './api'
import { SettingsLayout, SettingsSection } from './SettingsLayout'

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email').max(150),
})
type Values = z.infer<typeof schema>

export function OrganizationSettingsPage() {
  const org = useMyOrganization()
  const canDelete = useCan('organization:delete')

  return (
    <SettingsLayout>
      {org.isPending ? (
        <Skeleton className="h-64" />
      ) : org.isError ? (
        <ErrorState error={org.error} onRetry={() => org.refetch()} />
      ) : (
        <>
          <ProfileForm org={org.data} />
          <SettingsSection title="Workspace" description="Details to quote if you contact support.">
            <dl className="grid gap-4 text-[13px] sm:grid-cols-3">
              <Info label="Workspace ID">
                <span className="num">{org.data.id}</span>
              </Info>
              <Info label="Created">{formatDate(org.data.createdAt)}</Info>
              <Info label="Departments">{org.data.departments.length}</Info>
            </dl>
          </SettingsSection>
          {canDelete && <DangerZone org={org.data} />}
        </>
      )}
    </SettingsLayout>
  )
}

function ProfileForm({ org }: { org: Organization }) {
  const canEdit = useCan('organization:update')
  const update = useUpdateOrganization()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: org.name, email: org.email } })
  const { errors, isDirty } = form.formState

  useEffect(() => form.reset({ name: org.name, email: org.email }), [org, form])

  const onSubmit = form.handleSubmit((body) =>
    update.mutateAsync({ id: org.id, body }).then(
      () => toast.success('Organization updated'),
      (err) => handleFormError(err, form.setError),
    ),
  )

  return (
    <form onSubmit={onSubmit} noValidate>
      <SettingsSection
        title="Organization profile"
        description={canEdit ? 'Shown across the workspace.' : 'Only owners and admins can change these.'}
        footer={
          canEdit && (
            <>
              {isDirty && (
                <Button type="button" variant="ghost" onClick={() => form.reset()}>
                  Discard
                </Button>
              )}
              <Button type="submit" variant="primary" disabled={!isDirty} loading={update.isPending}>
                Save
              </Button>
            </>
          )
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name?.message}>
            <Input disabled={!canEdit} {...form.register('name')} />
          </Field>
          <Field label="Contact email" error={errors.email?.message}>
            <Input type="email" disabled={!canEdit} {...form.register('email')} />
          </Field>
        </div>
      </SettingsSection>
    </form>
  )
}

function DangerZone({ org }: { org: Organization }) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const remove = useDeleteOrganization()

  const onDelete = () =>
    remove.mutate(org.id, {
      onSuccess: () => {
        setOpen(false)
        toast.success('Workspace deleted')
        authStore.signOut()
      },
      onError: (err) => {
        const e = toApiError(err)
        toast.error(
          e.status >= 500
            ? 'The workspace couldn’t be deleted. Remove its employees and pending invitations first.'
            : e.message,
        )
      },
    })

  return (
    <>
      <SettingsSection
        tone="danger"
        title="Delete workspace"
        description="Permanently removes this organization, its members and departments."
        footer={
          <Button
            variant="danger"
            onClick={() => {
              setTyped('')
              setOpen(true)
            }}
          >
            Delete workspace
          </Button>
        }
      >
        <p className="text-[13px] text-muted">This can’t be undone. Everyone will lose access immediately.</p>
      </SettingsSection>

      <Dialog
        open={open}
        onOpenChange={(o) => !remove.isPending && setOpen(o)}
        title="Delete this workspace?"
        description={
          <>
            Type <span className="font-medium text-foreground">{org.name}</span> to confirm.
          </>
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={remove.isPending}>
              Cancel
            </Button>
            <Button variant="danger" disabled={typed !== org.name} loading={remove.isPending} onClick={onDelete}>
              Delete forever
            </Button>
          </>
        }
      >
        <Input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={org.name} />
      </Dialog>
    </>
  )
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  )
}
