import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { toast } from 'sonner'
import { toApiError } from './errors'

/**
 * Maps a backend error onto a react-hook-form form: validation messages land under their fields,
 * anything else becomes a toast. `fieldAliases` maps backend field names to form field names.
 */
export function handleFormError<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fieldAliases: Partial<Record<string, Path<T>>> = {},
) {
  const apiError = toApiError(err)
  const entries = Object.entries(apiError.fieldErrors)
  if (entries.length) {
    for (const [field, message] of entries) {
      setError(fieldAliases[field] ?? (field as Path<T>), { type: 'server', message })
    }
    return
  }
  toast.error(apiError.message)
}
