import type { FieldDef, FieldValues, Assignee } from './types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Accepts common formats: (555) 555-5555, 555-555-5555, +1 555 555 5555, etc. */
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/

export function validateFieldValue(
  field: FieldDef,
  value: string | undefined,
): string | null {
  const trimmed = (value ?? '').trim()

  if (field.required && !trimmed) {
    return `${field.label} is required`
  }
  if (!trimmed) return null

  switch (field.type) {
    case 'email':
      return EMAIL_RE.test(trimmed) ? null : 'Enter a valid email'
    case 'phone': {
      const digits = trimmed.replace(/\D/g, '')
      if (digits.length < 7 || digits.length > 15 || !PHONE_RE.test(trimmed)) {
        return 'Enter a valid phone number'
      }
      return null
    }
    default:
      return null
  }
}

export function validateAssigneeFields(
  fields: FieldDef[],
  values: FieldValues,
  assignee: Assignee,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of fields) {
    if (field.assignee !== assignee) continue
    // Auto-filled types are filled at send/complete time
    if (field.type === 'signerName' || (field.type === 'date' && field.autoDate)) {
      continue
    }
    const err = validateFieldValue(field, values[field.id])
    if (err) errors[field.id] = err
  }
  return errors
}

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10)
}
