import { z } from 'zod'
import { toIsoDate } from '@/lib/format'
import type { Employee, EmployeeRequest } from '@/types/api'

// Mirrors CreateEmployeeRequest / UpdateEmployeeRequest validation.
export const employeeSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email').max(150),
  phone: z.string().trim().max(20, 'At most 20 characters'),
  jobTitle: z.string().trim().min(1, 'Job title is required').max(100),
  salary: z.number({ error: 'Enter a salary' }).min(0, 'Salary can’t be negative'),
  dateOfJoining: z
    .string()
    .min(1, 'Pick a joining date')
    .refine((d) => d <= toIsoDate(new Date()), 'Joining date can’t be in the future'),
  /** Select value: a department id, or NO_DEPARTMENT. */
  departmentId: z.string(),
})

export const NO_DEPARTMENT = 'none'

export type EmployeeFormValues = z.infer<typeof employeeSchema>

export const emptyEmployee = (): EmployeeFormValues => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  salary: Number.NaN,
  dateOfJoining: toIsoDate(new Date()),
  departmentId: NO_DEPARTMENT,
})

export const toFormValues = (e: Employee): EmployeeFormValues => ({
  firstName: e.firstName,
  lastName: e.lastName,
  email: e.email,
  phone: e.phone ?? '',
  jobTitle: e.jobTitle,
  salary: e.salary,
  dateOfJoining: e.dateOfJoining,
  departmentId: e.departmentId != null ? String(e.departmentId) : NO_DEPARTMENT,
})

/** Always sends departmentId: PUT is a full replace, so leaving it out would clear the department. */
export const toRequest = (v: EmployeeFormValues): EmployeeRequest => ({
  ...v,
  phone: v.phone || null,
  departmentId: v.departmentId === NO_DEPARTMENT ? null : Number(v.departmentId),
})
