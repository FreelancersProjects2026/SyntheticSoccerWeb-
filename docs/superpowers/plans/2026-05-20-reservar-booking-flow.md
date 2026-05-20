# Reservar Booking Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full user booking flow — `/reservar` 3-step stepper (cancha → fecha → horario) with Supabase backend, plus admin approve/reject panel and read-only `/mis-reservas` page.

**Architecture:** Single-page stepper with local state machine (`step: 1|2|3`). New `reservas` Supabase table stores bookings with `pendiente/confirmada/cancelada` estado. Auth redirect pattern: unauthenticated users hitting `/reservar` are sent to `/login?redirect=/reservar` and returned after login.

**Tech Stack:** React 19, TypeScript 6, Supabase JS v2, Tailwind CSS 4, React Router v7

---

## File Map

| File | Action |
|---|---|
| `supabase/migrations/20260520030000_create_reservas.sql` | Create |
| `src/types/index.ts` | Modify — add `Reserva`, `ReservaConDetalles` |
| `src/lib/supabase/reservas.ts` | Create |
| `src/components/ProtectedRoute.tsx` | Modify — add `?redirect=` param |
| `src/pages/Login.tsx` | Modify — consume `?redirect=` on success |
| `src/App.tsx` | Modify — add `/reservar`, `/mis-reservas` routes |
| `src/pages/Home.tsx` | Modify — wire "Reservar" nav link + "Empezar" + "Reservar ahora" |
| `src/pages/Reservar.tsx` | Create |
| `src/pages/MisReservas.tsx` | Create |
| `src/pages/admin/Reservas.tsx` | Rewrite — functional table with approve/reject |

---

## Task 1: DB Migration — Create `reservas` table

**Files:**
- Create: `supabase/migrations/20260520030000_create_reservas.sql`

- [ ] **Step 1: Write the migration file**

```sql
CREATE TABLE public.reservas (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cancha_id      uuid        NOT NULL REFERENCES public.canchas(id) ON DELETE CASCADE,
  usuario_id     uuid        NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  fecha          date        NOT NULL,
  slot_inicio    time        NOT NULL,
  estado         text        NOT NULL DEFAULT 'pendiente'
                             CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cancha_id, fecha, slot_inicio)
);

ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Users see their own reservas; admins see all
CREATE POLICY "reservas_select" ON public.reservas
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Users can only insert their own reservas
CREATE POLICY "reservas_insert" ON public.reservas
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- Only admins can update estado
CREATE POLICY "reservas_update" ON public.reservas
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  );
```

- [ ] **Step 2: Apply migration to Supabase**

```bash
pnpm supabase db push
```

Expected: migration applied without errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260520030000_create_reservas.sql
git commit -m "feat(db): create reservas table with RLS policies"
```

---

## Task 2: TypeScript Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add `Reserva` and `ReservaConDetalles` to existing types file**

Append to the end of `src/types/index.ts`:

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

export type ReservaConDetalles = Reserva & {
  canchas: { nombre: string }
  usuarios: { nombre: string }
}
```

- [ ] **Step 2: Verify types compile**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add Reserva and ReservaConDetalles types"
```

---

## Task 3: Supabase Lib — `reservas.ts`

**Files:**
- Create: `src/lib/supabase/reservas.ts`

- [ ] **Step 1: Create the file with all five query functions**

```ts
import { supabase } from './client'
import type { Reserva, ReservaConDetalles } from '@/types'

export async function getSlotsTomados(canchaId: string, fecha: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select('slot_inicio')
    .eq('cancha_id', canchaId)
    .eq('fecha', fecha)
    .in('estado', ['pendiente', 'confirmada'])
  if (error) throw error
  return (data as { slot_inicio: string }[]).map((r) => r.slot_inicio)
}

export async function createReserva(
  values: Pick<Reserva, 'cancha_id' | 'usuario_id' | 'fecha' | 'slot_inicio'>,
): Promise<void> {
  const { error } = await supabase.from('reservas').insert(values)
  if (error) throw error
}

export async function getReservas(): Promise<ReservaConDetalles[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select('*, canchas(nombre), usuarios(nombre)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as ReservaConDetalles[]
}

export async function getMisReservas(usuarioId: string): Promise<ReservaConDetalles[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select('*, canchas(nombre), usuarios(nombre)')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })
    .limit(3)
  if (error) throw error
  return data as ReservaConDetalles[]
}

export async function updateReservaEstado(
  id: string,
  estado: 'confirmada' | 'cancelada',
): Promise<void> {
  const { error } = await supabase.from('reservas').update({ estado }).eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 2: Verify types compile**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/reservas.ts
git commit -m "feat(supabase): add reservas query functions"
```

---

## Task 4: Auth Redirect — ProtectedRoute + Login

**Files:**
- Modify: `src/components/ProtectedRoute.tsx`
- Modify: `src/pages/Login.tsx`

### ProtectedRoute

- [ ] **Step 1: Add `useLocation` and pass `?redirect=` to login redirect**

Current `src/components/ProtectedRoute.tsx`:
```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
```

Replace the full file with:
```tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

type Props = {
  children: React.ReactNode
  requiredRole?: 'admin' | 'user'
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F8]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#072f1a]/20 border-t-[#072f1a]" />
      </div>
    )
  }

  if (!user) return <Navigate to={`/login?redirect=${location.pathname}`} replace />
  if (requiredRole && profile?.rol !== requiredRole) return <Navigate to="/" replace />

  return <>{children}</>
}
```

### Login

- [ ] **Step 2: Consume `?redirect=` after successful login**

In `src/pages/Login.tsx`, add `useLocation` to the import:

```tsx
import { Link, useNavigate, useLocation } from 'react-router-dom'
```

Add `const location = useLocation()` after `const navigate = useNavigate()`:

```tsx
const navigate = useNavigate()
const location = useLocation()
```

Replace the navigation line inside `handleSubmit` (currently `navigate(profile?.rol === 'admin' ? '/admin' : '/')`):

```tsx
const params = new URLSearchParams(location.search)
const redirect = params.get('redirect')
const dest = redirect?.startsWith('/') ? redirect : profile?.rol === 'admin' ? '/admin' : '/'
navigate(dest)
```

- [ ] **Step 3: Verify types compile**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProtectedRoute.tsx src/pages/Login.tsx
git commit -m "feat(auth): redirect to original destination after login"
```

---

## Task 5: App.tsx — Add Routes

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add lazy imports for Reservar and MisReservas**

After the existing lazy imports in `src/App.tsx`, add:

```tsx
const Reservar = lazy(() => import('@/pages/Reservar'))
const MisReservas = lazy(() => import('@/pages/MisReservas'))
```

- [ ] **Step 2: Add routes inside `<Routes>`, before the `/admin` route**

```tsx
<Route
  path="/reservar"
  element={
    <ProtectedRoute>
      <Reservar />
    </ProtectedRoute>
  }
/>
<Route
  path="/mis-reservas"
  element={
    <ProtectedRoute>
      <MisReservas />
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 3: Verify types compile**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat(routing): add /reservar and /mis-reservas protected routes"
```

---

## Task 6: Home.tsx — Wire Navigation Links

**Files:**
- Modify: `src/pages/Home.tsx`

The page already imports `Link` from `react-router-dom`. Four places need updating.

- [ ] **Step 1: Wire desktop nav "Reservar" link**

Find the desktop nav links block (inside the `<div className="hidden items-center ...">` section) where `NAV_LINKS.map()` renders `<a href={#${link.toLowerCase()}}>`. Replace the entire `.map()` call:

```tsx
{NAV_LINKS.map((link) =>
  link === 'Reservar' ? (
    <Link
      key={link}
      to="/reservar"
      className="rounded-full px-4 py-2 text-[11px] font-medium whitespace-nowrap text-[#57534E] transition-all duration-200 hover:bg-[#121210]/[0.05] hover:text-[#121210]"
    >
      {link}
    </Link>
  ) : (
    <a
      key={link}
      href={`#${link.toLowerCase()}`}
      className="rounded-full px-4 py-2 text-[11px] font-medium whitespace-nowrap text-[#57534E] transition-all duration-200 hover:bg-[#121210]/[0.05] hover:text-[#121210]"
    >
      {link}
    </a>
  ),
)}
```

- [ ] **Step 2: Wire mobile nav "Reservar" link**

Find the mobile menu nav links block (inside the full-screen overlay, `className="flex h-[calc(100%-160px)] flex-col ..."`). Replace the `.map()` call:

```tsx
{NAV_LINKS.map((link) =>
  link === 'Reservar' ? (
    <Link
      key={link}
      to="/reservar"
      onClick={() => setMenuOpen(false)}
      className="text-[2.8rem] font-extrabold tracking-[-0.02em] text-[#072f1a] transition-colors duration-200 hover:text-[#12D176]"
    >
      {link}
    </Link>
  ) : (
    <a
      key={link}
      href={`#${link.toLowerCase()}`}
      onClick={() => setMenuOpen(false)}
      className="text-[2.8rem] font-extrabold tracking-[-0.02em] text-[#072f1a] transition-colors duration-200 hover:text-[#12D176]"
    >
      {link}
    </a>
  ),
)}
```

- [ ] **Step 3: Wire Hero "Reservar ahora" button**

Find `<button className={CLS.btnDark}>Reservar ahora</button>` in the `Hero` component. Replace with:

```tsx
<Link to="/reservar" className={CLS.btnDark}>Reservar ahora</Link>
```

- [ ] **Step 4: Wire HowItWorks "Empezar" button**

Find `<button className={CLS.btnGhost}>Empezar →</button>` in the `HowItWorks` component. Replace with:

```tsx
<Link to="/reservar" className={CLS.btnGhost}>Empezar →</Link>
```

- [ ] **Step 5: Verify types compile and lint passes**

```bash
pnpm type-check && pnpm lint
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat(nav): wire Reservar links and Empezar button to /reservar"
```

---

## Task 7: Reservar.tsx — 3-Step Booking Stepper

**Files:**
- Create: `src/pages/Reservar.tsx`

- [ ] **Step 1: Create the full page**

```tsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getCanchas } from '@/lib/supabase/canchas'
import { getSlotsTomados, createReserva } from '@/lib/supabase/reservas'
import type { Cancha } from '@/types'

type ReservaState = {
  step: 1 | 2 | 3
  cancha: Cancha | null
  fecha: string | null
  slot: string | null
}

function generateSlots(slotsPorDia: number): string[] {
  return Array.from({ length: slotsPorDia }, (_, i) => {
    const hour = 8 + i
    return `${String(hour).padStart(2, '0')}:00`
  })
}

function getDates(): string[] {
  const today = new Date()
  return Array.from({ length: 10 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  })
}

function formatFecha(fecha: string): { weekday: string; day: string; month: string } {
  const [y, m, d] = fecha.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = date.toLocaleDateString('es-ES', { weekday: 'short' })
  const day = date.toLocaleDateString('es-ES', { day: 'numeric' })
  const month = date.toLocaleDateString('es-ES', { month: 'short' })
  return { weekday, day, month }
}

export default function Reservar() {
  const { user } = useAuth()
  const [state, setState] = useState<ReservaState>({
    step: 1,
    cancha: null,
    fecha: null,
    slot: null,
  })
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const [slotsTomados, setSlotsTomados] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    getCanchas()
      .then((all) => setCanchas(all.filter((c) => c.estado === 'activa')))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (state.step === 3 && state.cancha && state.fecha) {
      getSlotsTomados(state.cancha.id, state.fecha)
        .then(setSlotsTomados)
        .catch(console.error)
    }
  }, [state.step, state.cancha, state.fecha])

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleConfirm() {
    if (!state.cancha || !state.fecha || !state.slot || !user) return
    setSubmitting(true)
    try {
      await createReserva({
        cancha_id: state.cancha.id,
        usuario_id: user.id,
        fecha: state.fecha,
        slot_inicio: state.slot + ':00',
      })
      showToast('Reserva enviada, el admin la confirmará pronto.', 'success')
      setState({ step: 1, cancha: null, fecha: null, slot: null })
    } catch (err: unknown) {
      const isConflict =
        err instanceof Error &&
        (err.message.includes('unique') || err.message.includes('duplicate'))
      showToast(
        isConflict ? 'Ese horario ya fue reservado. Elige otro.' : 'Error al crear la reserva.',
        'error',
      )
    }
    setSubmitting(false)
  }

  const stepLabels = ['Cancha', 'Fecha', 'Horario']

  return (
    <div className="min-h-screen bg-[#F9F9F8] px-6 py-16">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-xl transition-all ${
            toast.type === 'success' ? 'bg-[#072f1a] text-[#F2F0EB]' : 'bg-red-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.3em] text-[#12D176] uppercase">
            Reserva
          </p>
          <h1 className="font-display text-4xl font-extrabold text-[#121210]">
            {state.step === 1 && 'Elige tu cancha'}
            {state.step === 2 && 'Elige la fecha'}
            {state.step === 3 && 'Elige el horario'}
          </h1>
        </div>

        {/* Step indicator */}
        <div className="mb-10 flex items-center gap-3">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    state.step === n
                      ? 'bg-[#072f1a] text-[#F2F0EB]'
                      : state.step > n
                        ? 'bg-[#12D176] text-[#072f1a]'
                        : 'bg-[#E8E6E0] text-[#9C9790]'
                  }`}
                >
                  {n}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    state.step === n ? 'text-[#121210]' : 'text-[#9C9790]'
                  }`}
                >
                  {stepLabels[n - 1]}
                </span>
              </div>
              {n < 3 && (
                <div
                  className={`h-px w-8 transition-all ${state.step > n ? 'bg-[#12D176]' : 'bg-[#E8E6E0]'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Cancha */}
        {state.step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {canchas.length === 0 && (
              <p className="text-sm text-[#9C9790]">No hay canchas disponibles.</p>
            )}
            {canchas.map((c) => (
              <button
                key={c.id}
                onClick={() => setState((s) => ({ ...s, step: 2, cancha: c }))}
                className="rounded-3xl border border-[#E8E6E0] bg-white p-5 text-left transition-all hover:border-[#072f1a]/30 hover:shadow-md active:scale-[0.98]"
              >
                {c.imagen_url && (
                  <img
                    src={c.imagen_url}
                    alt={c.nombre}
                    className="mb-4 h-40 w-full rounded-2xl object-cover"
                  />
                )}
                <p className="font-bold text-[#121210]">{c.nombre}</p>
                <p className="mt-1 text-sm text-[#9C9790]">
                  {c.tipo} · ${c.precio_por_slot}/hora
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Fecha */}
        {state.step === 2 && (
          <div>
            <button
              onClick={() => setState((s) => ({ ...s, step: 1, fecha: null }))}
              className="mb-6 text-sm text-[#9C9790] transition-colors hover:text-[#121210]"
            >
              ← Atrás
            </button>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {getDates().map((d) => {
                const { weekday, day, month } = formatFecha(d)
                return (
                  <button
                    key={d}
                    onClick={() => setState((s) => ({ ...s, step: 3, fecha: d }))}
                    className="group rounded-2xl border border-[#E8E6E0] bg-white py-4 text-center transition-all hover:border-[#072f1a] hover:bg-[#072f1a] active:scale-[0.97]"
                  >
                    <p className="text-xs text-[#9C9790] group-hover:text-[#F2F0EB]/60 capitalize">
                      {weekday}
                    </p>
                    <p className="text-xl font-bold text-[#121210] group-hover:text-[#F2F0EB]">
                      {day}
                    </p>
                    <p className="text-xs text-[#9C9790] group-hover:text-[#F2F0EB]/60 capitalize">
                      {month}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: Horario */}
        {state.step === 3 && state.cancha && (
          <div>
            <button
              onClick={() => setState((s) => ({ ...s, step: 2, slot: null }))}
              className="mb-6 text-sm text-[#9C9790] transition-colors hover:text-[#121210]"
            >
              ← Atrás
            </button>
            <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {generateSlots(state.cancha.slots_por_dia).map((slot) => {
                const taken = slotsTomados.some((t) => t.slice(0, 5) === slot)
                const selected = state.slot === slot
                return (
                  <button
                    key={slot}
                    disabled={taken}
                    onClick={() => setState((s) => ({ ...s, slot }))}
                    className={`rounded-2xl border py-3 text-sm font-semibold transition-all ${
                      taken
                        ? 'cursor-not-allowed border-[#E8E6E0] bg-[#F5F4F1] text-[#BCBAB5] line-through'
                        : selected
                          ? 'border-[#072f1a] bg-[#072f1a] text-[#F2F0EB]'
                          : 'border-[#E8E6E0] bg-white text-[#121210] hover:border-[#072f1a]/40 active:scale-[0.97]'
                    }`}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
            <button
              disabled={!state.slot || submitting}
              onClick={handleConfirm}
              className="w-full rounded-2xl bg-[#12D176] py-4 text-sm font-bold text-[#072f1a] transition-all hover:bg-[#0fb86a] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? 'Guardando...' : 'Confirmar reserva'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify types compile and lint passes**

```bash
pnpm type-check && pnpm lint
```

Expected: no errors.

- [ ] **Step 3: Smoke-test in browser**

```bash
pnpm dev
```

1. Visit `http://localhost:5173/reservar` while logged out → should redirect to `/login?redirect=/reservar`
2. Log in → should land on `/reservar`
3. Step 1: cancha cards appear (from real Supabase data)
4. Select a cancha → advances to step 2
5. Select a date → advances to step 3
6. Slots are generated starting at 08:00
7. Select a slot → "Confirmar reserva" enables
8. Click confirm → toast success appears, stepper resets to step 1
9. Revisit same cancha+date+slot → that slot appears disabled

- [ ] **Step 4: Commit**

```bash
git add src/pages/Reservar.tsx
git commit -m "feat(pages): add /reservar 3-step booking stepper"
```

---

## Task 8: MisReservas.tsx — Read-Only Last 3 Reservas

**Files:**
- Create: `src/pages/MisReservas.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getMisReservas } from '@/lib/supabase/reservas'
import type { ReservaConDetalles } from '@/types'

const ESTADO_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  confirmada: 'bg-green-50 text-green-700 border border-green-200',
  cancelada: 'bg-red-50 text-red-600 border border-red-200',
}

export default function MisReservas() {
  const { user } = useAuth()
  const [reservas, setReservas] = useState<ReservaConDetalles[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getMisReservas(user.id)
      .then(setReservas)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="min-h-screen bg-[#F9F9F8] px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 text-[11px] font-semibold tracking-[0.3em] text-[#12D176] uppercase">
          Mi historial
        </p>
        <h1 className="mb-8 font-display text-4xl font-extrabold text-[#121210]">Mis reservas</h1>

        {loading && (
          <div className="flex items-center gap-3 text-sm text-[#9C9790]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#072f1a]/20 border-t-[#072f1a]" />
            Cargando...
          </div>
        )}

        {!loading && reservas.length === 0 && (
          <p className="text-sm text-[#9C9790]">Aún no tienes reservas.</p>
        )}

        <div className="flex flex-col gap-4">
          {reservas.map((r) => (
            <div key={r.id} className="rounded-3xl border border-[#E8E6E0] bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-[#121210]">{r.canchas.nombre}</p>
                  <p className="mt-1 text-sm text-[#9C9790]">
                    {r.fecha} · {r.slot_inicio.slice(0, 5)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${ESTADO_STYLES[r.estado]}`}
                >
                  {r.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify types compile**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 3: Smoke-test in browser**

```bash
pnpm dev
```

Visit `http://localhost:5173/mis-reservas` — should show up to 3 reservas for the logged-in user (or empty state if none).

- [ ] **Step 4: Commit**

```bash
git add src/pages/MisReservas.tsx
git commit -m "feat(pages): add /mis-reservas read-only history page"
```

---

## Task 9: Admin Reservas.tsx — Functional Table with Approve/Reject

**Files:**
- Rewrite: `src/pages/admin/Reservas.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
import { useState, useEffect } from 'react'
import { getReservas, updateReservaEstado } from '@/lib/supabase/reservas'
import type { ReservaConDetalles } from '@/types'

type FilterTab = 'todas' | 'pendiente' | 'confirmada' | 'cancelada'
type ConfirmDialog = { id: string; action: 'confirmada' | 'cancelada' } | null

const ESTADO_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  confirmada: 'bg-green-50 text-green-700 border border-green-200',
  cancelada: 'bg-red-50 text-red-600 border border-red-200',
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'confirmada', label: 'Confirmadas' },
  { key: 'cancelada', label: 'Canceladas' },
]

export default function Reservas() {
  const [reservas, setReservas] = useState<ReservaConDetalles[]>([])
  const [filter, setFilter] = useState<FilterTab>('todas')
  const [dialog, setDialog] = useState<ConfirmDialog>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  useEffect(() => {
    getReservas()
      .then(setReservas)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    filter === 'todas' ? reservas : reservas.filter((r) => r.estado === filter)

  async function handleAction() {
    if (!dialog) return
    setActing(true)
    try {
      await updateReservaEstado(dialog.id, dialog.action)
      setReservas((prev) =>
        prev.map((r) => (r.id === dialog.id ? { ...r, estado: dialog.action } : r)),
      )
    } catch (err) {
      console.error(err)
    }
    setActing(false)
    setDialog(null)
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-7">
        <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-[#12D176] uppercase">
          Gestión
        </p>
        <h1 className="font-display text-[22px] leading-tight font-bold text-[#0d1a12]">
          Reservas
        </h1>
        <p className="mt-1 text-[13px] text-[#9C9790]">
          Historial y estado de todas las reservas
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              filter === t.key
                ? 'bg-[#072f1a] text-[#F2F0EB]'
                : 'bg-[#F5F4F1] text-[#9C9790] hover:text-[#121210]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[12px] border border-[#EBEBEA] bg-white">
        <div className="flex items-center justify-between border-b border-[#F2F1EE] px-5 py-4">
          <span className="text-[14px] font-semibold text-[#0d1a12]">
            {filter === 'todas' ? 'Todas las reservas' : `Reservas — ${filter}s`}
          </span>
          <span className="inline-flex h-[22px] items-center rounded-full bg-[#F5F4F1] px-2.5 text-[11px] font-medium text-[#9C9790]">
            {filtered.length} reservas
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-sm text-[#9C9790]">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#F5F4F1]">
                <svg
                  className="h-5 w-5 text-[#BCBAB5]"
                  fill="none"
                  viewBox="0 0 18 18"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <rect x="1.5" y="2.5" width="15" height="14" rx="1.5" />
                  <path d="M13 1v3M5 1v3M1.5 8h15" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[#6B6862]">Sin reservas aún</p>
              <p className="mt-1 text-[12px] text-[#9C9790]">Las reservas aparecerán aquí</p>
            </div>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[#F2F1EE]">
                  {['Usuario', 'Cancha', 'Fecha', 'Horario', 'Estado', 'Acciones'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-left text-[11px] font-semibold tracking-[0.04em] text-[#BCBAB5] uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-[#F2F1EE] last:border-0">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#0d1a12]">
                      {r.usuarios.nombre}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#57534E]">
                      {r.canchas.nombre}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#57534E]">{r.fecha}</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#57534E]">
                      {r.slot_inicio.slice(0, 5)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${ESTADO_STYLES[r.estado]}`}
                      >
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {r.estado === 'pendiente' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDialog({ id: r.id, action: 'confirmada' })}
                            className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700 transition-colors hover:bg-green-100"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => setDialog({ id: r.id, action: 'cancelada' })}
                            className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-100"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
            <p className="mb-2 text-[16px] font-bold text-[#0d1a12]">
              {dialog.action === 'confirmada' ? '¿Aprobar esta reserva?' : '¿Rechazar esta reserva?'}
            </p>
            <p className="mb-7 text-[13px] text-[#9C9790]">
              Esta acción cambiará el estado de la reserva.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDialog(null)}
                className="flex-1 rounded-2xl border border-[#E8E6E0] py-3 text-[13px] font-semibold text-[#57534E] transition-colors hover:border-[#121210]/20"
              >
                Cancelar
              </button>
              <button
                disabled={acting}
                onClick={handleAction}
                className={`flex-1 rounded-2xl py-3 text-[13px] font-bold text-white transition-all disabled:opacity-50 ${
                  dialog.action === 'confirmada'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {acting ? '...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify types compile and lint passes**

```bash
pnpm type-check && pnpm lint
```

Expected: no errors.

- [ ] **Step 3: Smoke-test in browser as admin**

```bash
pnpm dev
```

1. Log in as admin → go to `/admin/reservas`
2. Table shows all reservas from Supabase (or empty state)
3. Filter tabs filter correctly
4. `pendiente` rows show Aprobar/Rechazar buttons
5. Click Aprobar → dialog appears → Confirm → row estado updates to `confirmada`
6. Click Rechazar → dialog appears → Confirm → row estado updates to `cancelada`
7. Approved/rejected rows no longer show action buttons

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/Reservas.tsx
git commit -m "feat(admin): implement reservas table with approve/reject flow"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All spec sections covered — DB migration (Task 1), types (Task 2), lib (Task 3), auth redirect (Task 4), routes (Task 5), nav (Task 6), Reservar page (Task 7), MisReservas (Task 8), admin Reservas (Task 9)
- [x] **No placeholders:** All tasks contain complete code
- [x] **Type consistency:** `ReservaConDetalles` defined in Task 2, used in Tasks 3/8/9. `Reserva` defined in Task 2, used in Task 3. `Cancha` from existing types, used in Task 7. All function signatures match across tasks.
- [x] **`slot_inicio` format:** DB stores `time` → Supabase returns `'HH:MM:SS'`. Frontend generates `'HH:00'`. Comparison uses `.slice(0, 5)` to normalize. Applied in Task 7 (`slotsTomados.some(t => t.slice(0, 5) === slot)`) and Tasks 8/9 (`r.slot_inicio.slice(0, 5)`).
- [x] **Date timezone safety:** `getDates()` in Task 7 uses local `Date` arithmetic (not `toISOString()`) to avoid UTC shift bugs.
- [x] **Cancelled slots available for rebooking:** `getSlotsTomados` filters `IN ('pendiente', 'confirmada')` only — Task 3.
- [x] **FK for join:** Migration uses `REFERENCES public.usuarios(id)` so PostgREST can resolve `usuarios(nombre)` in join queries — Task 1.
