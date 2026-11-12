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

  // Page 1 table cells (approx % of page): outer 8.8–91.1;
  // Agent|Email & Phone|Fax split ~41.7; Address|City ~41.7; City|State ~66.4; State|Zip ~78.8
  return [
    // Page 1 — Customer Information (recipient)
    {
      id: id(),
      type: 'text',
      label: 'Customer Legal Name',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 27, yPct: 14.8, wPct: 62, hPct: 2.0 },
    },
    {
      id: id(),
      type: 'text',
      label: 'Purchasing Agent',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 24, yPct: 17.8, wPct: 16, hPct: 2.0 },
    },
    {
      id: id(),
      type: 'email',
      label: 'Email',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 48, yPct: 17.8, wPct: 41, hPct: 2.0 },
    },
    {
      id: id(),
      type: 'text',
      label: 'Address',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 18, yPct: 20.5, wPct: 22, hPct: 2.0 },
    },
    {
      id: id(),
      type: 'text',
      label: 'City',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 48, yPct: 20.5, wPct: 16, hPct: 2.0 },
    },
    {
      id: id(),
      type: 'text',
      label: 'State',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 73, yPct: 20.5, wPct: 5, hPct: 2.0 },
    },
    {
      id: id(),
      type: 'text',
      label: 'Zip',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 84, yPct: 20.5, wPct: 6, hPct: 2.0 },
    },
    {
      id: id(),
      type: 'phone',
      label: 'Phone',
      required: true,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 16, yPct: 22.9, wPct: 23, hPct: 2.0 },
    },
    {
      id: id(),
      type: 'phone',
      label: 'Fax',
      required: false,
      assignee: 'recipient',
      position: { pageIndex: 0, xPct: 48, yPct: 22.9, wPct: 41, hPct: 2.0 },
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
