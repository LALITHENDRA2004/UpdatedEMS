import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ArrowRight, CircleCheck, Link2Off } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toApiError } from '@/lib/errors'
import { handleFormError } from '@/lib/forms'
import { fadeUp } from '@/components/feedback/motion'
import { AuthLayout } from './AuthLayout'
import { PasswordInput } from './PasswordInput'
import { useAcceptInvitation } from './api'
import { acceptInviteSchema, type AcceptInviteValues } from './schemas'

export function AcceptInvitePage() {
  const [params] = useSearchParams()
  const token = params.get('token')?.trim() ?? ''
  const accept = useAcceptInvitation()
  const [result, setResult] = useState<'done' | { invalid: string } | null>(null)
  const form = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { username: '', password: '', confirm: '' },
  })
  const { errors } = form.formState

  const onSubmit = form.handleSubmit(({ username, password }) =>
    accept.mutateAsync({ token, username, password }).then(
      () => setResult('done'),
      (err) => {
        const e = toApiError(err)
        // 400s here are token problems (invalid / used / expired) — the form can't fix those.
        if (e.status === 400 && !Object.keys(e.fieldErrors).length) setResult({ invalid: e.message })
        else if (e.message === 'Username already exists') form.setError('username', { message: e.message })
        else handleFormError(err, form.setError)
      },
    ),
  )

  if (!token || (result && result !== 'done')) {
    return (
      <AuthLayout
        title="This invite can’t be used"
        subtitle={result && result !== 'done' ? result.invalid : 'The link is missing its invitation token.'}
      >
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-4 text-[13px] text-muted">
            <Link2Off className="mt-0.5 size-4 shrink-0" />
            Invitations expire after 24 hours and work once. Ask the person who invited you to send a fresh link.
          </div>
          <Button asChild size="lg">
            <Link to="/login">Go to sign in</Link>
          </Button>
        </motion.div>
      </AuthLayout>
    )
  }

  if (result === 'done') {
    return (
      <AuthLayout title="You’re in" subtitle="Your account is ready. Sign in with the email you were invited at.">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-accent/25 bg-accent-soft p-4 text-[13px] text-accent-soft-fg">
            <CircleCheck className="size-4 shrink-0" />
            Invitation accepted.
          </div>
          <Button asChild variant="primary" size="lg">
            <Link to="/login">
              Continue to sign in <ArrowRight />
            </Link>
          </Button>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Join your team" subtitle="You’ve been invited to a workspace. Choose how you’ll sign in.">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Username" error={errors.username?.message}>
          <Input autoFocus autoComplete="username" placeholder="jane.doe" {...form.register('username')} />
        </Field>
        <Field label="Password" error={errors.password?.message} hint="At least 8 characters.">
          <PasswordInput autoComplete="new-password" {...form.register('password')} />
        </Field>
        <Field label="Confirm password" error={errors.confirm?.message}>
          <PasswordInput autoComplete="new-password" {...form.register('confirm')} />
        </Field>
        <Button type="submit" variant="primary" size="lg" className="mt-2" loading={accept.isPending}>
          Accept invitation
        </Button>
      </form>
    </AuthLayout>
  )
}
