import type { FieldDef, SourceDocument } from '../types'

export const MASTER_AGREEMENT: SourceDocument = {
  id: 'src-master-agreement',
  title: 'Master Agreement',
  pages: ['/sample/page-1.png', '/sample/page-2.png'],
}

export const SOURCE_DOCUMENTS: SourceDocument[] = [MASTER_AGREEMENT]

export function getSourceDocument(id: string): SourceDocument | undefined {
  return SOURCE_DOCUMENTS.find((d) => d.id === id)
}

/**
 * Preset layout approximating the sample Master Agreement blanks.
 * Percentages are approximate — good enough for the demo, not pixel-perfect.
 */
export function createMasterAgreementPresetFields(): FieldDef[] {
  const id = () => crypto.randomUUID()

  return [
    // Page 1 — Customer Information (recipient)
    {
      id: id(),
      type: 'text',
      label: 'Customer Legal Name',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 28, yPct: 14.5, wPct: 65, hPct: 2.2 },
    },
    {
      id: id(),
      type: 'text',
      label: 'Purchasing Agent',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 24, yPct: 17.2, wPct: 28, hPct: 2.2 },
    },
    {
      id: id(),
      type: 'email',
      label: 'Email',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 58, yPct: 17.2, wPct: 35, hPct: 2.2 },
    },
    {
      id: id(),
      type: 'text',
      label: 'Address',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 16, yPct: 19.8, wPct: 40, hPct: 2.2 },
    },
    {
      id: id(),
      type: 'text',
      label: 'City',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 62, yPct: 19.8, wPct: 14, hPct: 2.2 },
    },
    {
      id: id(),
      type: 'text',
      label: 'State',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 82, yPct: 19.8, wPct: 6, hPct: 2.2 },
    },
    {
      id: id(),
      type: 'text',
      label: 'Zip',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 91, yPct: 19.8, wPct: 7, hPct: 2.2 },
    },
    {
      id: id(),
      type: 'phone',
      label: 'Phone',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 14, yPct: 22.5, wPct: 30, hPct: 2.2 },
    },
    {
      id: id(),
      type: 'phone',
      label: 'Fax',
      required: false,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 52, yPct: 22.5, wPct: 30, hPct: 2.2 },
    },

    // Page 2 — Lone Star (sender) signature block (left)
    {
      id: id(),
      type: 'signature',
      label: 'Sender Signature',
      required: true,
      assignee: 'sender',
      position: { pageIndex: 1, xPct: 8, yPct: 78, wPct: 35, hPct: 3.5 },
    },
    {
      id: id(),
      type: 'signerName',
      label: 'Print Name',
      required: true,
      assignee: 'sender',
      position: { pageIndex: 1, xPct: 8, yPct: 83, wPct: 22, hPct: 2.5 },
    },
    {
      id: id(),
      type: 'date',
      label: 'Date',
      required: true,
      assignee: 'sender',
      autoDate: true,
      position: { pageIndex: 1, xPct: 32, yPct: 83, wPct: 12, hPct: 2.5 },
    },
    {
      id: id(),
      type: 'text',
      label: 'Title',
      required: true,
      assignee: 'sender',
      position: { pageIndex: 1, xPct: 8, yPct: 87.5, wPct: 35, hPct: 2.5 },
    },

    // Page 2 — Customer (recipient) signature block (right)
    {
      id: id(),
      type: 'signature',
      label: 'Recipient Signature',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 1, xPct: 52, yPct: 78, wPct: 40, hPct: 3.5 },
    },
    {
      id: id(),
      type: 'signerName',
      label: 'Print Name',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 1, xPct: 52, yPct: 83, wPct: 22, hPct: 2.5 },
    },
    {
      id: id(),
      type: 'date',
      label: 'Date',
      required: true,
      assignee: 'recipient',
      autoDate: true,
      position: { pageIndex: 1, xPct: 78, yPct: 83, wPct: 14, hPct: 2.5 },
    },
    {
      id: id(),
      type: 'text',
      label: 'Title',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 1, xPct: 52, yPct: 87.5, wPct: 40, hPct: 2.5 },
    },
  ]
}
