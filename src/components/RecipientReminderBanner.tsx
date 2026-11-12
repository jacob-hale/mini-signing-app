import { useState } from 'react'
import { getUserById } from '../data/users'
import type { ReminderEmail } from '../types'

interface Props {
  reminders: ReminderEmail[]
}

export function RecipientReminderBanner({ reminders }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(
    reminders.length > 0 ? reminders[reminders.length - 1].id : null,
  )

  if (reminders.length === 0) return null

  const newestFirst = [...reminders].reverse()
  const fromName =
    getUserById(newestFirst[0].sentByUserId)?.name ?? 'sender'

  return (
    <div className="banner banner-reminder reminder-collapsible" role="status">
      <div className="reminder-collapsible-main">
        <div className="reminder-collapsible-text">
          <strong>
            {reminders.length === 1
              ? `Reminder from ${fromName}`
              : `${reminders.length} reminders from ${fromName}`}
          </strong>
          <div className="muted small">
            Open any message below to read the full email.
          </div>
        </div>
      </div>
      <ul className="reminder-inbox">
        {newestFirst.map((reminder, index) => {
          const open = expandedId === reminder.id
          return (
            <li key={reminder.id} className="reminder-inbox-item">
              <div className="reminder-collapsible-main">
                <div className="reminder-collapsible-text">
                  <div className="reminder-inbox-meta">
                    {index === 0 && reminders.length > 1 && (
                      <span className="reminder-inbox-latest">Latest</span>
                    )}
                    <span className="muted small">
                      {new Date(reminder.sentAt).toLocaleString()}
                    </span>
                  </div>
                  <div>{reminder.subject}</div>
                </div>
                <button
                  type="button"
                  className="btn secondary reminder-toggle"
                  onClick={() =>
                    setExpandedId((id) => (id === reminder.id ? null : reminder.id))
                  }
                  aria-expanded={open}
                >
                  {open ? 'Hide message' : 'Show message'}
                </button>
              </div>
              {open && <pre className="reminder-preview">{reminder.body}</pre>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
