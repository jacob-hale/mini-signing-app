import type { FieldDef, FieldValues, Assignee } from '../types'

interface FieldOverlayProps {
  fields: FieldDef[]
  pageIndex: number
  values: FieldValues
  errors?: Record<string, string>
  /** Who is currently interacting */
  activeRole: Assignee | null
  layoutLocked: boolean
  valuesLockedFor: Assignee[]
  selectedFieldId: string | null
  onSelectField: (id: string | null) => void
  onChangeValue: (fieldId: string, value: string) => void
  placementMode: boolean
}

export function FieldOverlay({
  fields,
  pageIndex,
  values,
  errors = {},
  activeRole,
  layoutLocked,
  valuesLockedFor,
  selectedFieldId,
  onSelectField,
  onChangeValue,
  placementMode,
}: FieldOverlayProps) {
  const pageFields = fields.filter((f) => f.position.pageIndex === pageIndex)

  return (
    <>
      {pageFields.map((field) => {
        const { xPct, yPct, wPct, hPct } = field.position
        const isSelected = selectedFieldId === field.id
        const valueLocked =
          valuesLockedFor.includes(field.assignee) ||
          (activeRole !== null && field.assignee !== activeRole) ||
          field.type === 'signerName' ||
          (field.type === 'date' && field.autoDate && valuesLockedFor.includes(field.assignee))
        const canEditValue =
          !valueLocked &&
          activeRole === field.assignee &&
          field.type !== 'signerName' &&
          !(field.type === 'date' && field.autoDate)
        const err = errors[field.id]
        const value = values[field.id] ?? ''

        return (
          <div
            key={field.id}
            data-field-id={field.id}
            className={[
              'field-box',
              `assignee-${field.assignee}`,
              isSelected ? 'selected' : '',
              err ? 'has-error' : '',
              placementMode && !layoutLocked ? 'placement' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              left: `${xPct}%`,
              top: `${yPct}%`,
              width: `${wPct}%`,
              height: `${hPct}%`,
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (!layoutLocked) onSelectField(field.id)
            }}
            title={field.label}
          >
            <span className="field-label-chip">
              {field.label}
              {field.required ? ' *' : ''}
            </span>
            {field.type === 'signature' ? (
              canEditValue ? (
                <input
                  className="field-input signature-input"
                  value={value}
                  placeholder="Type full name"
                  onChange={(e) => onChangeValue(field.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="signature-display">{value || '—'}</span>
              )
            ) : canEditValue ? (
              <input
                className="field-input"
                type={field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'}
                value={value}
                placeholder={field.label}
                onChange={(e) => onChangeValue(field.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="field-value-readonly">
                {value || (field.type === 'date' && field.autoDate ? '(auto date)' : '—')}
              </span>
            )}
            {err && <span className="field-error">{err}</span>}
          </div>
        )
      })}
    </>
  )
}
