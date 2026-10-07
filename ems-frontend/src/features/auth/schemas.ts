import { z } from 'zod'

// Limits mirror the bean-validation annotations on the backend DTOs.
const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email').max(150)
const password = z.string().min(8, 'At least 8 characters').max(100, 'At most 100 characters')
const username = z
  .string()
  .trim()
  .min(3, 'At least 3 characters')
  .max(50, 'At most 50 characters')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerOrgSchema = z.object({
  organizationName: z.string().trim().min(1, 'Organization name is required').max(100),
  organizationEmail: email,
})

export const registerOwnerSchema = z.object({
  username,
  ownerEmail: email,
  password,
})

export const registerSchema = registerOrgSchema.extend(registerOwnerSchema.shape)
export type RegisterValues = z.infer<typeof registerSchema>

export const acceptInviteSchema = z
  .object({ username, password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords don’t match' })
export type AcceptInviteValues = z.infer<typeof acceptInviteSchema>
