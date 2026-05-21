import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getMisReservas, uploadComprobante, updateComprobanteUrl } from '@/lib/supabase/reservas'
import type { ReservaConDetalles } from '@/types'

const ESTADO_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  confirmada: 'bg-green-50 text-green-700 border border-green-200',
  cancelada: 'bg-red-50 text-red-600 border border-red-200',
}

const BARCODE_OPACITIES = Array.from({ length: 42 }, () => (Math.random() > 0.5 ? 0.85 : 0.15))

const ESTADO_TICKET: Record<string, { label: string; color: string; dot: string }> = {
  pendiente: { label: 'Pendiente de aprobación', color: '#B45309', dot: '#F59E0B' },
  confirmada: { label: 'Confirmada', color: '#12D176', dot: '#12D176' },
  cancelada: { label: 'Cancelada', color: '#DC2626', dot: '#DC2626' },
}

function formatFechaLarga(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function Comprobante({
  reserva,
  onClose,
  onComprobanteUploaded,
}: {
  reserva: ReservaConDetalles
  onClose: () => void
  onComprobanteUploaded: (id: string, url: string) => void
}) {
  const est = ESTADO_TICKET[reserva.estado]
  const [uploading, setUploading] = useState(false)
  const [localUrl, setLocalUrl] = useState<string | null>(reserva.comprobante_url)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const url = await uploadComprobante(reserva.id, file)
      await updateComprobanteUrl(reserva.id, url)
      setLocalUrl(url)
      onComprobanteUploaded(reserva.id, url)
    } catch {
      setUploadError('Error al subir. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ animation: 'fadeIn 180ms ease' }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Ticket card */}
      <div
        className="relative w-full max-w-sm"
        style={{ animation: 'slideUp 220ms cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top half — dark */}
        <div className="rounded-t-[28px] bg-[#072f1a] px-7 pt-8 pb-7">
          {/* Brand row */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#12D176]" />
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#F2F0EB]/60 uppercase">
                Cancha
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[#F2F0EB]/60 transition-colors hover:bg-white/20 hover:text-[#F2F0EB]"
              aria-label="Cerrar"
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

          {/* Cancha name */}
          <p className="font-display text-[11px] font-semibold tracking-[0.2em] text-[#12D176] uppercase">
            Reserva
          </p>
          <h2 className="font-display mt-1 text-3xl leading-tight font-extrabold text-[#F2F0EB]">
            {reserva.canchas?.nombre ?? '—'}
          </h2>

          {/* Estado pill */}
          <div className="mt-5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: est.dot }} />
            <span className="text-[12px] font-semibold" style={{ color: est.color }}>
              {est.label}
            </span>
          </div>
        </div>

        {/* Perforation */}
        <div className="relative flex items-center bg-[#072f1a]">
          <div className="h-5 w-5 -translate-x-1/2 rounded-full bg-[#F9F9F8]" />
          <div
            className="flex-1 border-t-2 border-dashed border-white/10"
            style={{ marginLeft: 8, marginRight: 8 }}
          />
          <div className="h-5 w-5 translate-x-1/2 rounded-full bg-[#F9F9F8]" />
        </div>

        {/* Bottom half — light */}
        <div className="rounded-b-[28px] bg-white px-7 pt-6 pb-8">
          <div className="space-y-5">
            <Row label="Fecha" value={formatFechaLarga(reserva.fecha)} />
            <Row label="Horario" value={`${reserva.slot_inicio.slice(0, 5)} hs`} />
            <Row label="Tipo" value={reserva.canchas?.nombre ? reserva.canchas.nombre : '—'} />
          </div>

          {/* Decorative barcode strip */}
          <div className="mt-7 overflow-hidden rounded-xl">
            <div className="flex h-10 gap-px">
              {Array.from({ length: 42 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-[#0d1a12]"
                  style={{ opacity: BARCODE_OPACITIES[i] }}
                />
              ))}
            </div>
          </div>

          {/* Comprobante upload — solo cuando confirmada */}
          {reserva.estado === 'confirmada' && !localUrl && (
            <label className="mt-5 block cursor-pointer rounded-2xl border-2 border-dashed border-[#E8E6E0] px-5 py-4 text-center transition-all hover:border-[#12D176]/50">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploading}
                onChange={handleUpload}
              />
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#072f1a]/20 border-t-[#072f1a]" />
                  <span className="text-sm text-[#9C9790]">Subiendo...</span>
                </div>
              ) : (
                <>
                  <p className="text-[13px] font-semibold text-[#121210]">
                    Subir comprobante de pago
                  </p>
                  <p className="mt-0.5 text-xs text-[#9C9790]">Foto del Sinpe o transferencia</p>
                </>
              )}
            </label>
          )}

          {reserva.estado === 'confirmada' && localUrl && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-3.5">
              <div className="h-2 w-2 rounded-full bg-[#12D176]" />
              <span className="text-[13px] font-semibold text-green-700">Comprobante enviado</span>
            </div>
          )}

          {uploadError && <p className="mt-2 text-center text-xs text-red-500">{uploadError}</p>}

          <Link
            to="/reservar"
            onClick={onClose}
            className="mt-6 block rounded-2xl bg-[#12D176] py-3.5 text-center text-[13px] font-bold text-[#072f1a] transition-all hover:bg-[#0fb86a] active:scale-[0.99]"
          >
            Nueva reserva
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: scale(0.92) translateY(12px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}</style>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] font-semibold tracking-[0.08em] text-[#9C9790] uppercase">
        {label}
      </span>
      <span className="text-right text-[13px] font-semibold text-[#121210] capitalize">
        {value}
      </span>
    </div>
  )
}

export default function MisReservas() {
  const { user } = useAuth()
  const [reservas, setReservas] = useState<ReservaConDetalles[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ReservaConDetalles | null>(null)

  useEffect(() => {
    if (!user) return
    getMisReservas(user.id)
      .then(setReservas)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  function handleComprobanteUploaded(reservaId: string, url: string) {
    setReservas((prev) =>
      prev.map((r) => (r.id === reservaId ? { ...r, comprobante_url: url } : r)),
    )
    setSelected((prev) => (prev ? { ...prev, comprobante_url: url } : null))
  }

  return (
    <div className="min-h-screen bg-[#F9F9F8] px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="mb-6 inline-block text-sm text-[#9C9790] transition-colors hover:text-[#121210]"
        >
          ← Inicio
        </Link>
        <p className="mb-2 text-[11px] font-semibold tracking-[0.3em] text-[#12D176] uppercase">
          Mi historial
        </p>
        <h1 className="font-display mb-8 text-4xl font-extrabold text-[#121210]">Mis reservas</h1>

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
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="group w-full rounded-3xl border border-[#E8E6E0] bg-white p-6 text-left transition-all duration-300 hover:border-[#072f1a]/20 hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-[#121210] transition-colors group-hover:text-[#072f1a]">
                    {r.canchas?.nombre ?? '—'}
                  </p>
                  <p className="mt-1 text-sm text-[#9C9790]">
                    {r.fecha} · {r.slot_inicio.slice(0, 5)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${ESTADO_STYLES[r.estado]}`}
                  >
                    {r.estado}
                  </span>
                  <svg
                    className="h-4 w-4 text-[#BCBAB5] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#57534E]"
                    fill="none"
                    viewBox="0 0 16 16"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 3l5 5-5 5" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <Comprobante
          reserva={selected}
          onClose={() => setSelected(null)}
          onComprobanteUploaded={handleComprobanteUploaded}
        />
      )}
    </div>
  )
}
