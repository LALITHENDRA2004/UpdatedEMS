import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Organization, OrganizationUpdateRequest } from '@/types/api'

// Always /organizations/me — the bare /organizations list is not tenant-scoped on the backend.
export const orgKeys = { me: ['organization', 'me'] as const }

export function useMyOrganization() {
  return useQuery({
    queryKey: orgKeys.me,
    queryFn: async () => (await api.get<Organization>('/organizations/me')).data,
    staleTime: 5 * 60_000,
  })
}

export function useUpdateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: OrganizationUpdateRequest }) =>
      (await api.put<Organization>(`/organizations/${id}`, body)).data,
    onSuccess: (org) => qc.setQueryData(orgKeys.me, org),
  })
}

export function useDeleteOrganization() {
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/organizations/${id}`)
    },
  })
}
