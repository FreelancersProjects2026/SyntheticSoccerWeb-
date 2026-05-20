# Booking Flow Design — `/reservar`

**Date:** 2026-05-20
**Status:** Approved

---

## Overview

Add a public-facing booking flow where authenticated users can reserve a cancha for a specific date and time slot. The flow is a 3-step stepper on a single `/reservar` page. Non-authenticated users are redirected to login and returned to `/reservar` after signing in.

---

## Auth Gate

- `/reservar` is a protected route (`requiredRole` not set — any authenticated user).
- `ProtectedRoute` redirects unauthenticated users to `/login?redirect=/reservar`.
- `Login.tsx` reads `?redirect=` on successful login and navigates there if the value starts with `/`. Existing role-based redirect logic (`admin → /admin`, `user → /`) applies when no `redirect` param is present.

---

## Database

### `reservas` table (new migration)

```sql
CREATE TABLE public.reservas (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cancha_id      uuid        NOT NULL REFERENCES public.canchas(id) ON DELETE CASCADE,
  usuario_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha          date        NOT NULL,
  slot_inicio    time        NOT NULL,
  estado         text        NOT NULL DEFAULT 'pendiente'
                             CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cancha_id, fecha, slot_inicio)
);
```

### RLS Policies

| Policy | Role | Rule |
|---|---|---|
| SELECT | authenticated | `usuario_id = auth.uid()` OR `EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')` |
| INSERT | authenticated | `usuario_id = auth.uid()` |
| UPDATE (estado) | admin only | `EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')` |

---

## Supabase Lib — `src/lib/supabase/reservas.ts`

Two functions:

- `getSlotsTomados(canchaId, fecha)` — returns `slot_inicio[]` for reservas on that cancha+date where `estado IN ('pendiente', 'confirmada')`. Cancelled slots are available for rebooking.
- `createReserva({ cancha_id, usuario_id, fecha, slot_inicio })` — inserts a new row with `estado = 'pendiente'`.

---

## Page: `/reservar`

### State

```ts
type ReservaState = {
  step: 1 | 2 | 3
  cancha: Cancha | null
  fecha: string | null   // 'YYYY-MM-DD'
  slot: string | null    // 'HH:00'
}
```

### Progress indicator

Numbered step bar (`1 → 2 → 3`) at the top. "Atrás" button visible on steps 2 and 3.

### Step 1 — Elegir cancha

- Fetches all canchas where `estado = 'activa'` on mount.
- Displays cards: `imagen_url`, `nombre`, `tipo`, `precio_por_slot`.
- Clicking a card sets `cancha` and advances to step 2.

### Step 2 — Elegir fecha

- Renders a grid of 10 day buttons: today through today+9.
- Selecting a date sets `fecha` and advances to step 3.

### Step 3 — Elegir horario

- Generates slots: `08:00`, `09:00`, … up to `08:00 + (slots_por_dia - 1)h`.
- Calls `getSlotsTomados(cancha.id, fecha)` — disables already-booked slots.
- "Confirmar reserva" button calls `createReserva(...)`.
- On success: toast — *"Reserva enviada, el admin la confirmará pronto."* — stepper resets to step 1.
- On conflict (unique violation): toast error — *"Ese horario ya fue reservado. Elige otro."*

---

## Route Changes — `src/App.tsx`

```
/reservar       Reservar    (ProtectedRoute, any authenticated user)
/mis-reservas   MisReservas (ProtectedRoute, any authenticated user)
```

---

## Navigation Updates — `src/pages/Home.tsx`

- `Nav` — "Reservar" nav link points to `/reservar`.
- `HowItWorks` — "Empezar →" button becomes `<Link to="/reservar">`.
- Both work for non-authed users: clicking triggers the `/login?redirect=/reservar` redirect.

---

## Page: `/mis-reservas`

Read-only. Shows the 3 most recent reservas for the logged-in user.
Columns: Cancha, Fecha, Horario, Estado (badge: pendiente/confirmada/cancelada).
No actions. Placeholder for future full reservations history.

---

## Admin — `src/pages/admin/Reservas.tsx`

Replaces the current empty stub with a functional table:

- **Columns:** Usuario, Cancha, Fecha, Horario, Estado (badge), Acciones
- **Filter tabs:** Todas / Pendientes / Confirmadas / Canceladas
- **Actions:** "Aprobar" and "Rechazar" buttons — visible only on `pendiente` rows.
  - Both require a confirmation dialog before executing.
  - On confirm: UPDATE `estado` via Supabase.

---

## TypeScript

Add `Reserva` type to `src/types/index.ts`:

```ts
export type Reserva = {
  id: string
  cancha_id: string
  usuario_id: string
  fecha: string
  slot_inicio: string
  estado: 'pendiente' | 'confirmada' | 'cancelada'
  created_at: string
}
```

---

## Files Changed

| File | Action |
|---|---|
| `supabase/migrations/20260520030000_create_reservas.sql` | New |
| `src/lib/supabase/reservas.ts` | New |
| `src/types/index.ts` | Update — add `Reserva` type |
| `src/pages/Reservar.tsx` | New |
| `src/pages/MisReservas.tsx` | New (stub, read-only) |
| `src/App.tsx` | Update — add `/reservar`, `/mis-reservas` routes |
| `src/pages/Login.tsx` | Update — `?redirect=` support |
| `src/pages/Home.tsx` | Update — wire "Reservar" link + "Empezar" button |
| `src/pages/admin/Reservas.tsx` | Update — full table with approve/reject |
