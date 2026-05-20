# Cancha CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin can create, edit, and activate/deactivate canchas from `/admin/canchas` with full Supabase persistence and optional image upload.

**Architecture:** Single `CanchaModal` handles both create and edit modes. `Canchas.tsx` owns all state and passes callbacks down. Supabase data layer lives in `src/lib/supabase/canchas.ts`. DB created via versioned SQL migration.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Supabase JS v2, Supabase Storage (public bucket `canchas-images`).

---

## File Map

| Action | Path |
|--------|------|
| Create | `supabase/migrations/20260520010000_create_canchas.sql` |
| Modify | `src/types/index.ts` |
| Create | `src/lib/supabase/canchas.ts` |
| Create | `src/components/admin/ConfirmDialog.tsx` |
| Create | `src/components/admin/CanchaModal.tsx` |
| Modify | `src/pages/admin/Canchas.tsx` |

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260520010000_create_canchas.sql`

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/20260520010000_create_canchas.sql`:

```sql
-- canchas table
CREATE TABLE public.canchas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('futbol5', 'futbol7', 'futbol11')),
  slots_por_dia integer NOT NULL CHECK (slots_por_dia > 0),
  precio_por_slot numeric(10, 2) NOT NULL CHECK (precio_por_slot >= 0),
  estado text NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'inactiva')),
  descripcion text,
  imagen_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.canchas ENABLE ROW LEVEL SECURITY;

-- SELECT: authenticated users only
CREATE POLICY "Authenticated users can view canchas"
  ON public.canchas
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: admins only
CREATE POLICY "Admins can insert canchas"
  ON public.canchas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- UPDATE: admins only
CREATE POLICY "Admins can update canchas"
  ON public.canchas
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('canchas-images', 'canchas-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage: authenticated can upload
CREATE POLICY "Authenticated can upload cancha images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'canchas-images');

-- Storage: authenticated can update
CREATE POLICY "Authenticated can update cancha images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'canchas-images');

-- Storage: public read
CREATE POLICY "Public can view cancha images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'canchas-images');
```

- [ ] **Step 2: Apply migration**

Run: `pnpm supabase db push`

Expected: `Applying migration 20260520010000_create_canchas.sql... done`

- [ ] **Step 3: Verify in Supabase dashboard**

Open Supabase → Table Editor → confirm `canchas` table exists with all 9 columns.
Open Supabase → Storage → confirm `canchas-images` bucket exists and is public.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260520010000_create_canchas.sql
git commit -m "feat(db): add canchas table with RLS and storage bucket"
```

---

### Task 2: Cancha Type

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Replace file contents**

Replace entire contents of `src/types/index.ts`:

```ts
export type Cancha = {
  id: string
  nombre: string
  tipo: 'futbol5' | 'futbol7' | 'futbol11'
  slots_por_dia: number
  precio_por_slot: number
  estado: 'activa' | 'inactiva'
  descripcion: string | null
  imagen_url: string | null
  created_at: string
}
```

- [ ] **Step 2: Type check**

Run: `pnpm type-check`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add Cancha type"
```

---

### Task 3: Supabase Data Layer

**Files:**
- Create: `src/lib/supabase/canchas.ts`

- [ ] **Step 1: Create file**

Create `src/lib/supabase/canchas.ts`:

```ts
import { supabase } from './client'
import type { Cancha } from '@/types'

export async function getCanchas(): Promise<Cancha[]> {
  const { data, error } = await supabase
    .from('canchas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Cancha[]
}

export async function createCancha(
  values: Omit<Cancha, 'id' | 'created_at'>,
): Promise<Cancha> {
  const { data, error } = await supabase
    .from('canchas')
    .insert(values)
    .select()
    .single()
  if (error) throw error
  return data as Cancha
}

export async function updateCancha(
  id: string,
  values: Partial<Omit<Cancha, 'id' | 'created_at'>>,
): Promise<Cancha> {
  const { data, error } = await supabase
    .from('canchas')
    .update(values)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Cancha
}

export async function uploadCanchaImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage
    .from('canchas-images')
    .upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('canchas-images').getPublicUrl(path)
  return data.publicUrl
}
```

- [ ] **Step 2: Type check**

Run: `pnpm type-check`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/canchas.ts
git commit -m "feat(data): add canchas Supabase data layer"
```

---

### Task 4: ConfirmDialog Component

**Files:**
- Create: `src/components/admin/ConfirmDialog.tsx`

- [ ] **Step 1: Create file**

Create `src/components/admin/ConfirmDialog.tsx`:

```tsx
type Props = {
  open: boolean
  title: string
  body: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#072f1a]/20 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded-[14px] border border-[#EBEBEA] bg-white p-6 shadow-xl">
        <h2 className="font-display text-[16px] font-bold text-[#0d1a12]">{title}</h2>
        <p className="mt-2 text-[13px] text-[#6B6862]">{body}</p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="h-[34px] rounded-[8px] border border-[#EBEBEA] px-4 text-[13px] font-semibold text-[#6B6862] transition-colors hover:bg-[#F5F4F1]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="h-[34px] rounded-[8px] bg-[#072f1a] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#0a3d22]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type check**

Run: `pnpm type-check`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ConfirmDialog.tsx
git commit -m "feat(ui): add ConfirmDialog admin component"
```

---

### Task 5: CanchaModal Component

**Files:**
- Create: `src/components/admin/CanchaModal.tsx`

- [ ] **Step 1: Create file**

Create `src/components/admin/CanchaModal.tsx`:

```tsx
import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react'
import type { Cancha } from '@/types'
import { uploadCanchaImage } from '@/lib/supabase/canchas'

type Props = {
  open: boolean
  cancha: Cancha | null
  onClose: () => void
  onSave: (values: Omit<Cancha, 'id' | 'created_at'>) => Promise<void>
}

const TIPOS = [
  { value: 'futbol5', label: 'Fútbol 5' },
  { value: 'futbol7', label: 'Fútbol 7' },
  { value: 'futbol11', label: 'Fútbol 11' },
] as const

const EMPTY: Omit<Cancha, 'id' | 'created_at'> = {
  nombre: '',
  tipo: 'futbol5',
  slots_por_dia: 8,
  precio_por_slot: 0,
  estado: 'activa',
  descripcion: null,
  imagen_url: null,
}

export default function CanchaModal({ open, cancha, onClose, onSave }: Props) {
  const [form, setForm] = useState<Omit<Cancha, 'id' | 'created_at'>>(EMPTY)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setForm(
      cancha
        ? {
            nombre: cancha.nombre,
            tipo: cancha.tipo,
            slots_por_dia: cancha.slots_por_dia,
            precio_por_slot: cancha.precio_por_slot,
            estado: cancha.estado,
            descripcion: cancha.descripcion,
            imagen_url: cancha.imagen_url,
          }
        : EMPTY,
    )
    setImageFile(null)
    setImagePreview(cancha?.imagen_url ?? null)
    setError(null)
  }, [open, cancha])

  if (!open) return null

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    setForm((f) => ({ ...f, imagen_url: null }))
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.nombre.trim()) return setError('El nombre es requerido.')
    if (form.slots_por_dia < 1) return setError('Slots/día debe ser al menos 1.')
    if (form.precio_por_slot < 0) return setError('El precio no puede ser negativo.')

    setSaving(true)
    try {
      let imagen_url = form.imagen_url
      if (imageFile) {
        imagen_url = await uploadCanchaImage(imageFile)
      }
      await onSave({ ...form, imagen_url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la cancha.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-[#072f1a]/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[16px] border border-[#EBEBEA] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2F1EE] px-5 py-4">
          <h2 className="font-display text-[16px] font-bold text-[#0d1a12]">
            {cancha ? 'Editar cancha' : 'Nueva cancha'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#BCBAB5] hover:bg-[#F5F4F1] hover:text-[#6B6862]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
              <path d="M4 12L12 4M4 4l8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Nombre */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#0d1a12]">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Cancha Norte"
              className="h-[38px] w-full rounded-[8px] border border-[#EBEBEA] px-3 text-[13px] text-[#0d1a12] placeholder-[#BCBAB5] outline-none transition-colors focus:border-[#12D176] focus:ring-2 focus:ring-[#12D176]/10"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#0d1a12]">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as Cancha['tipo'] }))}
              className="h-[38px] w-full rounded-[8px] border border-[#EBEBEA] px-3 text-[13px] text-[#0d1a12] outline-none transition-colors focus:border-[#12D176] focus:ring-2 focus:ring-[#12D176]/10"
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Slots y Precio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#0d1a12]">
                Slots/día <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.slots_por_dia}
                onChange={(e) => setForm((f) => ({ ...f, slots_por_dia: Number(e.target.value) }))}
                className="h-[38px] w-full rounded-[8px] border border-[#EBEBEA] px-3 text-[13px] text-[#0d1a12] outline-none transition-colors focus:border-[#12D176] focus:ring-2 focus:ring-[#12D176]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#0d1a12]">
                Precio/slot <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[13px] text-[#9C9790]">
                  ₡
                </span>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={form.precio_por_slot}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, precio_por_slot: Number(e.target.value) }))
                  }
                  className="h-[38px] w-full rounded-[8px] border border-[#EBEBEA] pl-7 pr-3 text-[13px] text-[#0d1a12] outline-none transition-colors focus:border-[#12D176] focus:ring-2 focus:ring-[#12D176]/10"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#0d1a12]">
              Descripción{' '}
              <span className="text-[11px] font-normal text-[#9C9790]">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={form.descripcion ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, descripcion: e.target.value || null }))
              }
              placeholder="Cancha con iluminación LED, vestidores..."
              className="w-full resize-none rounded-[8px] border border-[#EBEBEA] px-3 py-2.5 text-[13px] text-[#0d1a12] placeholder-[#BCBAB5] outline-none transition-colors focus:border-[#12D176] focus:ring-2 focus:ring-[#12D176]/10"
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#0d1a12]">
              Imagen{' '}
              <span className="text-[11px] font-normal text-[#9C9790]">(opcional)</span>
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-28 w-full rounded-[8px] object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[#6B6862] shadow hover:text-red-500"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 12L12 4M4 4l8 8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-28 w-full items-center justify-center rounded-[8px] border border-dashed border-[#EBEBEA] bg-[#F5F4F1] text-[13px] text-[#9C9790] transition-colors hover:border-[#12D176] hover:text-[#0d1a12]"
              >
                + Seleccionar imagen
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-[8px] bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-[#F2F1EE] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-[34px] rounded-[8px] border border-[#EBEBEA] px-4 text-[13px] font-semibold text-[#6B6862] transition-colors hover:bg-[#F5F4F1]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-[34px] rounded-[8px] bg-[#072f1a] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#0a3d22] disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type check**

Run: `pnpm type-check`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/CanchaModal.tsx
git commit -m "feat(ui): add CanchaModal with create/edit and image upload"
```

---

### Task 6: Wire Up Canchas Page

**Files:**
- Modify: `src/pages/admin/Canchas.tsx`

- [ ] **Step 1: Replace file contents**

Replace entire contents of `src/pages/admin/Canchas.tsx`:

```tsx
import { useState, useEffect } from 'react'
import type { Cancha } from '@/types'
import { getCanchas, createCancha, updateCancha } from '@/lib/supabase/canchas'
import CanchaModal from '@/components/admin/CanchaModal'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

type Toast = { msg: string; type: 'success' | 'error' }

const TIPO_LABELS: Record<Cancha['tipo'], string> = {
  futbol5: 'Fútbol 5',
  futbol7: 'Fútbol 7',
  futbol11: 'Fútbol 11',
}

export default function Canchas() {
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Cancha | null>(null)
  const [confirm, setConfirm] = useState<{ cancha: Cancha } | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    loadCanchas()
  }, [])

  async function loadCanchas() {
    setLoading(true)
    try {
      const data = await getCanchas()
      setCanchas(data)
    } catch {
      showToast('Error al cargar las canchas.', 'error')
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg: string, type: Toast['type'] = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(cancha: Cancha) {
    setEditing(cancha)
    setModalOpen(true)
  }

  async function handleSave(values: Omit<Cancha, 'id' | 'created_at'>) {
    if (editing) {
      const updated = await updateCancha(editing.id, values)
      setCanchas((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      showToast('Cancha actualizada.')
    } else {
      const created = await createCancha(values)
      setCanchas((prev) => [created, ...prev])
      showToast('Cancha creada exitosamente.')
    }
    setModalOpen(false)
  }

  async function handleToggleEstado() {
    if (!confirm) return
    const { cancha } = confirm
    setConfirm(null)
    try {
      const nuevoEstado = cancha.estado === 'activa' ? 'inactiva' : 'activa'
      const updated = await updateCancha(cancha.id, { estado: nuevoEstado })
      setCanchas((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      showToast(nuevoEstado === 'activa' ? 'Cancha activada.' : 'Cancha desactivada.')
    } catch {
      showToast('Error al actualizar el estado.', 'error')
    }
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-[#12D176] uppercase">
            Gestión
          </p>
          <h1 className="font-display text-[22px] leading-tight font-bold text-[#0d1a12]">
            Canchas
          </h1>
          <p className="mt-1 text-[13px] text-[#9C9790]">
            Campos sintéticos registrados en la plataforma
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex h-[34px] items-center gap-1.5 rounded-[8px] bg-[#072f1a] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#0a3d22]"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 14 14"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M7 2v10M2 7h10" strokeLinecap="round" />
          </svg>
          Nueva cancha
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[12px] border border-[#EBEBEA] bg-white">
        <div className="flex items-center justify-between border-b border-[#F2F1EE] px-5 py-4">
          <span className="text-[14px] font-semibold text-[#0d1a12]">Todas las canchas</span>
          <span className="inline-flex h-[22px] items-center rounded-full bg-[#F5F4F1] px-2.5 text-[11px] font-medium text-[#9C9790]">
            {canchas.length} {canchas.length === 1 ? 'cancha' : 'canchas'}
          </span>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 border-b border-[#F2F1EE] px-5 py-2.5">
          {['Nombre', 'Tipo', 'Slots/día', 'Estado', ''].map((h, i) => (
            <p
              key={i}
              className="text-[11px] font-semibold tracking-[0.04em] text-[#BCBAB5] uppercase"
            >
              {h}
            </p>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-2 p-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-[8px] bg-[#F5F4F1]" />
            ))}
          </div>
        ) : canchas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#F5F4F1]">
              <svg
                className="h-5 w-5 text-[#BCBAB5]"
                fill="none"
                viewBox="0 0 18 18"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <rect x="1" y="2.5" width="16" height="13" rx="1.5" />
                <line x1="9" y1="2.5" x2="9" y2="15.5" />
                <circle cx="9" cy="9" r="2.2" />
              </svg>
            </div>
            <p className="text-[13px] font-semibold text-[#6B6862]">Sin canchas registradas</p>
            <p className="mt-1 text-[12px] text-[#9C9790]">Crea la primera cancha para empezar</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F2F1EE]">
            {canchas.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-3 px-5 py-3"
              >
                {/* Nombre + thumbnail */}
                <div className="flex min-w-0 items-center gap-3">
                  {c.imagen_url ? (
                    <img
                      src={c.imagen_url}
                      alt={c.nombre}
                      className="h-8 w-8 shrink-0 rounded-[6px] object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#F5F4F1]">
                      <svg
                        className="h-4 w-4 text-[#BCBAB5]"
                        fill="none"
                        viewBox="0 0 16 16"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <rect x="1" y="2" width="14" height="12" rx="1.5" />
                        <line x1="8" y1="2" x2="8" y2="14" />
                        <circle cx="8" cy="8" r="1.8" />
                      </svg>
                    </div>
                  )}
                  <span className="truncate text-[13px] font-semibold text-[#0d1a12]">
                    {c.nombre}
                  </span>
                </div>

                {/* Tipo */}
                <span className="text-[13px] text-[#6B6862]">{TIPO_LABELS[c.tipo]}</span>

                {/* Slots/día */}
                <span className="text-[13px] text-[#6B6862]">{c.slots_por_dia}</span>

                {/* Estado badge */}
                <span
                  className={`inline-flex h-[22px] w-fit items-center rounded-full px-2.5 text-[11px] font-semibold ${
                    c.estado === 'activa'
                      ? 'bg-[#ECFDF3] text-[#12D176]'
                      : 'bg-[#F5F4F1] text-[#9C9790]'
                  }`}
                >
                  {c.estado === 'activa' ? 'Activa' : 'Inactiva'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(c)}
                    className="h-[28px] rounded-[6px] border border-[#EBEBEA] px-3 text-[12px] font-semibold text-[#6B6862] transition-colors hover:bg-[#F5F4F1]"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirm({ cancha: c })}
                    className={`h-[28px] rounded-[6px] px-3 text-[12px] font-semibold transition-colors ${
                      c.estado === 'activa'
                        ? 'border border-[#EBEBEA] text-[#6B6862] hover:border-red-200 hover:bg-red-50 hover:text-red-500'
                        : 'border border-[#EBEBEA] text-[#12D176] hover:bg-[#ECFDF3]'
                    }`}
                  >
                    {c.estado === 'activa' ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <CanchaModal
        open={modalOpen}
        cancha={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.cancha.estado === 'activa' ? 'Desactivar cancha' : 'Activar cancha'}
        body={
          confirm
            ? confirm.cancha.estado === 'activa'
              ? `¿Desactivar "${confirm.cancha.nombre}"? Los usuarios no podrán reservarla.`
              : `¿Activar "${confirm.cancha.nombre}"? Volverá a estar disponible para reservas.`
            : ''
        }
        confirmLabel={confirm?.cancha.estado === 'activa' ? 'Desactivar' : 'Activar'}
        onConfirm={handleToggleEstado}
        onCancel={() => setConfirm(null)}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-[10px] px-4 py-3 text-[13px] font-semibold shadow-lg ${
            toast.type === 'success' ? 'bg-[#072f1a] text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <svg
              className="h-4 w-4 text-[#12D176]"
              fill="none"
              viewBox="0 0 16 16"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M3 8l4 4 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 16 16"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M4 12L12 4M4 4l8 8" strokeLinecap="round" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type check**

Run: `pnpm type-check`
Expected: No errors.

- [ ] **Step 3: Start dev server and verify manually**

Run: `pnpm dev` then open `http://localhost:5173/admin/canchas` (must be logged in as admin).

Test checklist:
- [ ] Table loads with "Sin canchas registradas" and pulse skeleton while fetching
- [ ] "Nueva cancha" opens modal
- [ ] Fill required fields, submit → cancha appears in table, success toast shows
- [ ] Click "Editar" → modal opens with pre-filled values, edit and save → row updates
- [ ] Upload image → preview shows in modal; after save, thumbnail appears in row
- [ ] Click "Desactivar" → confirm dialog appears with cancha name
- [ ] Confirm → badge turns grey "Inactiva", button changes to "Activar"
- [ ] Click "Activar" → badge turns green "Activa", button changes to "Desactivar"
- [ ] Cancel confirm dialog → no change to estado

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/Canchas.tsx
git commit -m "feat(admin): implement cancha CRUD with modal, confirm, and toasts"
```
