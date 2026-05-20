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
