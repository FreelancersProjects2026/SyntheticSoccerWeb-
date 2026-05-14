# Synthetic Soccer Web

Booking platform for synthetic soccer fields. Admins manage fields and availability; users book, reschedule, and challenge other teams.

---

## Features

### Admin
- Add and edit fields (name, description, capacity)
- Set availability: dates and time slots
- View the active reservations calendar

### User
- Search available fields by date and time
- Book and reschedule reservations
- Challenge mode — post or accept match challenges from other teams on open slots

---

## Stack

| Layer | Technology |
|---|---|
| Build | Vite 8 |
| UI | React 19 + TypeScript 6 |
| Styling | Tailwind CSS 4 |
| PWA | vite-plugin-pwa + Workbox |
| Linting | ESLint 10 + typescript-eslint |
| Formatting | Prettier 3 + prettier-plugin-tailwindcss |
| Package manager | pnpm |

---

## Getting started

### 1. Set up environment variables

Create `.env.local` in the root of the project. Ask the project owner for the credentials:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

> **Owner only:** The Supabase project, `supabase init`, `supabase link`, and migration commands are managed exclusively by the project owner. Contributors only need `.env.local` to connect.

### 2. Install and run

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Production build
pnpm build

# Preview the build
pnpm preview
```

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Local dev server at `localhost:5173` |
| `pnpm build` | Type-check + bundle into `dist/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm format` | Format `src/` with Prettier |
| `pnpm type-check` | Type-check without emitting files |

---

## Project structure

```
src/
├── components/    Reusable UI (forms, calendar, cards)
├── pages/         One file per route/view
├── hooks/         Custom React hooks
├── types/         Shared TypeScript interfaces (Field, Reservation, Challenge, User)
├── utils/         Pure helpers (date formatting, slot availability, validation)
└── assets/        Static images and fonts
```

---

## PWA

The app ships as a Progressive Web App. Running `pnpm build` auto-generates the service worker (`dist/sw.js`) and web manifest via Workbox. The service worker is also active in dev for easier testing.

To install on mobile: open the app in a browser → "Add to Home Screen".

---

## Code conventions

- **Absolute imports:** use `@/` instead of relative paths (`@/components/Button`)
- **Package manager:** `pnpm` only — never `npm` or `yarn`
- **Formatting:** Prettier runs on save in VS Code (install the recommended extension)
- **Tailwind:** class order is auto-sorted on format via `prettier-plugin-tailwindcss`
