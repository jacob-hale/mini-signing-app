import { useEffect, useState, type MouseEvent } from 'react'
import { ReminderModal } from './ReminderModal'
import { useAppState } from '../state/AppState'
import { getUserById } from '../data/users'
import {
  buildReminderDraft,
  canSendReminder,
  countUnreadReminders,
  formatRetryWait,
  getReminders,
} from '../reminders'
import type { DocumentInstance, DocumentStatus, ReminderEmail } from '../types'

function statusLabel(status: DocumentStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function roleFor(doc: DocumentInstance, userId: string): string {
  if (doc.senderId === userId) return 'Sender'
  if (doc.recipientId === userId) return 'Recipient'
  return '—'
}

export function DocumentList() {
  const { documents, currentUser, createDraft, setView, deleteDraft, updateDocument } =
    useAppState()
  const [pendingDelete, setPendingDelete] = useState<{
    id: string
    title: string
  } | null>(null)
  const [reminderDoc, setReminderDoc] = useState<DocumentInstance | null>(null)
  const [listBanner, setListBanner] = useState<{
    text: string
    tone: 'error' | 'ok'
  } | null>(null)
  const [nowTick, setNowTick] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const openReminder = (doc: DocumentInstance, e: MouseEvent) => {
    e.stopPropagation()
    const gate = canSendReminder(doc, new Date(nowTick))
    if (!gate.ok) {
      const wait = gate.retryAt
        ? ` Try again in ${formatRetryWait(gate.retryAt, new Date(nowTick))}.`
        : ''
      setListBanner({ text: `${gate.reason}${wait}`, tone: 'error' })
      return
    }
    setReminderDoc(doc)
  }

  const handleSendReminder = (subject: string, body: string) => {
    if (!reminderDoc) return
    const gate = canSendReminder(reminderDoc)
    if (!gate.ok) {
      setListBanner({ text: gate.reason, tone: 'error' })
      setReminderDoc(null)
      return
    }
    const toEmail = reminderDoc.recipientEmail
    const toName = reminderDoc.recipientName
    if (!toEmail || !toName) {
      setListBanner({ text: 'Recipient email is missing.', tone: 'error' })
      setReminderDoc(null)
      return
    }

    const reminder: ReminderEmail = {
      id: crypto.randomUUID(),
      sentAt: new Date().toISOString(),
      sentByUserId: currentUser.id,
      toEmail,
      toName,
      subject,
      body,
    }

    updateDocument({
      ...reminderDoc,
      reminders: [...getReminders(reminderDoc), reminder],
    })
    setReminderDoc(null)
    setListBanner({
      text: `Reminder emailed to ${toName} (mock send). They’ll see it when they open the document.`,
      tone: 'ok',
    })
  }

  const reminderDraft =
    reminderDoc != null ? buildReminderDraft(reminderDoc, currentUser) : null

  return (
    <div className="page-panel">
      <div className="page-panel-header">
        <div>
          <h1>Documents</h1>
          <p className="muted">
            Signed and drafts for {currentUser.name}. Only docs you sent or received appear here.
          </p>
        </div>
        <div className="btn-row">
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              const doc = createDraft({ usePreset: true })
              setView({ name: 'editor', documentId: doc.id })
            }}
          >
            New with MA preset
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              const doc = createDraft()
              setView({ name: 'editor', documentId: doc.id })
            }}
          >
            New blank draft
          </button>
        </div>
      </div>

      {listBanner && (
        <div
          className={`banner banner-${listBanner.tone}`}
          role={listBanner.tone === 'error' ? 'alert' : 'status'}
        >
          {listBanner.text}
          <button
            type="button"
            className="banner-dismiss"
            onClick={() => setListBanner(null)}
          >
            ×
          </button>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="empty-state">
          <p>No documents yet.</p>
          <p className="muted">
            Create a draft with the Master Agreement preset to place (or tweak) fields, fill sender
            fields, and send.
          </p>
        </div>
      ) : (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Your role</th>
              <th>Other party</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const other =
                doc.senderId === currentUser.id
                  ? doc.recipientName ??
                    (doc.recipientId ? getUserById(doc.recipientId)?.name : null) ??
                    '—'
                  : getUserById(doc.senderId)?.name ?? '—'
              const stamp = doc.completedAt ?? doc.sentAt ?? doc.createdAt
              const canDelete =
                doc.status === 'draft' && doc.senderId === currentUser.id
              const reminderGate = canSendReminder(doc, new Date(nowTick))
              const canRemind =
                doc.status === 'sent' && doc.senderId === currentUser.id
              const unreadReminders =
                doc.recipientId === currentUser.id ? countUnreadReminders(doc) : 0
              return (
                <tr
                  key={doc.id}
                  onClick={() => setView({ name: 'editor', documentId: doc.id })}
                >
                  <td>
                    <div className="title-with-blip">
                      <span>{doc.title}</span>
                      {unreadReminders > 0 && (
                        <span
                          className="reminder-blip"
                          title={`${unreadReminders} new reminder${unreadReminders === 1 ? '' : 's'}`}
                        >
                          {unreadReminders}
                        </span>
                      )}
                      {unreadReminders > 0 && (
                        <span className="reminder-blip-label">
                          {unreadReminders} new reminder
                          {unreadReminders === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge status-${doc.status}`}>{statusLabel(doc.status)}</span>
                  </td>
                  <td>{roleFor(doc, currentUser.id)}</td>
                  <td>{other}</td>
                  <td className="muted">{new Date(stamp).toLocaleString()}</td>
                  <td>
                    <div className="btn-row table-actions" onClick={(e) => e.stopPropagation()}>
                      {canRemind && (
                        <button
                          type="button"
                          className="btn secondary"
                          disabled={!reminderGate.ok}
                          title={
                            reminderGate.ok
                              ? 'Compose a reminder email'
                              : reminderGate.retryAt
                                ? `Available in ${formatRetryWait(reminderGate.retryAt, new Date(nowTick))}`
                                : reminderGate.reason
                          }
                          onClick={(e) => openReminder(doc, e)}
                        >
                          {reminderGate.ok
                            ? 'Send reminder'
                            : reminderGate.retryAt
                              ? `Remind in ${formatRetryWait(reminderGate.retryAt, new Date(nowTick))}`
                              : 'Send reminder'}
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          className="btn danger"
                          onClick={() =>
                            setPendingDelete({ id: doc.id, title: doc.title })
                          }
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {pendingDelete && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="modal"
            role="alertdialog"
            aria-labelledby="delete-draft-title"
            aria-describedby="delete-draft-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-draft-title">Delete draft?</h2>
            <p id="delete-draft-desc" className="muted">
              Are you sure you want to delete “{pendingDelete.title}”? This cannot be undone.
            </p>
            <div className="btn-row modal-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  deleteDraft(pendingDelete.id)
                  setPendingDelete(null)
                }}
              >
                Delete draft
              </button>
            </div>
          </div>
        </div>
      )}

      {reminderDoc && reminderDraft && reminderDoc.recipientEmail && reminderDoc.recipientName && (
        <ReminderModal
          toName={reminderDoc.recipientName}
          toEmail={reminderDoc.recipientEmail}
          initialSubject={reminderDraft.subject}
          initialBody={reminderDraft.body}
          onCancel={() => setReminderDoc(null)}
          onSend={handleSendReminder}
        />
      )}
    </div>
  )
}
