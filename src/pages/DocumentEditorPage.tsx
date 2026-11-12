import { useState } from 'react'
import { DocumentViewer } from '../components/DocumentViewer'
import { FieldInspector } from '../components/FieldInspector'
import { getSourceDocument } from '../data/sampleDoc'
import { getUserById, USERS } from '../data/users'
import { documentRepo } from '../repo/documentRepo'
import { applyAutoFills, useAppState } from '../state/AppState'
import {
  hasTitleSuffix,
  joinTitle,
  splitTitle,
  withRecipientSuffix,
} from '../title'
import type { Assignee, DocumentInstance, FieldDef } from '../types'
import { validateAssigneeFields } from '../validation'

interface Props {
  documentId: string
}

export function DocumentEditorPage({ documentId }: Props) {
  const { currentUser, updateDocument, saveAsTemplate, setView } = useAppState()
  const [version, setVersion] = useState(0)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [recipientChoice, setRecipientChoice] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [banner, setBanner] = useState<{
    text: string
    tone: 'error' | 'ok'
  } | null>(null)

  void version
  const document = documentRepo.getDocument(documentId)

  if (!document) {
    return (
      <div className="page-panel">
        <p>Document not found.</p>
        <button type="button" className="btn" onClick={() => setView({ name: 'list' })}>
          Back
        </button>
      </div>
    )
  }

  const source = getSourceDocument(document.sourceDocumentId)
  const isSender = document.senderId === currentUser.id
  const isRecipient = document.recipientId === currentUser.id
  const layoutLocked = document.status !== 'draft'
  const valuesLockedFor: Assignee[] =
    document.status === 'completed'
      ? ['sender', 'recipient']
      : document.status === 'sent'
        ? ['sender']
        : []

  let activeRole: Assignee | null = null
  if (document.status === 'draft' && isSender) activeRole = 'sender'
  if (document.status === 'sent' && isRecipient) activeRole = 'recipient'

  const placementMode = document.status === 'draft' && isSender
  const selectedField = document.fields.find((f) => f.id === selectedFieldId) ?? null

  const persist = (next: DocumentInstance) => {
    updateDocument(next)
    setVersion((v) => v + 1)
  }

  const placeField = (pageIndex: number, xPct: number, yPct: number) => {
    const field: FieldDef = {
      id: crypto.randomUUID(),
      type: 'text',
      label: 'New field',
      required: true,
      assignee: 'recipient',
      position: {
        pageIndex,
        xPct: Math.max(0, Math.min(90, xPct - 5)),
        yPct: Math.max(0, Math.min(96, yPct - 1)),
        wPct: 20,
        hPct: 2.8,
      },
    }
    persist({ ...document, fields: [...document.fields, field] })
    setSelectedFieldId(field.id)
  }

  const updateField = (field: FieldDef) => {
    persist({
      ...document,
      fields: document.fields.map((f) => (f.id === field.id ? field : f)),
    })
  }

  const deleteField = (id: string) => {
    persist({
      ...document,
      fields: document.fields.filter((f) => f.id !== id),
      values: Object.fromEntries(
        Object.entries(document.values).filter(([k]) => k !== id),
      ),
    })
    setSelectedFieldId(null)
  }

  const changeValue = (fieldId: string, value: string) => {
    persist({
      ...document,
      values: { ...document.values, [fieldId]: value },
    })
  }

  const handleSend = () => {
    if (!isSender || document.status !== 'draft') return
    if (!recipientChoice) {
      setBanner({ text: 'Pick a recipient.', tone: 'error' })
      return
    }

    const recipient = getUserById(recipientChoice)
    if (!recipient) {
      setBanner({
        text: 'Choose a recipient from the user list so they can see the document.',
        tone: 'error',
      })
      return
    }
    if (recipient.id === currentUser.id) {
      setBanner({ text: 'Recipient must be someone else.', tone: 'error' })
      return
    }

    // Fill empty suffix from recipient so the inbox title is distinctive
    const title = withRecipientSuffix(document.title, recipient.name)
    if (!hasTitleSuffix(title)) {
      setBanner({
        text: 'Add a name after the dash in the title (or pick a recipient).',
        tone: 'error',
      })
      return
    }

    const withAutos = applyAutoFills(
      document.fields,
      document.values,
      'sender',
      currentUser.name,
    )
    const validationErrors = validateAssigneeFields(
      document.fields,
      withAutos,
      'sender',
    )
    for (const field of document.fields) {
      if (field.assignee !== 'sender') continue
      if (
        field.type === 'signature' &&
        field.required &&
        !(withAutos[field.id] ?? '').trim()
      ) {
        validationErrors[field.id] = `${field.label} is required`
      }
    }
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setBanner({
        text: 'Fix sender field errors before sending.',
        tone: 'error',
      })
      return
    }

    persist({
      ...document,
      title,
      values: withAutos,
      status: 'sent',
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      recipientName: recipient.name,
      sentAt: new Date().toISOString(),
    })
    setBanner({
      text: 'Document sent. Switch to the recipient user to fill and sign.',
      tone: 'ok',
    })
    setSelectedFieldId(null)
  }

  const { base: titleBase, suffix: titleSuffix } = splitTitle(document.title)

  const updateTitleSuffix = (suffix: string) => {
    persist({ ...document, title: joinTitle(titleBase, suffix) })
  }

  const onRecipientChange = (userId: string) => {
    setRecipientChoice(userId)
    const recipient = getUserById(userId)
    if (!recipient) return
    // Only auto-fill when the suffix is still empty so custom names aren’t overwritten
    if (!hasTitleSuffix(document.title)) {
      persist({
        ...document,
        title: joinTitle(titleBase, recipient.name),
      })
    }
  }

  const handleComplete = () => {
    if (!isRecipient || document.status !== 'sent') return
    const withAutos = applyAutoFills(
      document.fields,
      document.values,
      'recipient',
      currentUser.name,
    )
    const validationErrors = validateAssigneeFields(
      document.fields,
      withAutos,
      'recipient',
    )
    for (const field of document.fields) {
      if (field.assignee !== 'recipient') continue
      if (
        field.type === 'signature' &&
        field.required &&
        !(withAutos[field.id] ?? '').trim()
      ) {
        validationErrors[field.id] = `${field.label} is required`
      }
    }
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setBanner({
        text: 'Fix recipient field errors before finishing.',
        tone: 'error',
      })
      return
    }

    persist({
      ...document,
      values: withAutos,
      status: 'completed',
      completedAt: new Date().toISOString(),
    })
    setBanner({ text: 'Document completed and locked.', tone: 'ok' })
  }

  const handleSaveTemplate = () => {
    if (!isSender) return
    const name = templateName.trim() || 'Master Agreement – standard'
    saveAsTemplate(document.id, name)
    setBanner({ text: `Template “${name}” saved.`, tone: 'ok' })
    setTemplateName('')
  }

  if (!source) {
    return <div className="page-panel">Missing source document.</div>
  }

  const otherUsers = USERS.filter((u) => u.id !== document.senderId)

  return (
    <div className="editor-layout">
      <div className="editor-toolbar">
        <button type="button" className="btn secondary" onClick={() => setView({ name: 'list' })}>
          ← Documents
        </button>
        <div className="editor-title">
          {document.status === 'draft' && isSender ? (
            <label className="title-edit">
              <span className="title-base">{titleBase}</span>
              <span className="title-sep"> - </span>
              <input
                className="title-suffix-input"
                value={titleSuffix}
                placeholder="customer or deal name"
                aria-label="Title details after the dash"
                onChange={(e) => updateTitleSuffix(e.target.value)}
              />
            </label>
          ) : (
            <strong>{document.title}</strong>
          )}
          <span className={`badge status-${document.status}`}>{document.status}</span>
          {!isSender && !isRecipient && (
            <span className="muted">You are not a party on this document.</span>
          )}
        </div>
        <div className="btn-row">
          {placementMode && <span className="hint">Click a page to place a field</span>}
          {document.status === 'draft' && isSender && (
            <>
              <input
                className="template-name-input"
                placeholder="Template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <button
                type="button"
                className="btn secondary"
                onClick={handleSaveTemplate}
                disabled={document.fields.length === 0}
              >
                Save as template
              </button>
              <select
                value={recipientChoice}
                onChange={(e) => onRecipientChange(e.target.value)}
                aria-label="Choose recipient"
              >
                <option value="">Select recipient…</option>
                {otherUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <button type="button" className="btn primary" onClick={handleSend}>
                Send
              </button>
            </>
          )}
          {document.status === 'sent' && isRecipient && (
            <button type="button" className="btn primary" onClick={handleComplete}>
              Finish &amp; sign
            </button>
          )}
        </div>
      </div>

      {banner && (
        <div
          className={`banner banner-${banner.tone}`}
          role={banner.tone === 'error' ? 'alert' : 'status'}
        >
          {banner.text}
          <button type="button" className="banner-dismiss" onClick={() => setBanner(null)}>
            ×
          </button>
        </div>
      )}

      <div
        className={
          document.status === 'draft' && isSender
            ? 'editor-body editor-body--full'
            : 'editor-body'
        }
      >
        <DocumentViewer
          pages={source.pages}
          fields={document.fields}
          values={document.values}
          errors={errors}
          activeRole={activeRole}
          layoutLocked={layoutLocked}
          valuesLockedFor={valuesLockedFor}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
          onChangeValue={changeValue}
          placementMode={placementMode}
          onPlaceField={placeField}
        />
        {document.status === 'draft' && isSender && (
          <FieldInspector
            field={selectedField}
            layoutLocked={layoutLocked}
            onChange={updateField}
            onDelete={deleteField}
            onClose={() => setSelectedFieldId(null)}
          />
        )}
        {document.status !== 'draft' && (
          <aside className="inspector">
            <h2>Status</h2>
            <p>
              <span className={`badge status-${document.status}`}>{document.status}</span>
            </p>
            <p className="muted small">
              Sender: {getUserById(document.senderId)?.name}
              <br />
              Recipient: {document.recipientName ?? '—'}
            </p>
            {document.status === 'sent' && isSender && (
              <p className="muted">Waiting on recipient. Layout and your values are locked.</p>
            )}
            {document.status === 'sent' && isRecipient && (
              <p className="muted">Fill your fields, then Finish &amp; sign.</p>
            )}
            {document.status === 'completed' && (
              <p className="muted">This document is fully locked.</p>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}
