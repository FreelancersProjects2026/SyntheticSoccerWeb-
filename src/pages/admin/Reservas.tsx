export default function Reservas() {
  return (
    <div className="max-w-5xl">
      <div className="mb-8 md:mb-10">
        <p className="mb-2 text-[10px] font-semibold tracking-[0.28em] text-[#12D176] uppercase">
          Gestión
        </p>
        <h1 className="text-[1.75rem] leading-tight font-extrabold text-[#121210] md:text-[2rem]">
          Reservas
        </h1>
        <p className="mt-1 text-sm text-[#9C9790]">Historial y estado de todas las reservas</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#121210]/[0.07] bg-white">
        <div className="flex items-center justify-between border-b border-[#121210]/[0.07] px-4 py-4 sm:px-6">
          <p className="text-[13px] font-semibold text-[#121210]">Todas las reservas</p>
          <span className="rounded-full bg-[#F4F3F0] px-3 py-1 text-[11px] font-medium text-[#9C9790]">
            0 reservas
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[480px]">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 border-b border-[#121210]/[0.05] px-6 py-3">
              {['Usuario', 'Cancha', 'Fecha y hora', 'Estado'].map((h) => (
                <p
                  key={h}
                  className="text-[11px] font-semibold tracking-wide text-[#9C9790] uppercase"
                >
                  {h}
                </p>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4F3F0]">
                <svg
                  className="h-6 w-6 text-[#C4BFB8]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-[#57534E]">Sin reservas aún</p>
              <p className="mt-1 text-[12px] text-[#9C9790]">Las reservas aparecerán aquí</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
