# Write-up: Mini Document Signing App

## How to run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Seed users in the header switcher:

| User | Role in demos |
|---|---|
| Alex Sender | Default sender |
| Jordan Recipient | Typical recipient |
| Sam Buyer | Extra user (should not see others’ docs) |

## Manual test plan (steps → expected results)

Use a clean browser profile or clear `localStorage` for this origin if you want a fresh start (`Application` → `Local Storage` → delete keys starting with `mini-signing:`).

### 1. App loads & sample document

| Step | Expected |
|---|---|
| Run `npm run dev` and open the app | Documents list loads; header shows **Sign Mini**, Documents / Templates, and **Acting as** |
| As Alex, click **New with MA preset** | Editor opens on a **draft**; page 1 and page 2 images render; customer fields on page 1 and signature blocks on page 2 are overlaid |

### 2. User switcher & visibility

| Step | Expected |
|---|---|
| Stay as Alex with at least one draft you created | Document appears on Alex’s list with role **Sender** |
| Switch to **Sam Buyer** | Sam’s list does **not** include Alex’s draft (Sam is neither sender nor recipient) |
| Switch back to Alex | Draft is visible again |
| Refresh the page | Selected user (Alex) is still selected |

### 3. Place fields (layout)

| Step | Expected |
|---|---|
| As Alex, **New blank draft** | Empty pages; inspector says click to place |
| Click on page 1 | A new field appears; inspector shows label / type / required / assignee |
| Change type, label, assignee, required | Overlay updates (sender fields blue-ish, recipient amber) |
| Narrow the browser window | Fields stay aligned on the page (percentage coordinates) |
| Refresh | Draft and field positions/values still present |

### 4. Sender fill, validation, and send

| Step | Expected |
|---|---|
| Open MA preset draft as Alex; leave sender signature empty; pick Jordan; **Send** | Send blocked; error/banner about sender fields |
| Fill sender **Signature** and **Title**; choose **Jordan Recipient**; **Send** | Status becomes **sent**; print name + date auto-filled for sender; layout locked; sender values read-only |
| Still as Alex, try to click page to add fields | Placement no longer works |
| Switch to Sam | Sent doc still not listed |
| Switch to Jordan | Doc listed as **sent**, role **Recipient** |

### 5. Recipient fill, validation, and complete

| Step | Expected |
|---|---|
| As Jordan, open the sent doc | All fields visible; sender values read-only; only recipient fields editable; **Finish & sign** shown |
| Leave required customer fields empty; **Finish & sign** | Blocked with validation errors |
| Enter invalid email (e.g. `not-an-email`) | Email field error |
| Fill required page 1 fields with valid email/phone; fill recipient signature + title; **Finish & sign** | Status **completed**; recipient print name + date auto-filled; document fully locked for both parties |
| As Alex or Jordan, reopen | No edits possible; list shows **completed** |

### 6. Send reminder (Part 2)

Demo waits: **15s after send** before the first reminder; **30s between** reminders (stand-ins for day-scale production rules).

| Step | Expected |
|---|---|
| As Alex, send a doc to Jordan; open it immediately | **Send reminder** disabled; hint shows countdown |
| Wait until countdown clears; **Send reminder** | Modal opens with To, prefilled subject/body |
| Edit the message; **Send reminder email** | Success banner; reminder listed in the status sidebar |
| Click **Send reminder** again immediately | Disabled / error until cooldown ends |
| Switch to Jordan; open the same doc | Orange reminder banner shows subject + message body |

### 7. Templates

| Step | Expected |
|---|---|
| As Alex, create a draft with fields (or MA preset); **Save as template** | Modal asks for a name; save confirms |
| Open **Templates** | Named template listed with field count |
| **New from template** | New **draft** opens with same field layout, empty values, independent of the original |
| Delete template (as creator) | Confirm dialog, then removed from list |

### 8. End-to-end happy path (smoke)

1. Alex → **New with MA preset** → fill sender signature + title → send to Jordan.  
2. Jordan → open → fill customer info + recipient signature/title → **Finish & sign**.  
3. Both users see **completed**; Sam never saw the document.

**Expected:** Full `draft` → `sent` → `completed` flow with locks and per-user lists behaving as above.

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

## Part 2 feature: In-app send reminder

**Pain point:** A sender checks a still-unsigned document and would otherwise leave the app, find the recipient’s email, and hand-write context. That friction delays follow-up.

**What we built:** On `sent` documents, the sender gets **Send reminder** after a short wait. A modal opens with a **prefilled, editable** subject/body (title, sent time, recipient, sender). Confirming records a `ReminderEmail` on the document (mock send — no SMTP) and shows the message to the recipient when they open the doc. Cooldown prevents spam. Rules live in `src/reminders.ts` so production intervals can change without touching UI.

**Why this over a raw `mailto:` link:** The action stays in the product lifecycle, is gated by status/time, persists history, and closes the loop for the recipient inside the app.

**Also built:** Templates (save/reuse field layouts) — complementary to the layout-vs-values split, but reminders are the Part 2 feature chosen for the user pain point above.

## How I used AI

- **Cursor (Composer)** for scaffolding, React components, repository layer, and CSS.
- I drove the data model (source vs layout vs instance), % coordinates, reminder rules, and feature choice before generating code.
- **Rejected / changed AI output:** An early editor page used a CommonJS-style `require` to reload documents; I replaced that with a direct ESM import of `documentRepo` plus a local version counter so the UI stays consistent with Vite’s module system and the repository seam.

## What’s unfinished

- Field drag-resize and perfect pixel alignment to the PDF blanks.
- Drawn (canvas) signatures.
- Real auth, real email delivery, and a backend API (reminders are mocked in-app).
- Automated tests (manual checklist was used instead).
- Multi-document upload beyond the bundled Master Agreement.
