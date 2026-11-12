# Take-Home: Mini Document Signing App

**Time box:** 90 minutes. Please stick to it. I care more about how you structure the app and the choices you make than about how much you finish.

**AI tools are allowed and expected.** Since code is cheap to generate, I focus on your decisions: what you built, why, and how well you understand it.

## The scenario

We send customers agreements to fill out and sign. A sample is in [`sample/`](sample/): a two-page **Master Agreement**. Page 1 has a Customer Information block, and page 2 has a signature block for both sides.

Build a small React app that works like a simplified DocuSign:

1. A **sender** picks a document and **places fields** on its pages.
2. The sender fills in and signs their own fields, then **issues** the document to a **recipient**.
3. The recipient opens it, **fills in** their fields, and **signs**.
4. Both people can see where the document stands.

You don't need a real backend, real auth, or real email. Fake them however you like.

Attached is the master-agreement.pdf which is an example document to complete.

You may render the PDF (for example with `react-pdf` / `pdf.js`) **or** just show the page images. Either is fine.

## Getting started

Use any React setup you want (Vite + TypeScript is a good default). You may use any libraries. Please tell me which ones and why.

### Run this project

```bash
npm install
npm run dev
```

See [`WRITEUP.md`](WRITEUP.md) for architecture, decisions, and how to demo the app.

## Part 1: Core requirements

### 1. Place fields (sender)
- Show the document pages. The sender places fields on a page by clicking or dragging.
- Each field has a **type**, a **label**, a **required** flag, and an **assignee** (sender or recipient).
- Support at least these field types:

| Type | Notes |
|---|---|
| `text` | Free text (e.g. Customer Legal Name, Address, City) |
| `email` | Validated as an email |
| `phone` | Validated as a phone number |
| `date` | Can be set to **auto-fill with the signing date** |
| `signature` | Typed name shown in a script font, or drawn on a canvas |
| `signerName` | Auto-filled from the signer's name |

- Fields must stay in the right place if the page is shown at a different size (e.g. a narrower window). How you store position is up to you. Explain it in your write-up.

**Target layout:** your app should be able to recreate the sample:
- **Page 1, recipient:** Customer Legal Name, Purchasing Agent, Email, Address, City, State, Zip, Phone, Fax
- **Page 2, sender:** Signature, Print Name, Date, Title
- **Page 2, recipient:** Signature, Print Name, Date, Title

### 2. Issue it
- The sender completes and signs their own fields before sending.
- The sender chooses a recipient (a name or email is enough) and sends it.
- Once sent, the field layout and the sender's values are **locked**.

### 3. Fill and sign (recipient)
- The recipient sees the whole document with every field in place. Sender values are read-only. Only the recipient's fields can be edited.
- Required fields must be valid before the recipient can finish.
- When they finish, auto-fill date and name fields, then mark the document **completed** and lock it.

### 4. Status and users
- Track at least these statuses: `draft` → `sent` → `completed`.
- Show a list of documents with their statuses.
- Give me a way to act as different users, such as a user switcher in the header or a fake login. A user should only see documents they sent or received.

### Persistence
Use in-memory state, `localStorage`, or a small mock API, and explain your choice. A clear seam between UI and data access (for example a service or repository layer) counts more than which option you pick.

## Part 2: Your feature

Add **one feature of your choice** that would make this app genuinely more useful. Pick something that makes sense for a small signing app, and that shows how you design a system rather than how you polish a UI.

Some ideas (you can pick your own instead):

- **Notifications:** an in-app inbox that tells people when a document is sent to them, viewed, signed, or overdue, with unread counts and mark-as-read
- **Signing queue / work inbox:** a prioritized "needs my action" list across all documents, with due dates and an "overdue" state
- **Reminders and expiration:** documents expire after N days; unsigned ones get scheduled reminders
- **Audit trail:** a log of every event that can't be edited after the fact, e.g. each entry hashes the previous one so tampering shows
- **Event bus:** status changes publish events, and other parts of the app (notifications, the log, counters) subscribe instead of being called directly
- **Templates:** save a field layout ("Master Agreement – standard") and issue new copies to different customers

Keep it small but well-built. In your write-up, say **why** you picked it and how it plugs into the rest of the app.

## What to submit

Send me your project and a short write-up (a `WRITEUP.md` in the project is fine) that covers:

1. **How to run it** (setup steps and commands)
2. **Architecture overview:** your data model, how state is managed, and how the code is organized. A diagram is welcome but not required.
3. **Three to five key decisions:** what you chose and what you traded off. Include how you store field positions.
4. **Your feature:** what it does, why you chose it, and how it fits into the architecture
5. **How you used AI:** which tools, and at least one place where you rejected or changed what it gave you
6. **What's unfinished:** be honest. That's expected in this time box.

## How I'll evaluate

| Area | What I look for |
|---|---|
| Data modeling | Clear separation between the source document, the field layout, and the values filled in; status changes that make sense |
| Field positioning | Positions that survive resizing; a sensible coordinate model (page plus relative position) |
| State and data flow | Sensible choice of where state lives; no tangled prop drilling or duplicated sources of truth |
| Your feature | A sensible choice, cleanly separated from the core, that would hold up as the app grows |
| Correctness | Validation; sender and recipient each edit only their own fields; locked documents really are locked; users see only their own documents |
| Communication | A write-up that explains your reasoning and trade-offs |

I will **not** score on visual design, pixel-perfect placement, or test coverage (though tests are a plus).

Questions? Email me. Good luck, and have fun with it.
