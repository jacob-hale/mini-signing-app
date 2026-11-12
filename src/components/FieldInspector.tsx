import type { Assignee, FieldDef, FieldType } from '../types'

const FIELD_TYPES: FieldType[] = [
  'text',
  'email',
  'phone',
  'date',
  'signature',
  'signerName',
]

interface FieldInspectorProps {
  field: FieldDef | null
  layoutLocked: boolean
  onChange: (field: FieldDef) => void
  onDelete: (id: string) => void
}

export function FieldInspector({
  field,
  layoutLocked,
  onChange,
  onDelete,
}: FieldInspectorProps) {
  if (!field) {
    return (
      <aside className="inspector">
        <h2>Field</h2>
        <p className="muted">
          {layoutLocked
            ? 'Layout is locked for this document.'
            : 'Click the page to place a field, or select an existing one.'}
        </p>
      </aside>
    )
  }

  const disabled = layoutLocked

  return (
    <aside className="inspector">
      <h2>Field</h2>
      <label>
        Label
        <input
          value={field.label}
          disabled={disabled}
          onChange={(e) => onChange({ ...field, label: e.target.value })}
        />
      </label>
      <label>
        Type
        <select
          value={field.type}
          disabled={disabled}
          onChange={(e) => {
            const type = e.target.value as FieldType
            onChange({
              ...field,
              type,
              autoDate: type === 'date' ? field.autoDate ?? true : undefined,
            })
          }}
        >
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label>
        Assignee
        <select
          value={field.assignee}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...field, assignee: e.target.value as Assignee })
          }
        >
          <option value="sender">Sender</option>
          <option value="recipient">Recipient</option>
        </select>
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={field.required}
          disabled={disabled}
          onChange={(e) => onChange({ ...field, required: e.target.checked })}
        />
        Required
      </label>
      {field.type === 'date' && (
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={!!field.autoDate}
            disabled={disabled}
            onChange={(e) => onChange({ ...field, autoDate: e.target.checked })}
          />
          Auto-fill with signing date
        </label>
      )}
      <p className="muted small">
        Page {field.position.pageIndex + 1} · {field.position.xPct.toFixed(1)}%,{' '}
        {field.position.yPct.toFixed(1)}%
      </p>
      {!disabled && (
        <button type="button" className="btn danger" onClick={() => onDelete(field.id)}>
          Delete field
        </button>
      )}
    </aside>
  )
}
