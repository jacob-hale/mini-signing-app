import type { DocumentInstance, Template } from '../types'

const DOCS_KEY = 'mini-signing:documents'
const TEMPLATES_KEY = 'mini-signing:templates'
const CURRENT_USER_KEY = 'mini-signing:currentUserId'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

/** Repository seam — UI talks to these functions, not localStorage directly. */
export const documentRepo = {
  listDocuments(): DocumentInstance[] {
    return readJson<DocumentInstance[]>(DOCS_KEY, [])
  },

  getDocument(id: string): DocumentInstance | undefined {
    return this.listDocuments().find((d) => d.id === id)
  },

  saveDocument(doc: DocumentInstance): DocumentInstance {
    const all = this.listDocuments()
    const idx = all.findIndex((d) => d.id === doc.id)
    if (idx >= 0) all[idx] = doc
    else all.push(doc)
    writeJson(DOCS_KEY, all)
    return doc
  },

  deleteDocument(id: string): void {
    writeJson(
      DOCS_KEY,
      this.listDocuments().filter((d) => d.id !== id),
    )
  },

  listForUser(userId: string): DocumentInstance[] {
    return this.listDocuments()
      .filter((d) => d.senderId === userId || d.recipientId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  listTemplates(): Template[] {
    return readJson<Template[]>(TEMPLATES_KEY, []).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    )
  },

  getTemplate(id: string): Template | undefined {
    return this.listTemplates().find((t) => t.id === id)
  },

  saveTemplate(template: Template): Template {
    const all = this.listTemplates()
    const idx = all.findIndex((t) => t.id === template.id)
    if (idx >= 0) all[idx] = template
    else all.push(template)
    writeJson(TEMPLATES_KEY, all)
    return template
  },

  deleteTemplate(id: string): void {
    writeJson(
      TEMPLATES_KEY,
      this.listTemplates().filter((t) => t.id !== id),
    )
  },

  getCurrentUserId(): string | null {
    return localStorage.getItem(CURRENT_USER_KEY)
  },

  setCurrentUserId(userId: string): void {
    localStorage.setItem(CURRENT_USER_KEY, userId)
  },
}
