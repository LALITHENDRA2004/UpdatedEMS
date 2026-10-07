import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initials(...parts: Array<string | null | undefined>) {
  return parts
    .map((p) => p?.trim()[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
