# Invoice Generator — Web App Design Document

## Overview

Convert the existing CLI invoice generator (Python + fpdf2) into a **static web app** hosted on **GitHub Pages**. Split-panel layout: editable form on the **left**, live PDF preview on the **right**.

---

## Technology Stack

| Layer              | Technology                                  | Why                                                                     |
| ------------------ | ------------------------------------------- | ----------------------------------------------------------------------- |
| **Build**          | [Vite](https://vitejs.dev/)                 | Fast dev server, optimized builds, GitHub Pages deploy via `vite build` |
| **UI**             | [React](https://react.dev/)                 | Component-based, reactive form → preview pipeline                       |
| **Styling**        | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first, rapid UI development, `@tailwindcss/vite` plugin         |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF)  | Client-side PDF creation, mirrors fpdf2 API closely                     |
| **PDF Preview**    | `<iframe>` + Blob URL                       | Browser's native PDF renderer, zero extra deps                          |

---

## Architecture

```
invoice-generator/
├── cli/                        # existing CLI (untouched)
├── src/
│   ├── App.jsx                 # root — split-pane layout
│   ├── main.jsx                # React entry point
│   ├── index.css               # Tailwind import + custom styles
│   ├── components/
│   │   ├── InvoiceForm.jsx     # left panel — all form sections
│   │   └── PdfPreview.jsx      # right panel — iframe preview + download
│   ├── lib/
│   │   └── pdf-generator.js    # jsPDF logic (port of cli/main.py)
│   └── utils/
│       └── format.js           # number formatting helpers
├── public/
│   ├── logo.png                # default CyRisk logo
│   └── signature.png           # default signature
├── index.html                  # Vite entry HTML
├── vite.config.js
├── package.json
└── DESIGN.md
```

---

## UI Layout

```
┌───────────────────────────────────────────────────────────┐
│  📄 Invoice Generator                                      │
├────────────────────────┬──────────────────────────────────┤
│  FORM (40%)            │  PREVIEW (60%)                   │
│                        │                                  │
│  Invoice Details       │  ┌────────────────────────────┐  │
│  ├─ Invoice No.        │  │                            │  │
│  └─ Date               │  │  Live PDF in <iframe>      │  │
│                        │  │                            │  │
│  Issuer                │  │  Re-renders on form        │  │
│  ├─ Company            │  │  input change (debounced)  │  │
│  ├─ Address            │  │                            │  │
│  └─ Email              │  │                            │  │
│                        │  │                            │  │
│  Recipient             │  │                            │  │
│  ├─ Name / Address     │  │                            │  │
│  └─ Email / Phone      │  └────────────────────────────┘  │
│                        │                                  │
│  Line Item             │  [ 📥 Download PDF ]             │
│  ├─ Description        │                                  │
│  ├─ Qty / Unit Price   │                                  │
│  └─ Tax Rate           │                                  │
│                        │                                  │
│  Assets                │                                  │
│  ├─ Logo [Upload]      │                                  │
│  └─ Signature [Upload] │                                  │
└────────────────────────┴──────────────────────────────────┘
```

**Responsive**: Below 900px → stacked (form on top, preview below).

---

## Feature Mapping: CLI → Web

| CLI Feature                          | Web Equivalent                                     |
| ------------------------------------ | -------------------------------------------------- |
| Rich interactive prompts             | React form inputs with defaults                    |
| `logo.png` / `signature.png` on disk | Bundled in `public/`; user can upload replacements |
| `fpdf2` PDF generation               | `jsPDF` — identical layout logic                   |
| EU-style formatting (`$ 1.200,00`)   | Same formatting in JS                              |
| File output to `outputs/`            | Browser download via Blob + anchor                 |

---

## Deployment

```bash
npm run build          # → dist/
# Push dist/ to gh-pages branch, or configure GitHub Pages to serve from /docs
```

Vite config sets `base: '/invoice-generator/'` for GitHub Pages subpath.

---

## Development Phases

1. **Scaffold**: Vite + React + TailwindCSS project setup
2. **PDF Engine**: Port `InvoicePDF` class to `pdf-generator.js` using jsPDF
3. **Form UI**: `InvoiceForm` component with all fields & defaults
4. **Preview**: `PdfPreview` component with live iframe rendering
5. **Image Upload**: Logo & signature upload with base64 conversion
6. **Polish**: Responsive layout, animations, dark theme, deploy config
