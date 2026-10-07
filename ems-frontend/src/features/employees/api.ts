import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Employee, EmployeeRequest } from '@/types/api'

export const employeeKeys = {
  all: ['employees'] as const,
  detail: (id: number) => ['employees', id] as const,
}

export function useEmployees() {
  return useQuery({
    queryKey: employeeKeys.all,
    queryFn: async () => (await api.get<Employee[]>('/employees')).data,
  })
}

export function useEmployee(id: number) {
  const qc = useQueryClient()
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: async () => (await api.get<Employee>(`/employees/${id}`)).data,
    // Seed from the list cache so the detail page paints instantly.
    initialData: () => qc.getQueryData<Employee[]>(employeeKeys.all)?.find((e) => e.id === id),
    enabled: Number.isFinite(id),
  })
}

export function useSaveEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: EmployeeRequest }) =>
      id
        ? (await api.put<Employee>(`/employees/${id}`, body)).data
        : (await api.post<Employee>('/employees', body)).data,
    onSuccess: (saved) => {
      qc.setQueryData(employeeKeys.detail(saved.id), saved)
      return qc.invalidateQueries({ queryKey: employeeKeys.all, exact: true })
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
    // Leave the detail cache alone: removing it while the detail page is still mounted
    // would trigger a refetch (and a 404) before we navigate away.
    onSuccess: (id) => qc.setQueryData<Employee[]>(employeeKeys.all, (old) => old?.filter((e) => e.id !== id)),
  })
}
