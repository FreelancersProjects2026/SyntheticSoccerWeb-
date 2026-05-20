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
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    getReservas()
      .then(setReservas)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'todas' ? reservas : reservas.filter((r) => r.estado === filter)

  async function handleAction() {
    if (!dialog) return
    setActing(true)
    setActionError(null)
    try {
      await updateReservaEstado(dialog.id, dialog.action)
      setReservas((prev) =>
        prev.map((r) => (r.id === dialog.id ? { ...r, estado: dialog.action } : r)),
      )
      setDialog(null)
    } catch (err) {
      console.error(err)
      setActionError('No se pudo actualizar la reserva. Intenta de nuevo.')
    } finally {
      setActing(false)
    }
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
        <p className="mt-1 text-[13px] text-[#9C9790]">Historial y estado de todas las reservas</p>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
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
          <>
            {/* Mobile: card list */}
            <div className="divide-y divide-[#F2F1EE] md:hidden">
              {filtered.map((r) => (
                <div key={r.id} className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#0d1a12]">
                        {r.usuarios?.nombre ?? '—'}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#57534E]">
                        {r.canchas?.nombre ?? '—'}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${ESTADO_STYLES[r.estado]}`}
                    >
                      {r.estado}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9C9790]">
                    {r.fecha} · {r.slot_inicio.slice(0, 5)} hs
                  </p>
                  {r.estado === 'pendiente' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          setActionError(null)
                          setDialog({ id: r.id, action: 'confirmada' })
                        }}
                        className="flex-1 rounded-full bg-green-50 py-2 text-[12px] font-semibold text-green-700 transition-colors hover:bg-green-100 active:scale-[0.98]"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => {
                          setActionError(null)
                          setDialog({ id: r.id, action: 'cancelada' })
                        }}
                        className="flex-1 rounded-full bg-red-50 py-2 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-100 active:scale-[0.98]"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden overflow-x-auto md:block">
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
                        {r.usuarios?.nombre ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#57534E]">
                        {r.canchas?.nombre ?? '—'}
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
                              onClick={() => {
                                setActionError(null)
                                setDialog({ id: r.id, action: 'confirmada' })
                              }}
                              className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700 transition-colors hover:bg-green-100"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => {
                                setActionError(null)
                                setDialog({ id: r.id, action: 'cancelada' })
                              }}
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
            </div>
          </>
        )}
      </div>

      {/* Confirmation dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
            <p className="mb-2 text-[16px] font-bold text-[#0d1a12]">
              {dialog.action === 'confirmada'
                ? '¿Aprobar esta reserva?'
                : '¿Rechazar esta reserva?'}
            </p>
            <p className="mb-7 text-[13px] text-[#9C9790]">
              Esta acción cambiará el estado de la reserva.
            </p>
            {actionError && (
              <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-[12px] text-red-600">
                {actionError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                disabled={acting}
                onClick={() => setDialog(null)}
                className="flex-1 rounded-2xl border border-[#E8E6E0] py-3 text-[13px] font-semibold text-[#57534E] transition-colors hover:border-[#121210]/20 disabled:opacity-50"
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
