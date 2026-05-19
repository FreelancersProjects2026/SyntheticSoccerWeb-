# Admin Panel Redesign

**Date:** 2026-05-19
**Status:** Approved

## Summary

Full rewrite of the admin panel UI. Goal: minimalist, professional SaaS aesthetic — no generic AI-generated look. Influenced by Linear, Notion, and Vercel's dashboard. Every admin page must feel cohesive and intentional.

---

## Design Decisions

| Topic | Decision |
|---|---|
| Sidebar style | Light/white (#FFFFFF), border-right only, no shadow on sidebar itself |
| Sidebar active item | Dark brand fill (`#072f1a`), white text, green icon |
| Dashboard stat cards | Horizontal layout: icon-wrap left + number/label right |
| Data page tables | No row dividers; hover-only background change (`#FAFAF9`) |
| Page header | Eyebrow (green uppercase) + large title (Syne) + subtitle (DM Sans) |

---

## Color System

| Token | Value | Use |
|---|---|---|
| `#FFFFFF` | White | Sidebar background, card backgrounds |
| `#FAFAF9` | Off-white | Main content area background, table row hover |
| `#F5F4F1` | Warm gray | Muted icon backgrounds, tag/badge background |
| `#F0EFED` | Border warm | Sidebar internal borders |
| `#EBEBEA` | Border cool | Card borders, table card border |
| `#BCBAB5` | Muted text | Table column headers, nav section labels |
| `#9C9790` | Secondary text | Page subtitles, stat labels, user role |
| `#6B6862` | Body text | Inactive nav items, table cell text |
| `#0d1a12` | Primary text | Stat values, row names, card titles |
| `#072f1a` | Brand dark | Sidebar active item bg, logo mark, primary button |
| `#12D176` | Brand green | Page eyebrows, active nav icon, logo accent, green stat icon |
| `#ECFDF5` | Green tint | Light icon backgrounds for green stats, active badges |
| `#059669` | Green text | Active status badge text |
| `#FEF3C7` | Yellow tint | Pending/warning badge background |
| `#B45309` | Yellow text | Pending/warning badge text |

---

## Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Page title | Syne | 22px | 700 |
| Page eyebrow | DM Sans | 10px | 600, uppercase, letter-spacing 0.2em |
| Page subtitle | DM Sans | 13px | 400 |
| Sidebar nav item | DM Sans | 13px | 500 (inactive), 600 (active) |
| Sidebar section label | DM Sans | 9px | 600, uppercase, letter-spacing 0.14em |
| Table column header | DM Sans | 11px | 600, uppercase, letter-spacing 0.04em |
| Table row name | DM Sans | 13px | 600 |
| Table row cell | DM Sans | 12px | 400 |
| Stat value | DM Sans | 22px | 700 |
| Stat label | DM Sans | 11px | 400 |
| User name (sidebar) | DM Sans | 12px | 600 |
| User role (sidebar) | DM Sans | 10px | 400 |

---

## Layout Shell (`AdminLayout.tsx`)

### Sidebar — 220px wide, fixed, full height

```
┌─────────────────────┐
│ [■] CANCHA          │  ← 56px logo row, border-bottom
├─────────────────────┤
│ GENERAL             │  ← section label
│   [icon] Dashboard  │  ← nav item (active = dark fill)
│   [icon] Canchas    │
│ GESTIÓN             │  ← section label
│   [icon] Reservas   │
│   [icon] Usuarios   │
│                     │
│ ─────────────────── │  ← border-top
│ [○] Jason M.    >   │  ← user row, clickable
└─────────────────────┘
```

- Logo row: 56px height, logo mark (26×26 rounded `#072f1a` with `#12D176` SVG icon) + "CANCHA" text 12px/700
- Section labels: 9px uppercase gray, `#BCBAB5`, padding top 6px bottom 4px
- Nav items: `padding: 7px 10px`, `border-radius: 7px`, gap 9px between icon and label
  - Inactive: `color: #6B6862`, hover `background: #F5F4F1, color: #1a1a18`
  - Active: `background: #072f1a`, `color: white`, icon `color: #12D176`
- User row: avatar 28px circle `#072f1a`/`#12D176` initial + name + role + chevron right
- Collapse behavior: keep existing toggle. On collapse, show only icons (no labels). Width: 52px collapsed, 220px expanded.
- Mobile: existing slide-in overlay behavior, keep as-is.

### Top bar — 56px, sticky

- `background: rgba(250,250,249,0.9)`, `backdrop-filter: blur(8px)`, `border-bottom: 1px solid #EBEBEA`
- Only contains user avatar (30px) on the far right. No title, no breadcrumb.
- Mobile: hamburger button left, avatar right.

### Main content area

- `background: #FAFAF9`
- Page padding: `28px` on md+, `16px` on mobile

---

## Page Header Component

Used at the top of every admin page. Consistent structure:

```tsx
<div className="mb-7 flex items-end justify-between">
  <div>
    <p className="eyebrow">{eyebrow}</p>        {/* e.g. "Panel" or "Gestión" */}
    <h1 className="page-title">{title}</h1>
    <p className="page-subtitle">{subtitle}</p>
  </div>
  {action && <div>{action}</div>}               {/* optional: primary button */}
</div>
```

Eyebrow: `10px / 600 / #12D176 / uppercase / letter-spacing 0.2em`
Title: `22px / 700 / #0d1a12 / Syne`
Subtitle: `13px / 400 / #9C9790 / DM Sans`

---

## Dashboard Page

### Stat cards grid — 4 columns (2 on mobile)

Each card:
```
┌─────────────────────────────┐
│  [icon-wrap]  22px value    │
│               11px label    │
└─────────────────────────────┘
```

- Card: `background: white`, `border: 1px solid #EBEBEA`, `border-radius: 12px`, `padding: 16px 18px`
- Layout: `display: flex`, `align-items: center`, `gap: 14px`
- Icon wrap: 40×40px, `border-radius: 10px`
  - Dark variant (`#0d1a12` bg + `#12D176` icon): for canchas and retos
  - Green tint variant (`#ECFDF5` bg + `#059669` icon): for reservas
  - Muted variant (`#F5F4F1` bg + `#6B6862` icon): for usuarios
- Value: `22px / 700 / #0d1a12`
- Label: `11px / 400 / #9C9790`
- GSAP entrance: stagger 0.07s, fade + y:16→0, keep existing animation

### Activity card

- Same card style as data table (see below)
- Empty state: centered text `"Las reservas y eventos aparecerán aquí"`, `color: #C5C3BE`, `13px`

---

## Data Pages (Canchas, Reservas, Usuarios)

All three share the same structure:

```
PageHeader (eyebrow + title + subtitle + primary button)
└── TableCard
    ├── TableCard.Header (title + count badge)
    ├── TableHead (column labels)
    ├── TableRow × n  (or EmptyState)
    └── (future: pagination footer)
```

### TableCard

- `background: white`, `border: 1px solid #EBEBEA`, `border-radius: 12px`, `overflow: hidden`

### TableCard.Header

- `padding: 16px 20px`, `border-bottom: 1px solid #F2F1EE`
- Title: `14px / 600 / #0d1a12`
- Count badge: `height: 22px`, `padding: 0 10px`, `border-radius: 20px`, `background: #F5F4F1`, `11px / 500 / #9C9790`

### TableHead

- `padding: 10px 20px`, `gap: 12px`, `border-bottom: 1px solid #F2F1EE`
- Column headers: `11px / 600 / #BCBAB5 / uppercase / letter-spacing 0.04em`

### TableRow

- `padding: 12px 20px`, `gap: 12px`, `align-items: center`
- No border between rows
- Hover: `background: #FAFAF9` (CSS transition 0.12s)
- Name cell: 30×30 thumbnail (rounded-7px) + name (13px/600/#0d1a12) + meta (11px/#9C9790)
- Data cells: `12px / 400 / #6B6862`
- Status badges: `height: 20px`, `padding: 0 9px`, `border-radius: 20px`
  - Active: `background: #ECFDF5`, `color: #059669`
  - Pending/warning: `background: #FEF3C7`, `color: #B45309`

### EmptyState (when no data)

- Centered in the table area: icon (muted) + title + description
- No illustration, no heavy decoration. Just icon + text.

---

## Primary Button

```
background: #072f1a
color: white
height: 34px
padding: 0 16px
border-radius: 8px
font-size: 13px / font-weight: 600
```

Hover: `background: #0a3d22` (slightly lighter)
Optional leading icon: 14×14px SVG, `gap: 6px`

---

## Files to Rewrite

| File | Change |
|---|---|
| `src/pages/admin/AdminLayout.tsx` | Full rewrite with new sidebar + topbar |
| `src/pages/admin/Dashboard.tsx` | Full rewrite with new stat cards + activity table |
| `src/pages/admin/Canchas.tsx` | Full rewrite with page header + table card |
| `src/pages/admin/Reservas.tsx` | Full rewrite with page header + table card |
| `src/pages/admin/Usuarios.tsx` | Full rewrite with page header + table card |

No new files are created. No shared component library extracted — each page is self-contained for now. Icons stay as inline SVG functions inside each file.

---

## Out of Scope

- Mobile hamburger behavior: keep existing implementation
- Sidebar collapse toggle: keep existing implementation
- Real data / Supabase queries: not changed
- GSAP animations on Dashboard: keep existing entrance animation
- Other pages outside `/admin/*`: not touched
