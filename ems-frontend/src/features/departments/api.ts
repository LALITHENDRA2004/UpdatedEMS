import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Department } from '@/types/api'

export const departmentKeys = { all: ['departments'] as const }

export function useDepartments() {
  return useQuery({
    queryKey: departmentKeys.all,
    queryFn: async () => (await api.get<Department[]>('/departments')).data,
  })
}

export function useSaveDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id?: number; name: string }) =>
      id
        ? (await api.put<Department>(`/departments/${id}`, { name })).data
        : (await api.post<Department>('/departments', { name })).data,
    onSuccess: () => {
      // Employee rows carry the department name, so a rename must refresh them too.
      qc.invalidateQueries({ queryKey: ['employees'] })
      return qc.invalidateQueries({ queryKey: departmentKeys.all })
    },
  })
}

export function useDeleteDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/departments/${id}`)
      return id
    },
    onSuccess: (id) => {
      qc.setQueryData<Department[]>(departmentKeys.all, (old) => old?.filter((d) => d.id !== id))
      qc.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}
