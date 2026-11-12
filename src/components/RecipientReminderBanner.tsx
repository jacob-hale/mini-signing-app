import { useState } from 'react'
import { getUserById } from '../data/users'
import type { ReminderEmail } from '../types'

interface Props {
  reminder: ReminderEmail
}

export function RecipientReminderBanner({ reminder }: Props) {
  const [expanded, setExpanded] = useState(false)
  const fromName = getUserById(reminder.sentByUserId)?.name ?? 'sender'

  return (
    <div className="banner banner-reminder reminder-collapsible" role="status">
      <div className="reminder-collapsible-main">
        <div className="reminder-collapsible-text">
          <strong>Reminder from {fromName}</strong>
          <div className="muted small">
            {new Date(reminder.sentAt).toLocaleString()} · {reminder.subject}
          </div>
        </div>
        <button
          type="button"
          className="btn secondary reminder-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? 'Hide message' : 'Show message'}
        </button>
      </div>
      {expanded && <pre className="reminder-preview">{reminder.body}</pre>}
    </div>
  )
}
