export default function Canchas() {
  return (
    <div className="max-w-5xl">
      <div className="mb-10">
        <p className="mb-2 text-[10px] font-semibold tracking-[0.28em] text-[#12D176] uppercase">
          Gestión
        </p>
        <h1 className="text-[2rem] leading-tight font-extrabold text-[#121210]">Canchas</h1>
        <p className="mt-1 text-sm text-[#9C9790]">Administra las canchas disponibles</p>
      </div>

      <div className="rounded-2xl border border-[#121210]/[0.07] bg-white">
        <div className="flex items-center justify-between border-b border-[#121210]/[0.07] px-6 py-4">
          <p className="text-[13px] font-semibold text-[#121210]">Lista de canchas</p>
          <button className="rounded-xl bg-[#072f1a] px-4 py-2 text-[12px] font-bold text-[#F2F0EB] transition-all hover:scale-[1.02] hover:bg-[#0d4526] active:scale-[0.98]">
            + Nueva cancha
          </button>
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
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="12" y1="4" x2="12" y2="20" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <p className="text-[14px] font-semibold text-[#57534E]">Sin canchas registradas</p>
          <p className="mt-1 text-[12px] text-[#9C9790]">Crea la primera cancha para empezar</p>
        </div>
      </div>
    </div>
  )
}
