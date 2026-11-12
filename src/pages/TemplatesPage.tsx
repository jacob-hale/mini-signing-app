import { useAppState } from '../state/AppState'
import { getUserById } from '../data/users'

export function TemplatesPage() {
  const { templates, createDraft, setView, deleteTemplate, currentUser } = useAppState()

  return (
    <div className="page-panel">
      <div className="page-panel-header">
        <div>
          <h1>Templates</h1>
          <p className="muted">
            Saved field layouts. Creating from a template starts a fresh draft with empty values.
          </p>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="empty-state">
          <p>No templates yet.</p>
          <p className="muted">
            Open a draft, place fields (or use the MA preset), then click “Save as template”.
          </p>
        </div>
      ) : (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Fields</th>
              <th>Created by</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.fields.length}</td>
                <td>{getUserById(t.createdByUserId)?.name ?? '—'}</td>
                <td className="muted">{new Date(t.createdAt).toLocaleString()}</td>
                <td>
                  <div className="btn-row">
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() => {
                        const doc = createDraft({ fromTemplateId: t.id })
                        setView({ name: 'editor', documentId: doc.id })
                      }}
                    >
                      New from template
                    </button>
                    {t.createdByUserId === currentUser.id && (
                      <button
                        type="button"
                        className="btn danger"
                        onClick={() => deleteTemplate(t.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
