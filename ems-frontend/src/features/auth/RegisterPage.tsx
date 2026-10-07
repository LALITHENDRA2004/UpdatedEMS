import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toApiError } from '@/lib/errors'
import { handleFormError } from '@/lib/forms'
import { cn } from '@/lib/utils'
import { ease } from '@/components/feedback/motion'
import { AuthLayout } from './AuthLayout'
import { PasswordInput } from './PasswordInput'
import { useRegister } from './api'
import { registerSchema, type RegisterValues } from './schemas'

const STEP_FIELDS = [
  ['organizationName', 'organizationEmail'],
  ['username', 'ownerEmail', 'password'],
] as const

// 409 messages from AuthService, mapped back to the field (and step) they belong to.
const CONFLICTS: Record<string, { field: keyof RegisterValues; step: 0 | 1 }> = {
  'Organization email already exists': { field: 'organizationEmail', step: 0 },
  'Username already exists': { field: 'username', step: 1 },
  'User email already exists': { field: 'ownerEmail', step: 1 },
}

export function RegisterPage() {
  const [step, setStep] = useState<0 | 1>(0)
  const register = useRegister()
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { organizationName: '', organizationEmail: '', username: '', ownerEmail: '', password: '' },
  })
  const { errors } = form.formState

  const next = async () => {
    if (await form.trigger(STEP_FIELDS[0])) setStep(1)
  }

  const onSubmit = form.handleSubmit(
    (values) =>
      register.mutateAsync(values).then(
        (res) => toast.success(`${res.organizationName} is ready. Welcome aboard.`),
        (err) => {
          const conflict = CONFLICTS[toApiError(err).message]
          if (conflict) {
            setStep(conflict.step)
            form.setError(conflict.field, { type: 'server', message: toApiError(err).message })
          } else {
            handleFormError(err, form.setError)
          }
        },
      ),
    (errs) => {
      if (STEP_FIELDS[0].some((f) => errs[f])) setStep(0)
    },
  )

  return (
    <AuthLayout
      title={step === 0 ? 'Create your workspace' : 'Set up your account'}
      subtitle={
        step === 0
          ? 'Start with your organization. You can invite your team afterwards.'
          : 'You’ll be the owner of this workspace.'
      }
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Steps step={step} />
      <form onSubmit={onSubmit} className="mt-6" noValidate>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 0 ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === 0 ? 12 : -12 }}
            transition={{ duration: 0.2, ease }}
            className="flex flex-col gap-4"
          >
            {step === 0 ? (
              <>
                <Field label="Organization name" error={errors.organizationName?.message}>
                  <Input autoFocus placeholder="Acme Industries" {...form.register('organizationName')} />
                </Field>
                <Field label="Organization email" error={errors.organizationEmail?.message} hint="Used for billing and notices.">
                  <Input type="email" placeholder="hello@acme.com" {...form.register('organizationEmail')} />
                </Field>
                <Button type="button" variant="primary" size="lg" className="mt-2" onClick={next}>
                  Continue <ArrowRight />
                </Button>
              </>
            ) : (
              <>
                <Field label="Username" error={errors.username?.message}>
                  <Input autoFocus autoComplete="username" placeholder="jane.doe" {...form.register('username')} />
                </Field>
                <Field label="Your work email" error={errors.ownerEmail?.message} hint="You’ll sign in with this.">
                  <Input type="email" autoComplete="email" placeholder="jane@acme.com" {...form.register('ownerEmail')} />
                </Field>
                <Field label="Password" error={errors.password?.message} hint="At least 8 characters.">
                  <PasswordInput autoComplete="new-password" {...form.register('password')} />
                </Field>
                <div className="mt-2 flex gap-2">
                  <Button type="button" size="lg" variant="ghost" onClick={() => setStep(0)}>
                    <ArrowLeft /> Back
                  </Button>
                  <Button type="submit" variant="primary" size="lg" className="flex-1" loading={register.isPending}>
                    Create workspace
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </form>
    </AuthLayout>
  )
}

function Steps({ step }: { step: 0 | 1 }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      {['Organization', 'Owner account'].map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          {i > 0 && <span className="h-px w-6 bg-border-strong" />}
          <span
            className={cn(
              'grid size-5 place-items-center rounded-full border font-mono text-[10px] transition-colors',
              i <= step ? 'border-accent bg-accent text-accent-fg' : 'border-border-strong text-subtle',
            )}
          >
            {i + 1}
          </span>
          <span className={cn(i === step ? 'font-medium text-foreground' : 'text-muted')}>{label}</span>
        </div>
      ))}
    </div>
  )
}
