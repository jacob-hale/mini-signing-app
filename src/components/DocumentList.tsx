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
  const { documents, currentUser, createDraft, setView } = useAppState()

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
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
