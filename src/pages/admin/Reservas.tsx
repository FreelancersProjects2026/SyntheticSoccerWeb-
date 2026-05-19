export default function Reservas() {
  return (
    <div className="max-w-5xl">
      <div className="mb-7">
        <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-[#12D176] uppercase">
          Gestión
        </p>
        <h1 className="font-display text-[22px] leading-tight font-bold text-[#0d1a12]">
          Reservas
        </h1>
        <p className="mt-1 text-[13px] text-[#9C9790]">Historial y estado de todas las reservas</p>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-[#EBEBEA] bg-white">
        <div className="flex items-center justify-between border-b border-[#F2F1EE] px-5 py-4">
          <span className="text-[14px] font-semibold text-[#0d1a12]">Todas las reservas</span>
          <span className="inline-flex h-[22px] items-center rounded-full bg-[#F5F4F1] px-2.5 text-[11px] font-medium text-[#9C9790]">
            0 reservas
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="grid grid-cols-4 gap-3 border-b border-[#F2F1EE] px-5 py-2.5">
              {['Usuario', 'Cancha', 'Fecha y hora', 'Estado'].map((h) => (
                <p
                  key={h}
                  className="text-[11px] font-semibold tracking-[0.04em] text-[#BCBAB5] uppercase"
                >
                  {h}
                </p>
              ))}
            </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}
