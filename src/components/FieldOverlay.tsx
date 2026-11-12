import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
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
  onMoveField?: (fieldId: string, xPct: number, yPct: number) => void
  placementMode: boolean
}

function isAutoFilledField(field: FieldDef): boolean {
  return field.type === 'signerName' || (field.type === 'date' && !!field.autoDate)
}

function autoPlaceholder(field: FieldDef): string {
  if (field.type === 'signerName') return 'Auto: print name'
  if (field.type === 'date' && field.autoDate) return 'Auto: signing date'
  return '—'
}

interface DragState {
  fieldId: string
  startClientX: number
  startClientY: number
  originXPct: number
  originYPct: number
  wPct: number
  hPct: number
  pageWidth: number
  pageHeight: number
  moved: boolean
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
  onMoveField,
  placementMode,
}: FieldOverlayProps) {
  const pageFields = fields.filter((f) => f.position.pageIndex === pageIndex)
  const dragRef = useRef<DragState | null>(null)
  const [livePos, setLivePos] = useState<{
    fieldId: string
    xPct: number
    yPct: number
  } | null>(null)

  const canDrag = placementMode && !layoutLocked && !!onMoveField

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value))

  const onPointerDown = (
    field: FieldDef,
    e: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (!canDrag) return
    // Don't start a field drag from inside an input
    if ((e.target as HTMLElement).closest('input, textarea, select, button')) {
      return
    }

    const page = (e.currentTarget as HTMLElement).closest(
      '.page-surface',
    ) as HTMLElement | null
    if (!page) return

    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)

    const rect = page.getBoundingClientRect()
    dragRef.current = {
      fieldId: field.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      originXPct: field.position.xPct,
      originYPct: field.position.yPct,
      wPct: field.position.wPct,
      hPct: field.position.hPct,
      pageWidth: rect.width,
      pageHeight: rect.height,
      moved: false,
    }
    onSelectField(field.id)
    setLivePos({
      fieldId: field.id,
      xPct: field.position.xPct,
      yPct: field.position.yPct,
    })
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.fieldId !== e.currentTarget.dataset.fieldId) return

    const dxPct = ((e.clientX - drag.startClientX) / drag.pageWidth) * 100
    const dyPct = ((e.clientY - drag.startClientY) / drag.pageHeight) * 100
    if (Math.abs(dxPct) > 0.3 || Math.abs(dyPct) > 0.3) {
      drag.moved = true
    }

    const xPct = clamp(drag.originXPct + dxPct, 0, 100 - drag.wPct)
    const yPct = clamp(drag.originYPct + dyPct, 0, 100 - drag.hPct)
    setLivePos({ fieldId: drag.fieldId, xPct, yPct })
  }

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.fieldId !== e.currentTarget.dataset.fieldId) return

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // ignore if already released
    }

    if (drag.moved && livePos && livePos.fieldId === drag.fieldId && onMoveField) {
      onMoveField(drag.fieldId, livePos.xPct, livePos.yPct)
    } else if (!layoutLocked) {
      onSelectField(drag.fieldId)
    }

    dragRef.current = null
    setLivePos(null)
  }

  return (
    <>
      {pageFields.map((field) => {
        const live =
          livePos && livePos.fieldId === field.id
            ? livePos
            : null
        const xPct = live?.xPct ?? field.position.xPct
        const yPct = live?.yPct ?? field.position.yPct
        const { wPct, hPct } = field.position
        const isSelected = selectedFieldId === field.id
        const isDragging = livePos?.fieldId === field.id
        const autoField = isAutoFilledField(field)
        const valueLocked =
          valuesLockedFor.includes(field.assignee) ||
          (activeRole !== null && field.assignee !== activeRole) ||
          autoField
        const canEditValue =
          !valueLocked &&
          activeRole === field.assignee &&
          !autoField
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
              autoField ? 'field-auto' : '',
              placementMode && !layoutLocked ? 'placement' : '',
              canDrag ? 'draggable' : '',
              isDragging ? 'dragging' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              left: `${xPct}%`,
              top: `${yPct}%`,
              width: `${wPct}%`,
              height: `${hPct}%`,
            }}
            onPointerDown={(e) => onPointerDown(field, e)}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClick={(e) => {
              e.stopPropagation()
              // Selection handled on pointer up when not dragging
            }}
            title={
              canDrag
                ? `${field.label} — drag to move`
                : autoField
                  ? `${field.label} — filled automatically when this person sends or finishes`
                  : field.label
            }
          >
            <span className="field-label-chip">
              {field.label}
              {field.required ? ' *' : ''}
              {autoField ? ' · Auto' : ''}
            </span>
            {field.type === 'signature' ? (
              canEditValue ? (
                <input
                  className="field-input signature-input"
                  value={value}
                  placeholder="Type full name"
                  onChange={(e) => onChangeValue(field.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
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
                onPointerDown={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className={
                  autoField && !value
                    ? 'field-value-readonly field-auto-placeholder'
                    : 'field-value-readonly'
                }
              >
                {value || (autoField ? autoPlaceholder(field) : '—')}
              </span>
            )}
            {err && <span className="field-error">{err}</span>}
          </div>
        )
      })}
    </>
  )
}
