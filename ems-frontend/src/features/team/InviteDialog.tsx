import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, Clock } from 'lucide-react'
import { differenceInMinutes, parseISO } from 'date-fns'
import { useSession } from '@/auth/use-auth'
import { assignableRoles } from '@/auth/permissions'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/menu'
import { ease } from '@/components/feedback/motion'
import { toApiError } from '@/lib/errors'
import { handleFormError } from '@/lib/forms'
import { ROLE_LABEL } from '@/lib/format'
import { ROLES, type InvitationResponse } from '@/types/api'
import { useCreateInvitation } from './api'
import { ROLE_HINT } from './RoleBadge'

const schema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  role: z.enum(ROLES, { error: 'Pick a role' }),
})
type Values = z.infer<typeof schema>

export function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const session = useSession()
  const roles = assignableRoles(session?.role)
  const invite = useCreateInvitation()
  const [sent, setSent] = useState<InvitationResponse | null>(null)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'EMPLOYEE' },
  })

  // Start fresh each time the dialog opens (adjusting state during render, not in an effect).
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setSent(null)
  }
  useEffect(() => {
    if (open) form.reset({ email: '', role: 'EMPLOYEE' })
  }, [open, form])

  const onSubmit = form.handleSubmit((values) =>
    invite.mutateAsync(values).then(setSent, (err) => {
      const e = toApiError(err)
      if (e.status === 409) form.setError('email', { message: e.message })
      else handleFormError(err, form.setError)
    }),
  )

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={sent ? 'Invitation ready' : 'Invite a member'}
      description={sent ? undefined : 'They’ll get an account in this workspace with the role you choose.'}
      footer={
        sent ? (
          <>
            <Button variant="ghost" onClick={() => setSent(null)}>
              Invite another
            </Button>
            <Button variant="primary" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="invite-form" loading={invite.isPending}>
              Create invite link
            </Button>
          </>
        )
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease }}
          >
            <InviteLink invitation={sent} />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            id="invite-form"
            onSubmit={onSubmit}
            noValidate
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Field label="Email" error={form.formState.errors.email?.message}>
              <Input type="email" autoFocus placeholder="colleague@company.com" {...form.register('email')} />
            </Field>
            <Controller
              control={form.control}
              name="role"
              render={({ field, fieldState }) => (
                <Field label="Role" error={fieldState.error?.message}>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    options={roles.map((r) => ({ value: r, label: ROLE_LABEL[r], hint: ROLE_HINT[r] }))}
                  />
                </Field>
              )}
            />
          </motion.form>
        )}
      </AnimatePresence>
    </Dialog>
  )
}

function InviteLink({ invitation }: { invitation: InvitationResponse }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/accept-invite?token=${encodeURIComponent(invitation.invitationToken)}`
  const minutes = Math.max(0, differenceInMinutes(parseISO(invitation.expiresAt), new Date()))
  const hours = Math.floor(minutes / 60)

  const copy = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-muted">
        Send this link to <span className="font-medium text-foreground">{invitation.email}</span>. They’ll join as{' '}
        <span className="font-medium text-foreground">{ROLE_LABEL[invitation.role]}</span>.
      </p>
      <div className="flex items-center gap-2 rounded-md border border-border-strong bg-surface-2 p-1 pl-3">
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted">{link}</code>
        <Button size="sm" variant={copied ? 'secondary' : 'primary'} onClick={copy} className="w-[84px]">
          {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted">
        <Clock className="size-3.5" />
        Expires in {hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`}. Shown only once — copy it now.
      </p>
    </div>
  )
}
