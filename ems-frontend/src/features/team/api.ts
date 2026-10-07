import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { InvitationRequest, InvitationResponse, Role, User } from '@/types/api'

export const userKeys = { all: ['users'] as const }

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: async () => (await api.get<User[]>('/users')).data,
    enabled,
  })
}

/** Role is a query param on this endpoint, not a JSON body. Optimistic, rolls back on error. */
export function useChangeRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role }: { id: number; role: Role }) => {
      await api.put(`/users/${id}/role`, null, { params: { role } })
    },
    onMutate: async ({ id, role }) => {
      await qc.cancelQueries({ queryKey: userKeys.all })
      const previous = qc.getQueryData<User[]>(userKeys.all)
      qc.setQueryData<User[]>(userKeys.all, (old) => old?.map((u) => (u.id === id ? { ...u, role } : u)))
      return { previous }
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(userKeys.all, ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useCreateInvitation() {
  return useMutation({
    mutationFn: async (body: InvitationRequest) => (await api.post<InvitationResponse>('/invitations', body)).data,
  })
}
