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
