import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import {
  EMPLOYEE_STATUSES,
  type Employee,
  type EmployeeQuery,
  type EmployeeRequest,
  type EmployeeStatus,
  type PageResponse,
} from '@/types/api'

export const employeeKeys = {
  all: ['employees'] as const,
  list: (q: EmployeeQuery) => ['employees', 'list', q] as const,
  count: (q: EmployeeQuery) => ['employees', 'count', q] as const,
  everything: ['employees', 'everything'] as const,
  detail: (id: number) => ['employees', 'detail', id] as const,
}

/** Drops empty filters so they're neither sent nor part of the cache key. */
function clean(q: EmployeeQuery): EmployeeQuery {
  return Object.fromEntries(Object.entries(q).filter(([, v]) => v !== undefined && v !== '')) as EmployeeQuery
}

async function fetchPage(q: EmployeeQuery) {
  return (await api.get<PageResponse<Employee>>('/employees', { params: clean(q) })).data
}

/** One server page. Keeps showing the previous page while the next one loads. */
export function useEmployeePage(query: EmployeeQuery, options: { enabled?: boolean } = {}) {
  const q = clean(query)
  return useQuery({
    queryKey: employeeKeys.list(q),
    queryFn: () => fetchPage(q),
    placeholderData: keepPreviousData,
    enabled: options.enabled,
  })
}

/** Per-status totals for the filter tabs: one `size=1` request each, reading `totalElements`. */
export function useEmployeeStatusCounts(filters: Pick<EmployeeQuery, 'name' | 'department'>) {
  const base = clean(filters)
  const keys = [undefined, ...EMPLOYEE_STATUSES] as const
  const results = useQueries({
    queries: keys.map((status) => {
      const q = clean({ ...base, status, size: 1 })
      return {
        queryKey: employeeKeys.count(q),
        queryFn: async () => (await fetchPage(q)).totalElements,
        placeholderData: keepPreviousData,
      }
    }),
  })
  return Object.fromEntries(keys.map((s, i) => [s ?? 'ALL', results[i].data])) as Record<
    EmployeeStatus | 'ALL',
    number | undefined
  >
}

const EVERYTHING_PAGE_SIZE = 100
const EVERYTHING_MAX_PAGES = 10

/**
 * Every employee, for organization-wide figures (dashboard). Pages through the API in parallel,
 * capped at 1,000 people; `truncated` says when the cap was hit.
 */
export function useAllEmployees() {
  return useQuery({
    queryKey: employeeKeys.everything,
    queryFn: async () => {
      const first = await fetchPage({ page: 0, size: EVERYTHING_PAGE_SIZE })
      const pages = Math.min(first.totalPages, EVERYTHING_MAX_PAGES)
      const rest = await Promise.all(
        Array.from({ length: Math.max(0, pages - 1) }, (_, i) => fetchPage({ page: i + 1, size: EVERYTHING_PAGE_SIZE })),
      )
      return {
        employees: [first, ...rest].flatMap((p) => p.content),
        total: first.totalElements,
        truncated: first.totalPages > EVERYTHING_MAX_PAGES,
      }
    },
  })
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: async () => (await api.get<Employee>(`/employees/${id}`)).data,
    enabled: Number.isFinite(id),
  })
}

/**
 * Lists, counts and the dashboard all depend on the same rows, so refresh them together.
 * Detail entries are left alone: refetching a just-deleted person's page would 404 before we navigate away.
 */
const invalidateCollections = (qc: QueryClient) =>
  qc.invalidateQueries({ queryKey: employeeKeys.all, predicate: (q) => q.queryKey[1] !== 'detail' })

export function useSaveEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: EmployeeRequest }) =>
      id
        ? (await api.put<Employee>(`/employees/${id}`, body)).data
        : (await api.post<Employee>('/employees', body)).data,
    onSuccess: (saved) => {
      qc.setQueryData(employeeKeys.detail(saved.id), saved)
      return invalidateCollections(qc)
    },
  })
}

export function useDeleteEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/employees/${id}`)
      return id
    },
    onSuccess: () => invalidateCollections(qc),
  })
}
