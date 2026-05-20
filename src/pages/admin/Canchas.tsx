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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
