import { useEffect, useRef } from 'react'
import gsap from 'gsap'

function IconField() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 18 18"
      stroke="currentColor"
      strokeWidth={1.7}
    >
      <rect x="1" y="2.5" width="16" height="13" rx="1.5" />
      <line x1="9" y1="2.5" x2="9" y2="15.5" />
      <circle cx="9" cy="9" r="2.2" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 18 18"
      stroke="currentColor"
      strokeWidth={1.7}
    >
      <rect x="1.5" y="2.5" width="15" height="14" rx="1.5" />
      <path d="M13 1v3M5 1v3M1.5 8h15" strokeLinecap="round" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 18 18"
      stroke="currentColor"
      strokeWidth={1.7}
    >
      <path d="M12 16v-1.5A3.5 3.5 0 008.5 11H4A3.5 3.5 0 00.5 14.5V16" strokeLinecap="round" />
      <circle cx="6.5" cy="5.5" r="3.5" />
      <path
        d="M17.5 16v-1.5a3.5 3.5 0 00-2.5-3.35M12 2.15a3.5 3.5 0 010 6.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconSwords() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 18 18"
      stroke="currentColor"
      strokeWidth={1.7}
    >
      <path
        d="M10.5 12.5L2 4V2h2l8.5 8.5M12 12l3 3M10.5 4.5l2.5-2.5 1.5 1.5-3.5 3.5M4.5 10.5l-2.5 2.5 1.5 1.5 2.5-2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const STATS = [
  {
    label: 'Total canchas',
    value: '—',
    icon: <IconField />,
    iconBg: 'bg-[#0d1a12]',
    iconColor: 'text-[#12D176]',
  },
  {
    label: 'Reservas hoy',
    value: '—',
    icon: <IconCalendar />,
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#059669]',
  },
  {
    label: 'Usuarios',
    value: '—',
    icon: <IconUsers />,
    iconBg: 'bg-[#F5F4F1]',
    iconColor: 'text-[#6B6862]',
  },
  {
    label: 'Retos activos',
    value: '—',
    icon: <IconSwords />,
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#059669]',
  },
]

export default function Dashboard() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll('.stat-card')
    gsap.fromTo(
      cards,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out' },
    )
  }, [])

  return (
    <div className="max-w-5xl">
      <div className="mb-7">
        <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-[#12D176] uppercase">
          Panel
        </p>
        <h1 className="font-display text-[22px] leading-tight font-bold text-[#0d1a12]">
          Dashboard
        </h1>
        <p className="mt-1 text-[13px] text-[#9C9790]">Resumen general de actividad</p>
      </div>

      <div ref={gridRef} className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="stat-card flex items-center gap-3.5 rounded-[12px] border border-[#EBEBEA] bg-white p-4"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${stat.iconBg} ${stat.iconColor}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-[22px] leading-none font-bold text-[#0d1a12]">{stat.value}</p>
              <p className="mt-0.5 text-[11px] text-[#9C9790]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[12px] border border-[#EBEBEA] bg-white">
        <div className="flex items-center justify-between border-b border-[#F2F1EE] px-5 py-4">
          <span className="text-[14px] font-semibold text-[#0d1a12]">Actividad reciente</span>
          <span className="inline-flex h-[22px] items-center rounded-full bg-[#F5F4F1] px-2.5 text-[11px] font-medium text-[#9C9790]">
            Sin datos aún
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3 border-b border-[#F2F1EE] px-5 py-2.5">
          {['Evento', 'Cancha', 'Fecha', 'Estado'].map((h) => (
            <p
              key={h}
              className="text-[11px] font-semibold tracking-[0.04em] text-[#BCBAB5] uppercase"
            >
              {h}
            </p>
          ))}
        </div>
        <div className="flex items-center justify-center py-10">
          <p className="text-[13px] text-[#C5C3BE]">Las reservas y eventos aparecerán aquí</p>
        </div>
      </div>
    </div>
  )
}
