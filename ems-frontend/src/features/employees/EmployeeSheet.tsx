import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet } from '@/components/ui/dialog'
import { toApiError } from '@/lib/errors'
import { handleFormError } from '@/lib/forms'
import { toIsoDate } from '@/lib/format'
import type { Employee } from '@/types/api'
import { useSaveEmployee } from './api'
import { employeeSchema, emptyEmployee, toFormValues, toRequest, type EmployeeFormValues } from './schemas'

interface EmployeeSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing. */
  employee?: Employee
  onSaved?: (e: Employee) => void
}

export function EmployeeSheet({ open, onOpenChange, employee, onSaved }: EmployeeSheetProps) {
  const save = useSaveEmployee()
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee ? toFormValues(employee) : emptyEmployee(),
  })
  const { errors, isDirty } = form.formState

  // Re-seed every time the sheet opens (create vs. a different employee).
  useEffect(() => {
    if (open) form.reset(employee ? toFormValues(employee) : emptyEmployee())
  }, [open, employee, form])

  const onSubmit = form.handleSubmit((values) =>
    save.mutateAsync({ id: employee?.id, body: toRequest(values) }).then(
      (saved) => {
        toast.success(employee ? 'Changes saved' : `${saved.firstName} ${saved.lastName} added`)
        onOpenChange(false)
        onSaved?.(saved)
      },
      (err) => {
        // Duplicate email inside the org comes back as a 409.
        if (toApiError(err).status === 409) form.setError('email', { message: toApiError(err).message })
        else handleFormError(err, form.setError)
      },
    ),
  )

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={employee ? 'Edit employee' : 'New employee'}
      description={employee ? `${employee.firstName} ${employee.lastName}` : 'Add someone to your organization.'}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="employee-form"
            loading={save.isPending}
            disabled={!!employee && !isDirty}
          >
            {employee ? 'Save changes' : 'Add employee'}
          </Button>
        </>
      }
    >
      <form id="employee-form" onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
        <Section title="Person">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" error={errors.firstName?.message}>
              <Input autoFocus {...form.register('firstName')} />
            </Field>
            <Field label="Last name" error={errors.lastName?.message}>
              <Input {...form.register('lastName')} />
            </Field>
          </div>
          <Field label="Work email" error={errors.email?.message}>
            <Input type="email" placeholder="name@company.com" {...form.register('email')} />
          </Field>
          <Field label="Phone" optional error={errors.phone?.message}>
            <Input type="tel" placeholder="+91 98765 43210" {...form.register('phone')} />
          </Field>
        </Section>

        <Section title="Role">
          <Field label="Job title" error={errors.jobTitle?.message}>
            <Input placeholder="e.g. Senior Accountant" {...form.register('jobTitle')} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Annual salary" error={errors.salary?.message}>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="1000"
                leading={<span className="text-[13px]">₹</span>}
                className="num"
                {...form.register('salary', { valueAsNumber: true })}
              />
            </Field>
            <Field label="Joined on" error={errors.dateOfJoining?.message}>
              <Input type="date" max={toIsoDate(new Date())} {...form.register('dateOfJoining')} />
            </Field>
          </div>
        </Section>
      </form>
    </Sheet>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-3 text-xs font-medium uppercase tracking-[0.06em] text-subtle">{title}</legend>
      {children}
    </fieldset>
  )
}
