export default function Usuarios() {
  return (
    <div className="max-w-5xl">
      <div className="mb-7">
        <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-[#12D176] uppercase">
          Gestión
        </p>
        <h1 className="font-display text-[22px] font-bold leading-tight text-[#0d1a12]">
          Usuarios
        </h1>
        <p className="mt-1 text-[13px] text-[#9C9790]">
          Todos los usuarios registrados en la plataforma
        </p>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-[#EBEBEA] bg-white">
        <div className="flex items-center justify-between border-b border-[#F2F1EE] px-5 py-4">
          <span className="text-[14px] font-semibold text-[#0d1a12]">Lista de usuarios</span>
          <span className="inline-flex h-[22px] items-center rounded-full bg-[#F5F4F1] px-2.5 text-[11px] font-medium text-[#9C9790]">
            0 usuarios
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="grid grid-cols-4 gap-3 border-b border-[#F2F1EE] px-5 py-2.5">
              {['Nombre', 'Teléfono', 'Rol', 'Registrado'].map((h) => (
                <p
                  key={h}
                  className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#BCBAB5]"
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
                  <path
                    d="M12 16v-1.5A3.5 3.5 0 008.5 11H4A3.5 3.5 0 00.5 14.5V16"
                    strokeLinecap="round"
                  />
                  <circle cx="6.5" cy="5.5" r="3.5" />
                  <path
                    d="M17.5 16v-1.5a3.5 3.5 0 00-2.5-3.35M12 2.15a3.5 3.5 0 010 6.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[#6B6862]">Sin usuarios aún</p>
              <p className="mt-1 text-[12px] text-[#9C9790]">
                Los usuarios registrados aparecerán aquí
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
