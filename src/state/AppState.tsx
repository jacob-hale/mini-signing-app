import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { USERS } from '../data/users'
import {
  createMasterAgreementPresetFields,
  MASTER_AGREEMENT,
} from '../data/sampleDoc'
import { documentRepo } from '../repo/documentRepo'
import type {
  DocumentInstance,
  FieldDef,
  FieldValues,
  Template,
  User,
  View,
} from '../types'
import { todayISODate } from '../validation'

interface AppStateValue {
  currentUser: User
  setCurrentUserId: (id: string) => void
  users: User[]
  documents: DocumentInstance[]
  templates: Template[]
  view: View
  setView: (view: View) => void
  refresh: () => void
  createDraft: (opts?: { fromTemplateId?: string; usePreset?: boolean }) => DocumentInstance
  updateDocument: (doc: DocumentInstance) => DocumentInstance
  saveAsTemplate: (documentId: string, name: string) => Template
  deleteTemplate: (id: string) => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

function cloneFields(fields: FieldDef[]): FieldDef[] {
  return fields.map((f) => ({
    ...f,
    id: crypto.randomUUID(),
    position: { ...f.position },
  }))
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserIdState] = useState(() => {
    return documentRepo.getCurrentUserId() ?? USERS[0].id
  })
  const [tick, setTick] = useState(0)
  const [view, setView] = useState<View>({ name: 'list' })

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  const setCurrentUserId = useCallback((id: string) => {
    documentRepo.setCurrentUserId(id)
    setCurrentUserIdState(id)
    setView({ name: 'list' })
  }, [])

  const currentUser = USERS.find((u) => u.id === currentUserId) ?? USERS[0]

  const documents = useMemo(() => {
    void tick
    return documentRepo.listForUser(currentUser.id)
  }, [currentUser.id, tick])

  const templates = useMemo(() => {
    void tick
    return documentRepo.listTemplates()
  }, [tick])

  const createDraft = useCallback(
    (opts?: { fromTemplateId?: string; usePreset?: boolean }) => {
      let fields: FieldDef[] = []
      let templateId: string | null = null
      let title = `${MASTER_AGREEMENT.title} (draft)`

      if (opts?.fromTemplateId) {
        const template = documentRepo.getTemplate(opts.fromTemplateId)
        if (!template) throw new Error('Template not found')
        fields = cloneFields(template.fields)
        templateId = template.id
        title = `${template.name} — copy`
      } else if (opts?.usePreset) {
        fields = createMasterAgreementPresetFields()
        title = `${MASTER_AGREEMENT.title} (preset layout)`
      }

      const doc: DocumentInstance = {
        id: crypto.randomUUID(),
        title,
        sourceDocumentId: MASTER_AGREEMENT.id,
        fields,
        values: {},
        status: 'draft',
        senderId: currentUser.id,
        recipientId: null,
        recipientEmail: null,
        recipientName: null,
        createdAt: new Date().toISOString(),
        sentAt: null,
        completedAt: null,
        templateId,
      }
      documentRepo.saveDocument(doc)
      refresh()
      return doc
    },
    [currentUser.id, refresh],
  )

  const updateDocument = useCallback(
    (doc: DocumentInstance) => {
      const saved = documentRepo.saveDocument(doc)
      refresh()
      return saved
    },
    [refresh],
  )

  const saveAsTemplate = useCallback(
    (documentId: string, name: string) => {
      const doc = documentRepo.getDocument(documentId)
      if (!doc) throw new Error('Document not found')
      const template: Template = {
        id: crypto.randomUUID(),
        name: name.trim() || 'Untitled template',
        sourceDocumentId: doc.sourceDocumentId,
        fields: cloneFields(doc.fields),
        createdAt: new Date().toISOString(),
        createdByUserId: currentUser.id,
      }
      documentRepo.saveTemplate(template)
      refresh()
      return template
    },
    [currentUser.id, refresh],
  )

  const deleteTemplate = useCallback(
    (id: string) => {
      documentRepo.deleteTemplate(id)
      refresh()
    },
    [refresh],
  )

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUserId,
      users: USERS,
      documents,
      templates,
      view,
      setView,
      refresh,
      createDraft,
      updateDocument,
      saveAsTemplate,
      deleteTemplate,
    }),
    [
      currentUser,
      setCurrentUserId,
      documents,
      templates,
      view,
      refresh,
      createDraft,
      updateDocument,
      saveAsTemplate,
      deleteTemplate,
    ],
  )

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  )
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}

/** Apply auto date + signerName for an assignee using their display name. */
export function applyAutoFills(
  fields: FieldDef[],
  values: FieldValues,
  assignee: 'sender' | 'recipient',
  signerName: string,
): FieldValues {
  const next = { ...values }
  const date = todayISODate()
  for (const field of fields) {
    if (field.assignee !== assignee) continue
    if (field.type === 'signerName') {
      next[field.id] = signerName
    }
    if (field.type === 'date' && field.autoDate) {
      next[field.id] = date
    }
  }
  return next
}
