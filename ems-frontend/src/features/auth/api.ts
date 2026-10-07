import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { authStore } from '@/auth/auth-store'
import type {
  AcceptInvitationRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/types/api'

async function login(body: LoginRequest) {
  const { data } = await api.post<LoginResponse>('/auth/login', body)
  return authStore.signIn(data.accessToken)
}

export function useLogin() {
  return useMutation({ mutationFn: login })
}

/** Register doesn't return a token, so sign in straight after with the same credentials. */
export function useRegister() {
  return useMutation({
    mutationFn: async (body: RegisterRequest) => {
      const { data } = await api.post<RegisterResponse>('/auth/register', body)
      await login({ email: body.ownerEmail, password: body.password })
      return data
    },
  })
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: async (body: AcceptInvitationRequest) => {
      await api.post('/invitations/accept', body)
    },
  })
}
