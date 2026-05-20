import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const { user } = useAuth()
  const [state, setState] = useState<ReservaState>({
    step: 1,
    cancha: null,
    fecha: null,
    slot: null,
  })
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const [loadingCanchas, setLoadingCanchas] = useState(true)
  const [slotsState, setSlotsState] = useState<{ loading: boolean; tomados: string[] }>({
    loading: false,
    tomados: [],
  })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    getCanchas()
      .then((all) => setCanchas(all.filter((c) => c.estado === 'activa')))
      .catch(() => setCanchas([]))
      .finally(() => setLoadingCanchas(false))
  }, [])

  useEffect(() => {
    if (!(state.step === 3 && state.cancha && state.fecha)) return
    const canchaId = state.cancha.id
    const fecha = state.fecha
    let cancelled = false
    getSlotsTomados(canchaId, fecha)
      .then((slots) => {
        if (!cancelled) setSlotsState({ loading: false, tomados: slots })
      })
      .catch(() => {
        if (!cancelled) setSlotsState({ loading: false, tomados: [] })
      })
    return () => {
      cancelled = true
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
      setTimeout(() => navigate('/'), 1500)
    } catch (err: unknown) {
      const isConflict =
        err instanceof Error &&
        (err.message.includes('unique') || err.message.includes('duplicate'))
      showToast(
        isConflict ? 'Ese horario ya fue reservado. Elige otro.' : 'Error al crear la reserva.',
        'error',
      )
    } finally {
      setSubmitting(false)
    }
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
          <Link
            to="/"
            className="mb-6 inline-block text-sm text-[#9C9790] transition-colors hover:text-[#121210]"
          >
            ← Inicio
          </Link>
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
            {loadingCanchas ? (
              <div className="col-span-2 flex items-center gap-3 text-sm text-[#9C9790]">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#072f1a]/20 border-t-[#072f1a]" />
                Cargando canchas...
              </div>
            ) : canchas.length === 0 ? (
              <p className="col-span-2 text-sm text-[#9C9790]">No hay canchas disponibles.</p>
            ) : (
              canchas.map((c) => (
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
              ))
            )}
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
                    onClick={() => {
                      setSlotsState({ loading: true, tomados: [] })
                      setState((s) => ({ ...s, step: 3, fecha: d }))
                    }}
                    className="group rounded-2xl border border-[#E8E6E0] bg-white py-4 text-center transition-all hover:border-[#072f1a] hover:bg-[#072f1a] active:scale-[0.97]"
                  >
                    <p className="text-xs text-[#9C9790] capitalize group-hover:text-[#F2F0EB]/60">
                      {weekday}
                    </p>
                    <p className="text-xl font-bold text-[#121210] group-hover:text-[#F2F0EB]">
                      {day}
                    </p>
                    <p className="text-xs text-[#9C9790] capitalize group-hover:text-[#F2F0EB]/60">
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
            {slotsState.loading ? (
              <div className="mb-8 flex items-center gap-3 text-sm text-[#9C9790]">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#072f1a]/20 border-t-[#072f1a]" />
                Cargando horarios...
              </div>
            ) : (
              <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {generateSlots(state.cancha.slots_por_dia).map((slot) => {
                  const taken = slotsState.tomados.some((t) => t.slice(0, 5) === slot)
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
            )}
            <button
              disabled={!state.slot || submitting || slotsState.loading}
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
