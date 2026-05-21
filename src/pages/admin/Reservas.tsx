import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { formatFechaCorta } from '@/utils/format'
import {
  getReservas,
  getReservaById,
  updateReservaEstado,
  aprobarComprobante,
  rechazarComprobante,
} from '@/lib/supabase/reservas'
import type { ReservaConDetalles } from '@/types'

type FilterTab = 'todas' | 'pendiente' | 'confirmada' | 'pagada' | 'cancelada'
type SortKey = 'usuario' | 'cancha' | 'fecha' | 'estado' | null
type SortDir = 'asc' | 'desc'
type DialogState = { id: string; action: 'confirmada' | 'cancelada' } | null
type ComprobanteModal = ReservaConDetalles | null

const ESTADO = {
  pendiente: {
    pill: 'bg-amber-50 text-amber-700 border border-amber-100',
    dot: '#F59E0B',
    label: 'Pendiente',
  },
  confirmada: {
    pill: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    dot: '#10B981',
    label: 'Confirmada',
  },
  pagada: {
    pill: 'bg-blue-50 text-blue-700 border border-blue-100',
    dot: '#3B82F6',
    label: 'Pagada',
  },
  cancelada: {
    pill: 'bg-red-50 text-red-600 border border-red-100',
    dot: '#EF4444',
    label: 'Cancelada',
  },
} as const

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'confirmada', label: 'Confirmadas' },
  { key: 'pagada', label: 'Pagadas' },
  { key: 'cancelada', label: 'Canceladas' },
]

const SORT_COLS: { key: SortKey; label: string; w: string }[] = [
  { key: 'usuario', label: 'Usuario', w: 'w-[22%]' },
  { key: 'cancha', label: 'Cancha', w: 'w-[20%]' },
  { key: 'fecha', label: 'Fecha', w: 'w-[14%]' },
  { key: null, label: 'Horario', w: 'w-[12%]' },
  { key: 'estado', label: 'Estado', w: 'w-[16%]' },
  { key: null, label: '', w: 'w-[16%]' },
]

function sortRows(list: ReservaConDetalles[], key: SortKey, dir: SortDir) {
  if (!key) return list
  return [...list].sort((a, b) => {
    const map: Record<string, [string, string]> = {
      usuario: [a.usuarios?.nombre ?? '', b.usuarios?.nombre ?? ''],
      cancha: [a.canchas?.nombre ?? '', b.canchas?.nombre ?? ''],
      fecha: [a.fecha, b.fecha],
      estado: [a.estado, b.estado],
    }
    const [av, bv] = map[key]
    return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
  })
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span
      className={`ml-1.5 inline-flex flex-col gap-[2px] transition-opacity duration-150 ${
        active ? 'opacity-100' : 'opacity-0 group-hover:opacity-35'
      }`}
    >
      <svg
        viewBox="0 0 6 4"
        className={`h-[4px] w-[6px] transition-colors ${active && dir === 'asc' ? 'text-[#072f1a]' : 'text-[#BCBAB5]'}`}
        fill="currentColor"
      >
        <path d="M3 0L6 4H0L3 0Z" />
      </svg>
      <svg
        viewBox="0 0 6 4"
        className={`h-[4px] w-[6px] transition-colors ${active && dir === 'desc' ? 'text-[#072f1a]' : 'text-[#BCBAB5]'}`}
        fill="currentColor"
      >
        <path d="M3 4L0 0H6L3 4Z" />
      </svg>
    </span>
  )
}

function StatChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[12px] font-semibold text-[#0d1a12]">{count}</span>
      <span className="text-[12px] text-[#9C9790]">{label}</span>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-5 border-b border-[#F5F4F1] px-5 py-4 last:border-0">
      <div className="h-2 w-28 animate-pulse rounded-full bg-[#F0EFEb]" />
      <div className="h-2 w-20 animate-pulse rounded-full bg-[#F0EFEb]" />
      <div className="h-2 w-16 animate-pulse rounded-full bg-[#F0EFEb]" />
      <div className="h-2 w-10 animate-pulse rounded-full bg-[#F0EFEb]" />
      <div className="h-5 w-20 animate-pulse rounded-full bg-[#F0EFEb]" />
    </div>
  )
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#F5F4F1]">
        <svg
          className="h-5 w-5 text-[#BCBAB5]"
          fill="none"
          viewBox="0 0 18 18"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <rect x="1.5" y="2.5" width="15" height="14" rx="1.5" />
          <path strokeLinecap="round" d="M13 1v3M5 1v3M1.5 8h15" />
        </svg>
      </div>
      <p className="text-[13px] font-semibold text-[#6B6862]">
        {search ? 'Sin resultados' : 'Sin reservas aún'}
      </p>
      <p className="mt-1 text-[12px] text-[#9C9790]">
        {search ? `Sin coincidencias para "${search}"` : 'Las reservas aparecerán aquí'}
      </p>
    </div>
  )
}

function MobileCard({
  r,
  onOpen,
  onApprove,
  onReject,
}: {
  r: ReservaConDetalles
  onOpen: () => void
  onApprove: () => void
  onReject: () => void
}) {
  const est = ESTADO[r.estado as keyof typeof ESTADO]
  return (
    <div
      className="cursor-pointer space-y-3 p-5 transition-colors hover:bg-[#FAFAF9] active:bg-[#F5F4F1]"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[#0d1a12]">
            {r.usuarios?.nombre ?? '—'}
          </p>
          <p className="mt-0.5 text-[12px] text-[#57534E]">{r.canchas?.nombre ?? '—'}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${est.pill}`}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: est.dot }} />
          {r.estado}
        </span>
      </div>
      <p className="text-[11px] text-[#9C9790] tabular-nums">
        {formatFechaCorta(r.fecha)} · {r.slot_inicio.slice(0, 5)} hs
      </p>
      {r.estado === 'pendiente' && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onApprove()
            }}
            className="flex-1 rounded-full bg-emerald-50 py-2 text-[12px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 active:scale-[0.98]"
          >
            Aprobar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onReject()
            }}
            className="flex-1 rounded-full bg-red-50 py-2 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-100 active:scale-[0.98]"
          >
            Rechazar
          </button>
        </div>
      )}
    </div>
  )
}

function ActionDialog({
  dialog,
  acting,
  error,
  onCancel,
  onConfirm,
}: {
  dialog: { action: 'confirmada' | 'cancelada' }
  acting: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-sm sm:items-center"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-t-[28px] bg-white px-7 pt-7 pb-8 shadow-2xl sm:mx-4 sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F5F4F1]">
          {dialog.action === 'confirmada' ? (
            <svg
              className="h-4.5 w-4.5 text-emerald-600"
              fill="none"
              viewBox="0 0 18 18"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l4.5 4.5L15 5" />
            </svg>
          ) : (
            <svg
              className="h-4.5 w-4.5 text-red-500"
              fill="none"
              viewBox="0 0 18 18"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" d="M4 4l10 10M14 4L4 14" />
            </svg>
          )}
        </div>
        <p className="mb-1.5 text-[15px] font-bold text-[#0d1a12]">
          {dialog.action === 'confirmada' ? '¿Aprobar esta reserva?' : '¿Rechazar esta reserva?'}
        </p>
        <p className="mb-6 text-[13px] leading-relaxed text-[#9C9790]">
          Esta acción cambiará el estado de la reserva de forma inmediata.
        </p>
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-[12px] text-red-600">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            disabled={acting}
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-[#E8E6E0] py-3 text-[13px] font-semibold text-[#57534E] transition-colors hover:border-[#121210]/20 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            disabled={acting}
            onClick={onConfirm}
            className={`flex-1 rounded-2xl py-3 text-[13px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 ${
              dialog.action === 'confirmada'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {acting ? '...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ReservaDetailModal({
  r,
  onClose,
  onAprobarComprobante,
  onRechazarComprobante,
}: {
  r: ReservaConDetalles
  onClose: () => void
  onAprobarComprobante: (id: string) => Promise<void>
  onRechazarComprobante: (id: string, motivo: string) => Promise<void>
}) {
  const est = ESTADO[r.estado as keyof typeof ESTADO]
  const [motivo, setMotivo] = useState('')
  const [acting, setActing] = useState(false)
  const [comprobanteError, setComprobanteError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!panelRef.current) return
    const isMobile = window.innerWidth < 640
    if (isMobile) {
      gsap.fromTo(panelRef.current, { y: '100%' }, { y: 0, duration: 0.38, ease: 'power3.out' })
    } else {
      gsap.fromTo(
        panelRef.current,
        { y: 14, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.25, ease: 'power3.out' },
      )
    }
  }, [])

  async function handleAprobar() {
    setActing(true)
    setComprobanteError(null)
    try {
      await onAprobarComprobante(r.id)
      onClose()
    } catch {
      setComprobanteError('No se pudo aprobar. Intenta de nuevo.')
    } finally {
      setActing(false)
    }
  }

  async function handleRechazar() {
    setActing(true)
    setComprobanteError(null)
    try {
      await onRechazarComprobante(r.id, motivo)
      onClose()
    } catch {
      setComprobanteError('No se pudo rechazar. Intenta de nuevo.')
    } finally {
      setActing(false)
    }
  }

  const canReviewComprobante = r.estado === 'confirmada' && !!r.comprobante_url

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:px-4"
      onClick={onClose}
    >
      {/* Panel — bottom sheet on mobile, centered card on desktop */}
      <div
        ref={panelRef}
        className="fixed inset-x-0 bottom-0 max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:relative sm:inset-auto sm:max-h-[88vh] sm:max-w-md sm:rounded-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag pill — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-[#E8E6E0]" />
        </div>

        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#F2F1EE] bg-white px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#12D176] uppercase">
              Reserva
            </p>
            <p className="mt-0.5 text-[15px] font-bold text-[#0d1a12]">
              {r.usuarios?.nombre ?? '—'}
            </p>
            <p className="mt-0.5 text-[12px] text-[#9C9790]">{r.canchas?.nombre ?? '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Estado pill in header — desktop only to avoid duplicate */}
            <span
              className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${est.pill}`}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: est.dot }} />
              {est.label}
            </span>
            <button
              onClick={onClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F4F1] text-[#9C9790] transition-colors hover:bg-[#EBEBEA] hover:text-[#57534E]"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 14 14"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        </div>

        {/* Details — 2-col compact grid on mobile, single-col rows on desktop */}
        <div className="grid grid-cols-2 gap-px bg-[#F2F1EE] sm:block sm:divide-y sm:divide-[#F5F4F1] sm:bg-transparent">
          {/* Estado — shown inline on mobile (hidden in header); on desktop full row */}
          <div className="flex flex-col gap-1 bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:py-3">
            <span className="text-[10px] font-semibold tracking-[0.06em] text-[#9C9790] uppercase sm:text-[11px]">
              Estado
            </span>
            <span
              className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${est.pill}`}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: est.dot }} />
              {est.label}
            </span>
          </div>
          <div className="flex flex-col gap-1 bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:py-3">
            <span className="text-[10px] font-semibold tracking-[0.06em] text-[#9C9790] uppercase sm:text-[11px]">
              Fecha
            </span>
            <span className="text-[13px] font-semibold text-[#0d1a12] tabular-nums">
              {formatFechaCorta(r.fecha)}
            </span>
          </div>
          <div className="flex flex-col gap-1 bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:py-3">
            <span className="text-[10px] font-semibold tracking-[0.06em] text-[#9C9790] uppercase sm:text-[11px]">
              Horario
            </span>
            <span className="text-[13px] font-semibold text-[#0d1a12] tabular-nums">
              {r.slot_inicio.slice(0, 5)} hs
            </span>
          </div>
          <div className="flex flex-col gap-1 bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:py-3">
            <span className="text-[10px] font-semibold tracking-[0.06em] text-[#9C9790] uppercase sm:text-[11px]">
              Total
            </span>
            <strong className="font-display text-[15px] font-extrabold text-[#072f1a]">
              ₡{(r.canchas?.precio_por_slot ?? 0).toLocaleString('es-CR')}
            </strong>
          </div>
        </div>

        {/* Comprobante image */}
        {r.comprobante_url ? (
          <>
            <div className="mx-2 mt-2 overflow-hidden rounded-xl bg-[#F9F9F8]">
              <img
                src={r.comprobante_url}
                alt="Comprobante de pago"
                className="max-h-[26vh] w-full object-contain sm:max-h-[36vh]"
              />
            </div>
            <div className="flex justify-end px-5 pt-2">
              <a
                href={r.comprobante_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-semibold text-[#072f1a] transition-colors hover:text-[#12D176]"
              >
                Abrir original ↗
              </a>
            </div>
          </>
        ) : (
          <div className="mx-5 mt-3 flex items-center gap-2 rounded-xl bg-[#F5F4F1] px-4 py-3">
            <div className="h-1.5 w-1.5 rounded-full bg-[#BCBAB5]" />
            <span className="text-[12px] text-[#9C9790]">Sin comprobante aún</span>
          </div>
        )}

        {/* Comprobante review actions */}
        {canReviewComprobante && (
          <div className="space-y-3 px-5 pt-4 pb-8">
            {comprobanteError && (
              <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[12px] text-red-600">
                {comprobanteError}
              </p>
            )}
            <input
              type="text"
              placeholder="Motivo del rechazo (opcional)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full rounded-xl border border-[#E8E6E0] px-3.5 py-2.5 text-[13px] text-[#0d1a12] transition-all outline-none focus:border-[#072f1a]/30 focus:ring-2 focus:ring-[#072f1a]/5"
            />
            <div className="flex gap-2">
              <button
                onClick={handleRechazar}
                disabled={acting}
                className="flex-1 rounded-2xl bg-red-50 py-3 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-100 active:scale-[0.98] disabled:opacity-50"
              >
                Rechazar
              </button>
              <button
                onClick={handleAprobar}
                disabled={acting}
                className="flex-1 rounded-2xl bg-emerald-600 py-3 text-[13px] font-bold text-white transition-colors hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
              >
                {acting ? '...' : 'Aprobar pago'}
              </button>
            </div>
          </div>
        )}

        {!canReviewComprobante && <div className="pb-7 sm:pb-5" />}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Reservas() {
  const [reservas, setReservas] = useState<ReservaConDetalles[]>([])
  const [filter, setFilter] = useState<FilterTab>('todas')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('fecha')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [dialog, setDialog] = useState<DialogState>(null)
  const [comprobanteModal, setComprobanteModal] = useState<ComprobanteModal>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const tbodyRef = useRef<HTMLTableSectionElement>(null)

  useEffect(() => {
    getReservas()
      .then(setReservas)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const counts = {
    pendiente: reservas.filter((r) => r.estado === 'pendiente').length,
    confirmada: reservas.filter((r) => r.estado === 'confirmada').length,
    pagada: reservas.filter((r) => r.estado === 'pagada').length,
    cancelada: reservas.filter((r) => r.estado === 'cancelada').length,
  }

  const baseFiltered = filter === 'todas' ? reservas : reservas.filter((r) => r.estado === filter)
  const searched = search.trim()
    ? baseFiltered.filter(
        (r) =>
          r.usuarios?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
          r.canchas?.nombre?.toLowerCase().includes(search.toLowerCase()),
      )
    : baseFiltered
  const filtered = sortRows(searched, sortKey, sortDir)

  useEffect(() => {
    if (!loading && tbodyRef.current) {
      const rows = tbodyRef.current.querySelectorAll('.reserva-row')
      gsap.fromTo(
        rows,
        { opacity: 0, y: 5 },
        { opacity: 1, y: 0, stagger: 0.035, duration: 0.28, ease: 'power2.out', clearProps: 'all' },
      )
    }
  }, [loading, filter, search, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (!key) return
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  async function openModal(r: ReservaConDetalles) {
    setComprobanteModal(r) // show immediately with cached data
    try {
      const fresh = await getReservaById(r.id)
      // only apply if user hasn't closed (or switched row) in the meantime
      setComprobanteModal((current) => (current?.id === r.id ? fresh : current))
      setReservas((prev) => prev.map((x) => (x.id === fresh.id ? fresh : x)))
    } catch {
      // keep cached data already shown
    }
  }

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
    } catch {
      setActionError('No se pudo actualizar la reserva. Intenta de nuevo.')
    } finally {
      setActing(false)
    }
  }

  async function handleAprobarComprobante(id: string) {
    await aprobarComprobante(id)
    setReservas((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estado: 'pagada', rechazo_motivo: null } : r)),
    )
  }

  async function handleRechazarComprobante(id: string, motivo: string) {
    await rechazarComprobante(id, motivo)
    setReservas((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, estado: 'confirmada', comprobante_url: null, rechazo_motivo: motivo || null }
          : r,
      ),
    )
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-[#12D176] uppercase">
          Gestión
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[22px] leading-tight font-bold text-[#0d1a12]">
              Reservas
            </h1>
            <p className="mt-1 text-[13px] text-[#9C9790]">
              Historial y estado de todas las reservas
            </p>
          </div>
          {!loading && (
            <div className="flex items-center gap-4">
              <StatChip label="Pendientes" count={counts.pendiente} color="#F59E0B" />
              <div className="h-3 w-px bg-[#E8E6E0]" />
              <StatChip label="Confirmadas" count={counts.confirmada} color="#10B981" />
              <div className="h-3 w-px bg-[#E8E6E0]" />
              <StatChip label="Pagadas" count={counts.pagada} color="#3B82F6" />
              <div className="h-3 w-px bg-[#E8E6E0]" />
              <StatChip label="Canceladas" count={counts.cancelada} color="#EF4444" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-[260px]">
          <svg
            className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-[#BCBAB5]"
            fill="none"
            viewBox="0 0 16 16"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <circle cx="7" cy="7" r="5" />
            <path strokeLinecap="round" d="M11 11l3 3" />
          </svg>
          <input
            type="text"
            placeholder="Buscar usuario o cancha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#EBEBEA] bg-white py-2 pr-9 pl-9 text-[13px] text-[#0d1a12] transition-all outline-none placeholder:text-[#BCBAB5] focus:border-[#072f1a]/30 focus:ring-2 focus:ring-[#072f1a]/5"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#BCBAB5] transition-colors hover:text-[#57534E]"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 14 14"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {TABS.map((t) => {
            const count = t.key !== 'todas' ? counts[t.key as keyof typeof counts] : null
            return (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-200 ${
                  filter === t.key
                    ? 'bg-[#072f1a] text-[#F2F0EB] shadow-sm'
                    : 'bg-[#F5F4F1] text-[#9C9790] hover:text-[#121210]'
                }`}
              >
                {t.label}
                {count !== null && count > 0 && (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-px text-[10px] font-bold ${
                      filter === t.key ? 'bg-white/15 text-white' : 'bg-[#E8E6E0] text-[#6B6862]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-[14px] border border-[#EBEBEA] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        {/* Card top bar */}
        <div className="flex items-center justify-between border-b border-[#F2F1EE] px-5 py-3.5">
          <span className="text-[13px] font-semibold text-[#0d1a12]">
            {filter === 'todas'
              ? 'Todas las reservas'
              : (TABS.find((t) => t.key === filter)?.label ?? filter)}
          </span>
          <span className="inline-flex h-[20px] items-center rounded-full bg-[#F5F4F1] px-2.5 text-[11px] font-medium text-[#9C9790]">
            {filtered.length} {filtered.length === 1 ? 'reserva' : 'reservas'}
          </span>
        </div>

        {loading ? (
          <div>
            {[0, 1, 2, 3].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <>
            {/* Mobile cards */}
            <div className="divide-y divide-[#F5F4F1] md:hidden">
              {filtered.map((r) => (
                <MobileCard
                  key={r.id}
                  r={r}
                  onOpen={() => openModal(r)}
                  onApprove={() => {
                    setActionError(null)
                    setDialog({ id: r.id, action: 'confirmada' })
                  }}
                  onReject={() => {
                    setActionError(null)
                    setDialog({ id: r.id, action: 'cancelada' })
                  }}
                />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F5F4F1]">
                    {SORT_COLS.map(({ key, label, w }) => (
                      <th key={label || '_actions'} className={`group px-5 py-3 text-left ${w}`}>
                        {key ? (
                          <button
                            onClick={() => toggleSort(key)}
                            className="inline-flex items-center text-[11px] font-semibold tracking-[0.04em] text-[#BCBAB5] uppercase transition-colors duration-150 hover:text-[#57534E]"
                          >
                            {label}
                            <SortIndicator active={sortKey === key} dir={sortDir} />
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold tracking-[0.04em] text-[#BCBAB5] uppercase">
                            {label}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody ref={tbodyRef}>
                  {filtered.map((r) => {
                    const est = ESTADO[r.estado as keyof typeof ESTADO]
                    return (
                      <tr
                        key={r.id}
                        className="reserva-row group cursor-pointer border-b border-[#F5F4F1] transition-colors duration-150 last:border-0 hover:bg-[#FAFAF9]"
                        onClick={() => openModal(r)}
                      >
                        <td className="px-5 py-3.5">
                          <span className="text-[13px] font-semibold text-[#0d1a12] transition-colors duration-150 group-hover:text-[#072f1a]">
                            {r.usuarios?.nombre ?? '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-[#57534E]">
                          {r.canchas?.nombre ?? '—'}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-[#57534E] tabular-nums">
                          {formatFechaCorta(r.fecha)}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-[#57534E] tabular-nums">
                          {r.slot_inicio.slice(0, 5)} hs
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${est.pill}`}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: est.dot }}
                            />
                            {r.estado}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {r.estado === 'pendiente' && (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActionError(null)
                                  setDialog({ id: r.id, action: 'confirmada' })
                                }}
                                className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 active:scale-95"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActionError(null)
                                  setDialog({ id: r.id, action: 'cancelada' })
                                }}
                                className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-100 active:scale-95"
                              >
                                Rechazar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {dialog && (
        <ActionDialog
          dialog={dialog}
          acting={acting}
          error={actionError}
          onCancel={() => setDialog(null)}
          onConfirm={handleAction}
        />
      )}

      {comprobanteModal && (
        <ReservaDetailModal
          r={comprobanteModal}
          onClose={() => setComprobanteModal(null)}
          onAprobarComprobante={handleAprobarComprobante}
          onRechazarComprobante={handleRechazarComprobante}
        />
      )}
    </div>
  )
}
