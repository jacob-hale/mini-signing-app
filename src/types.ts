export type DocumentStatus = 'draft' | 'sent' | 'completed'

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'date'
  | 'signature'
  | 'signerName'

export type Assignee = 'sender' | 'recipient'

export type Role = 'sender' | 'recipient'

export interface User {
  id: string
  name: string
  email: string
}

/** Normalized position relative to the page box (0–100). Survives resize. */
export interface FieldPosition {
  pageIndex: number
  xPct: number
  yPct: number
  wPct: number
  hPct: number
}

export interface FieldDef {
  id: string
  type: FieldType
  label: string
  required: boolean
  assignee: Assignee
  position: FieldPosition
  /** When type is date, auto-fill with signing date on complete/send for that party */
  autoDate?: boolean
}

export interface FieldValues {
  [fieldId: string]: string
}

export interface SourceDocument {
  id: string
  title: string
  pages: string[]
}

/**
 * A reusable field layout on top of a source document.
 * Separated from instance values so templates can create fresh copies.
 */
export interface FieldLayout {
  id: string
  name: string
  sourceDocumentId: string
  fields: FieldDef[]
}

/** Mock email reminder sent from the app (no real SMTP). */
export interface ReminderEmail {
  id: string
  sentAt: string
  sentByUserId: string
  toEmail: string
  toName: string
  subject: string
  body: string
  /** Set when the recipient opens the document and sees the reminder */
  readAt?: string | null
}

export interface DocumentInstance {
  id: string
  title: string
  sourceDocumentId: string
  /** Snapshot of fields at create / from template — layout lives on the instance */
  fields: FieldDef[]
  values: FieldValues
  status: DocumentStatus
  senderId: string
  recipientId: string | null
  recipientEmail: string | null
  recipientName: string | null
  createdAt: string
  sentAt: string | null
  completedAt: string | null
  /** Optional link back to a template this was created from */
  templateId: string | null
  /** Reminder emails recorded on this document (mock send) */
  reminders?: ReminderEmail[]
}

export interface Template {
  id: string
  name: string
  sourceDocumentId: string
  fields: FieldDef[]
  createdAt: string
  createdByUserId: string
}

export type View =
  | { name: 'list' }
  | { name: 'editor'; documentId: string }
  | { name: 'templates' }
