export default function Canchas() {
  return (
    <div className="max-w-5xl">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-[#12D176] uppercase">
            Gestión
          </p>
          <h1 className="font-display text-[22px] font-bold leading-tight text-[#0d1a12]">
            Canchas
          </h1>
          <p className="mt-1 text-[13px] text-[#9C9790]">
            Campos sintéticos registrados en la plataforma
          </p>
        </div>
        <button className="flex h-[34px] items-center gap-1.5 rounded-[8px] bg-[#072f1a] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#0a3d22]">
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

      <div className="overflow-hidden rounded-[12px] border border-[#EBEBEA] bg-white">
        <div className="flex items-center justify-between border-b border-[#F2F1EE] px-5 py-4">
          <span className="text-[14px] font-semibold text-[#0d1a12]">Todas las canchas</span>
          <span className="inline-flex h-[22px] items-center rounded-full bg-[#F5F4F1] px-2.5 text-[11px] font-medium text-[#9C9790]">
            0 canchas
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3 border-b border-[#F2F1EE] px-5 py-2.5">
          {['Nombre', 'Tipo', 'Slots/día', 'Estado'].map((h) => (
            <p key={h} className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#BCBAB5]">
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
              <rect x="1" y="2.5" width="16" height="13" rx="1.5" />
              <line x1="9" y1="2.5" x2="9" y2="15.5" />
              <circle cx="9" cy="9" r="2.2" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-[#6B6862]">Sin canchas registradas</p>
          <p className="mt-1 text-[12px] text-[#9C9790]">Crea la primera cancha para empezar</p>
        </div>
      </div>
    </div>
  )
}
