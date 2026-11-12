import { useState } from 'react'
import { useAppState } from '../state/AppState'
import { getUserById } from '../data/users'
import type { DocumentInstance, DocumentStatus } from '../types'

function statusLabel(status: DocumentStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function roleFor(doc: DocumentInstance, userId: string): string {
  if (doc.senderId === userId) return 'Sender'
  if (doc.recipientId === userId) return 'Recipient'
  return '—'
}

export function DocumentList() {
  const { documents, currentUser, createDraft, setView, deleteDraft } = useAppState()
  const [pendingDelete, setPendingDelete] = useState<{
    id: string
    title: string
  } | null>(null)

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
              return (
                <tr
                  key={doc.id}
                  onClick={() => setView({ name: 'editor', documentId: doc.id })}
                >
                  <td>{doc.title}</td>
                  <td>
                    <span className={`badge status-${doc.status}`}>{statusLabel(doc.status)}</span>
                  </td>
                  <td>{roleFor(doc, currentUser.id)}</td>
                  <td>{other}</td>
                  <td className="muted">{new Date(stamp).toLocaleString()}</td>
                  <td>
                    {canDelete && (
                      <button
                        type="button"
                        className="btn danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPendingDelete({ id: doc.id, title: doc.title })
                        }}
                      >
                        Delete
                      </button>
                    )}
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
    </div>
  )
}
