import { useState } from 'react'

interface ReminderModalProps {
  toName: string
  toEmail: string
  initialSubject: string
  initialBody: string
  onCancel: () => void
  onSend: (subject: string, body: string) => void
}

export function ReminderModal({
  toName,
  toEmail,
  initialSubject,
  initialBody,
  onCancel,
  onSend,
}: ReminderModalProps) {
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState(initialBody)

  const canSend = subject.trim().length > 0 && body.trim().length > 0

  return (
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="modal modal-wide"
        role="dialog"
        aria-labelledby="reminder-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="reminder-title">Send reminder</h2>
        <p className="muted">
          Email is mocked in this app — confirming will record the reminder and notify the
          recipient in-app.
        </p>
        <p className="muted small">
          To: <strong>{toName}</strong> &lt;{toEmail}&gt;
        </p>
        <label className="modal-field">
          Subject
          <input
            value={subject}
            autoFocus
            onChange={(e) => setSubject(e.target.value)}
          />
        </label>
        <label className="modal-field">
          Message
          <textarea
            className="reminder-body"
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        <div className="btn-row modal-actions">
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={!canSend}
            onClick={() => onSend(subject.trim(), body.trim())}
          >
            Send reminder email
          </button>
        </div>
      </div>
    </div>
  )
}
