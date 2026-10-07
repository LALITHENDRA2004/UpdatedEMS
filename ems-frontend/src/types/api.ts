// Mirrors the DTOs in ems-backend (net.javaguides.ems.dto / entity). Keep field names in sync.

export const ROLES = ['OWNER', 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] as const
export type Role = (typeof ROLES)[number]

export const EMPLOYEE_STATUSES = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'] as const
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number]

/** LocalDateTime serialized without zone, e.g. "2026-10-07T13:57:01.123456" */
export type IsoDateTime = string
/** LocalDate, e.g. "2026-10-07" */
export type IsoDate = string

export interface RegisterRequest {
  organizationName: string
  organizationEmail: string
  username: string
  ownerEmail: string
  password: string
}

export interface RegisterResponse {
  organizationId: number
  organizationName: string
  userId: number
  username: string
  email: string
  role: Role
  message: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

export interface EmployeeRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  jobTitle: string
  salary: number
  dateOfJoining: IsoDate
  /** Optional. PUT is a full replace, so omitting it clears the department. */
  departmentId?: number | null
}

export interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  jobTitle: string
  salary: number
  dateOfJoining: IsoDate
  status: EmployeeStatus
  organizationId: number
  departmentId: number | null
  departmentName: string | null
}

/** Spring page wrapper returned by paginated endpoints (ems-backend dto/PageResponse). */
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

/** Sort fields the backend accepts (EmployeeService.ALLOWED_SORT_FIELDS); anything else is a 400. */
export const EMPLOYEE_SORT_FIELDS = ['firstName', 'lastName', 'email', 'salary', 'dateOfJoining', 'status'] as const
export type EmployeeSortField = (typeof EMPLOYEE_SORT_FIELDS)[number]

export interface EmployeeQuery {
  /** Matches first or last name (contains, case-insensitive). */
  name?: string
  /** Department name (case-insensitive exact match). */
  department?: string
  status?: EmployeeStatus
  page?: number
  /** 1–100 */
  size?: number
  sort?: EmployeeSortField
  direction?: 'asc' | 'desc'
}

export interface DepartmentRequest {
  name: string
}

export interface Department {
  id: number
  name: string
  organizationId: number
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}

export interface User {
  id: number
  username: string
  email: string
  role: Role
  organizationId: number
  createdAt: IsoDateTime
}

export interface InvitationRequest {
  email: string
  role: Role
}

export interface InvitationResponse {
  id: number
  email: string
  role: Role
  invitationToken: string
  expiresAt: IsoDateTime
  message: string
}

export interface AcceptInvitationRequest {
  token: string
  username: string
  password: string
}

export interface Organization {
  id: number
  name: string
  email: string
  departments: Array<Pick<Department, 'id' | 'name' | 'createdAt' | 'updatedAt'>>
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
}

export interface OrganizationUpdateRequest {
  name: string
  email: string
}
