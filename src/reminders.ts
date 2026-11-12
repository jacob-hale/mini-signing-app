import type { DocumentInstance, ReminderEmail, User } from './types'

/**
 * Demo-friendly waits. In production these would be much longer
 * (e.g. 24h after send, 72h between reminders).
 */
export const REMINDER_WAIT_AFTER_SEND_MS = 15_000
export const REMINDER_COOLDOWN_MS = 30_000

export function getReminders(doc: DocumentInstance): ReminderEmail[] {
  return doc.reminders ?? []
}

export function lastReminderAt(doc: DocumentInstance): string | null {
  const list = getReminders(doc)
  if (list.length === 0) return null
  return list.reduce((latest, r) => (r.sentAt > latest ? r.sentAt : latest), list[0].sentAt)
}

export type ReminderGate =
  | { ok: true }
  | { ok: false; reason: string; retryAt: Date | null }

export function canSendReminder(
  doc: DocumentInstance,
  now: Date = new Date(),
): ReminderGate {
  if (doc.status !== 'sent') {
    return { ok: false, reason: 'Reminders are only for documents waiting on a signature.', retryAt: null }
  }
  if (!doc.sentAt) {
    return { ok: false, reason: 'Document has no send time.', retryAt: null }
  }
  if (!doc.recipientEmail) {
    return { ok: false, reason: 'Recipient has no email on file.', retryAt: null }
  }

  const sentAt = new Date(doc.sentAt).getTime()
  const eligibleAt = sentAt + REMINDER_WAIT_AFTER_SEND_MS
  if (now.getTime() < eligibleAt) {
    return {
      ok: false,
      reason: 'Wait a bit after sending before the first reminder.',
      retryAt: new Date(eligibleAt),
    }
  }

  const last = lastReminderAt(doc)
  if (last) {
    const next = new Date(last).getTime() + REMINDER_COOLDOWN_MS
    if (now.getTime() < next) {
      return {
        ok: false,
        reason: 'A reminder was just sent. Please wait before sending another.',
        retryAt: new Date(next),
      }
    }
  }

  return { ok: true }
}

export function formatRetryWait(retryAt: Date, now: Date = new Date()): string {
  const ms = Math.max(0, retryAt.getTime() - now.getTime())
  const secs = Math.ceil(ms / 1000)
  if (secs < 60) return `${secs}s`
  const mins = Math.ceil(secs / 60)
  return `${mins}m`
}

export function buildReminderDraft(
  doc: DocumentInstance,
  sender: User,
): { subject: string; body: string } {
  const recipientName = doc.recipientName ?? 'there'
  const sentLabel = doc.sentAt
    ? new Date(doc.sentAt).toLocaleString()
    : 'recently'
  const subject = `Reminder: please review “${doc.title}”`
  const body = [
    `Hi ${recipientName},`,
    '',
    `This is a friendly reminder that “${doc.title}” is waiting for your signature.`,
    `It was sent on ${sentLabel}.`,
    '',
    'Please open Sign Mini, switch to your user, and complete your fields when you can.',
    '',
    'Thanks,',
    sender.name,
    sender.email,
  ].join('\n')

  return { subject, body }
}
