import { AxiosError } from 'axios'

/**
 * The backend returns two error shapes:
 *  - GlobalExceptionHandler: { status, message, timestamp }
 *  - Spring's default /error: { status, error, path }   (security 401/403, bad JSON, 500s)
 * Bean-validation failures are flattened into one message: "field: msg, field2: msg2".
 */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface ErrorBody {
  status?: number
  message?: string
  error?: string
}

const FALLBACK: Record<number, string> = {
  0: 'Can’t reach the server. Check that the backend is running.',
  401: 'Your session has ended. Please sign in again.',
  403: 'You don’t have permission to do that.',
  404: 'We couldn’t find what you were looking for.',
  500: 'Something went wrong on our side. Please try again.',
}

function parseFieldErrors(message: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of message.split(', ')) {
    const idx = part.indexOf(': ')
    if (idx <= 0) return {}
    const field = part.slice(0, idx)
    if (!/^[a-zA-Z][\w.]*$/.test(field)) return {}
    out[field] = part.slice(idx + 2)
  }
  return out
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  if (err instanceof AxiosError) {
    const status = err.response?.status ?? 0
    const body = (err.response?.data ?? {}) as ErrorBody
    const raw = typeof body.message === 'string' ? body.message.trim() : undefined
    const fieldErrors = status === 400 && raw ? parseFieldErrors(raw) : {}
    const hasFieldErrors = Object.keys(fieldErrors).length > 0
    // 5xx messages are internal; never show them verbatim.
    const message = hasFieldErrors
      ? 'Please fix the highlighted fields.'
      : (status < 500 ? raw : undefined) || FALLBACK[status] || body.error || FALLBACK[500]
    return new ApiError(status, message, fieldErrors)
  }
  return new ApiError(0, err instanceof Error ? err.message : FALLBACK[500])
}

export const errorMessage = (err: unknown) => toApiError(err).message
