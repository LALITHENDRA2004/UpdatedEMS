import axios from 'axios'
import { toApiError } from './errors'
import { authStore } from '@/auth/auth-store'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

api.interceptors.request.use((config) => {
  const token = authStore.getSnapshot()?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const apiError = toApiError(err)
    // A 401 on an authenticated request means the token is gone or invalid.
    if (apiError.status === 401 && authStore.getSnapshot()) {
      authStore.signOut('expired')
    }
    return Promise.reject(apiError)
  },
)
