import { useRef, type MouseEvent } from 'react'
import type { FieldDef, FieldValues, Assignee } from '../types'
import { FieldOverlay } from './FieldOverlay'

interface DocumentViewerProps {
  pages: string[]
  fields: FieldDef[]
  values: FieldValues
  errors?: Record<string, string>
  activeRole: Assignee | null
  layoutLocked: boolean
  valuesLockedFor: Assignee[]
  selectedFieldId: string | null
  onSelectField: (id: string | null) => void
  onChangeValue: (fieldId: string, value: string) => void
  onMoveField?: (fieldId: string, xPct: number, yPct: number) => void
  placementMode: boolean
  onPlaceField?: (pageIndex: number, xPct: number, yPct: number) => void
}

export function DocumentViewer({
  pages,
  fields,
  values,
  errors,
  activeRole,
  layoutLocked,
  valuesLockedFor,
  selectedFieldId,
  onSelectField,
  onChangeValue,
  onMoveField,
  placementMode,
  onPlaceField,
}: DocumentViewerProps) {
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])

  const handlePageClick = (pageIndex: number, e: MouseEvent<HTMLDivElement>) => {
    if (!placementMode || layoutLocked || !onPlaceField) return
    const el = pageRefs.current[pageIndex]
    if (!el) return
    const rect = el.getBoundingClientRect()
    const xPct = ((e.clientX - rect.left) / rect.width) * 100
    const yPct = ((e.clientY - rect.top) / rect.height) * 100
    onPlaceField(pageIndex, xPct, yPct)
  }

  return (
    <div className="document-viewer">
      {pages.map((src, pageIndex) => (
        <div key={src} className="page-wrap">
          <div className="page-caption">Page {pageIndex + 1}</div>
          <div
            className={`page-surface ${placementMode && !layoutLocked ? 'placing' : ''}`}
            ref={(el) => {
              pageRefs.current[pageIndex] = el
            }}
            onClick={(e) => handlePageClick(pageIndex, e)}
          >
            <img src={src} alt={`Page ${pageIndex + 1}`} className="page-image" draggable={false} />
            <FieldOverlay
              fields={fields}
              pageIndex={pageIndex}
              values={values}
              errors={errors}
              activeRole={activeRole}
              layoutLocked={layoutLocked}
              valuesLockedFor={valuesLockedFor}
              selectedFieldId={selectedFieldId}
              onSelectField={onSelectField}
              onChangeValue={onChangeValue}
              onMoveField={onMoveField}
              placementMode={placementMode}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
