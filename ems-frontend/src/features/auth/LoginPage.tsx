import { Link, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toApiError } from '@/lib/errors'
import { handleFormError } from '@/lib/forms'
import { AuthLayout } from './AuthLayout'
import { PasswordInput } from './PasswordInput'
import { useLogin } from './api'
import { loginSchema, type LoginValues } from './schemas'

export function LoginPage() {
  const [params] = useSearchParams()
  const login = useLogin()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: params.get('email') ?? '', password: '' },
  })
  const { errors } = form.formState

  const onSubmit = form.handleSubmit((values) =>
    login.mutateAsync(values).catch((err) => {
      // Bad credentials belong next to the form, not in a toast that outlives the page.
      if (toApiError(err).status === 401) form.setError('root', { message: toApiError(err).message })
      else handleFormError(err, form.setError)
    }),
  )

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back. Use the email your workspace knows you by."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create a workspace
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {errors.root && (
          <p role="alert" className="rounded-md border border-danger/25 bg-danger-soft px-3 py-2 text-[13px] text-danger">
            {errors.root.message}
          </p>
        )}
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" autoFocus placeholder="you@company.com" {...form.register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <PasswordInput autoComplete="current-password" placeholder="••••••••" {...form.register('password')} />
        </Field>
        <Button type="submit" variant="primary" size="lg" className="mt-2" loading={login.isPending}>
          Continue <ArrowRight />
        </Button>
      </form>
    </AuthLayout>
  )
}
