import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Assignee, FieldDef, FieldType } from '../types'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'date', label: 'Date' },
  { value: 'signature', label: 'Signature' },
  { value: 'signerName', label: 'Signer Name' },
]

interface FieldInspectorProps {
  field: FieldDef | null
  layoutLocked: boolean
  onChange: (field: FieldDef) => void
  onDelete: (id: string) => void
  onClose: () => void
}

interface PopoverPos {
  top: number
  left: number
}

export function FieldInspector({
  field,
  layoutLocked,
  onChange,
  onDelete,
  onClose,
}: FieldInspectorProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<PopoverPos | null>(null)

  const fieldId = field?.id ?? null

  useLayoutEffect(() => {
    if (!fieldId) {
      setPos(null)
      return
    }

    const place = () => {
      const anchor = document.querySelector(
        `[data-field-id="${fieldId}"]`,
      ) as HTMLElement | null
      const panel = panelRef.current
      if (!anchor || !panel) return

      const rect = anchor.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
      const gap = 8
      const vw = window.innerWidth
      const vh = window.innerHeight

      let left = rect.right + gap
      let top = rect.top

      // Prefer right of field; flip left if it would overflow
      if (left + panelRect.width > vw - 12) {
        left = rect.left - panelRect.width - gap
      }
      if (left < 12) left = 12

      // Keep vertical in viewport
      if (top + panelRect.height > vh - 12) {
        top = Math.max(12, vh - panelRect.height - 12)
      }
      if (top < 12) top = 12

      setPos({ top, left })
    }

    // Wait a frame so a newly placed field is in the DOM with layout
    const raf = requestAnimationFrame(place)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [fieldId])

  useEffect(() => {
    if (!field) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [field, onClose])

  if (!field) return null

  const disabled = layoutLocked

  return (
    <div
      ref={panelRef}
      className="field-popover"
      style={
        pos
          ? { top: pos.top, left: pos.left, visibility: 'visible' }
          : { top: 0, left: 0, visibility: 'hidden' }
      }
      role="dialog"
      aria-label="Edit Field"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="field-popover-header">
        <strong>Edit Field</strong>
        <button
          type="button"
          className="field-popover-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <label>
        Label
        <input
          value={field.label}
          disabled={disabled}
          autoFocus
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
            <option key={t.value} value={t.value}>
              {t.label}
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
      {(field.type === 'signerName' ||
        (field.type === 'date' && field.autoDate)) && (
        <p className="auto-hint">
          Filled automatically when this assignee sends or finishes — they don’t type it.
        </p>
      )}
      {!disabled && (
        <button
          type="button"
          className="btn danger"
          onClick={() => {
            onDelete(field.id)
            onClose()
          }}
        >
          Delete field
        </button>
      )}
    </div>
  )
}
