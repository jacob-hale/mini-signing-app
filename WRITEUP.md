# Write-up: Mini Document Signing App

## How to run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

**Demo path**

1. Acting as **Alex Sender**, click **New with MA preset**.
2. Fill sender fields on page 2 (signature + title). Print name and date auto-fill on send.
3. Choose **Jordan Recipient**, click **Send**.
4. Switch the header user to **Jordan Recipient**, open the document, fill page 1 customer fields and recipient signature/title, then **Finish & sign**.
5. Optionally **Save as template** from a draft, then use **Templates → New from template**.

## Architecture overview

Three concepts are kept separate:

1. **Source document** — page images for the Master Agreement (`src/data/sampleDoc.ts`, files under `public/sample/`).
2. **Field layout** — field definitions (type, label, required, assignee, normalized position). Lives on each document instance and can be copied into a **Template**.
3. **Document instance** — status (`draft` → `sent` → `completed`), parties, and field **values**.

```
UI (pages/components)
        │
        ▼
AppState (React context) ──► documentRepo (localStorage)
        │
        ▼
types: SourceDocument | FieldDef | DocumentInstance | Template
```

- **State:** `AppStateProvider` holds current user, view, and thin mutations; lists re-read from the repository after each save.
- **Data access:** `src/repo/documentRepo.ts` is the only place that touches `localStorage` keys.
- **Validation:** `src/validation.ts` for email/phone/required; send/complete also enforce signature fields.

## Key decisions

1. **Normalized field positions (`xPct` / `yPct` / `wPct` / `hPct`)** — Stored as percentages of the page box, not pixels. Resizing the window keeps overlays aligned with the page image.
2. **Page PNGs instead of pdf.js** — Faster setup and stable click coordinates for a 90-minute box. The original PDF is still in `sample/` / `public/sample/`.
3. **localStorage behind a repository** — Survives refresh and keeps a clear seam if you later swap in an API.
4. **Typed script-font signatures** — Meets the brief without canvas tooling.
5. **Preset Master Agreement layout** — Approximate positions for the sample blanks so the happy path is demoable without pixel-perfect manual placement.

## Part 2 feature: Templates

**Why:** Templates are the natural product of separating layout from values. Senders reuse a field layout (“Master Agreement – standard”) for new customers without rebuilding placement.

**How it fits:** Saving a template clones field defs (new IDs) into `Template` storage. “New from template” creates a fresh `draft` instance with empty values and the same layout. Templates are managed on the Templates page and via “Save as template” on a draft.

## How I used AI

- **Cursor (Composer)** for scaffolding, React components, repository layer, and CSS.
- I drove the data model (source vs layout vs instance), % coordinates, and the Templates feature before generating code.
- **Rejected / changed AI output:** An early editor page used a CommonJS-style `require` to reload documents; I replaced that with a direct ESM import of `documentRepo` plus a local version counter so the UI stays consistent with Vite’s module system and the repository seam.

## What’s unfinished

- Field drag-resize and perfect pixel alignment to the PDF blanks.
- Drawn (canvas) signatures.
- Real auth, email delivery, and a backend API.
- Automated tests (manual checklist was used instead).
- Multi-document upload beyond the bundled Master Agreement.
