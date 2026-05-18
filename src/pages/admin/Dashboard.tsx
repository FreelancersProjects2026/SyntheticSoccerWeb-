import { useEffect, useRef } from 'react'
import gsap from 'gsap'

function IconField() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
    </svg>
  )
}

function IconSwords() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        d="M14.5 17.5L3 6V3h3l11.5 11.5M16 16l4 4M14.5 6.5l3-3 2 2-4.5 4.5M6.5 14.5l-3 3 2 2 3-3"
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
    bg: 'bg-[#072f1a]/[0.06]',
    iconColor: 'text-[#072f1a]',
  },
  {
    label: 'Reservas hoy',
    value: '—',
    icon: <IconCalendar />,
    bg: 'bg-[#12D176]/[0.08]',
    iconColor: 'text-[#0C6E3C]',
  },
  {
    label: 'Usuarios registrados',
    value: '—',
    icon: <IconUsers />,
    bg: 'bg-[#072f1a]/[0.06]',
    iconColor: 'text-[#072f1a]',
  },
  {
    label: 'Retos activos',
    value: '—',
    icon: <IconSwords />,
    bg: 'bg-[#12D176]/[0.08]',
    iconColor: 'text-[#0C6E3C]',
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
      {/* Header */}
      <div className="mb-10">
        <p className="mb-2 text-[10px] font-semibold tracking-[0.28em] text-[#12D176] uppercase">
          Panel
        </p>
        <h1 className="text-[2rem] leading-tight font-extrabold text-[#121210]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#9C9790]">Resumen general de actividad</p>
      </div>

      {/* Stat cards */}
      <div ref={gridRef} className="grid grid-flow-dense grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="stat-card group rounded-2xl border border-[#121210]/[0.07] bg-white p-6 transition-all duration-300 hover:border-[#121210]/[0.13] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
          >
            <div
              className={`mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.iconColor} transition-transform duration-300 group-hover:scale-105`}
            >
              {stat.icon}
            </div>
            <p className="mb-1 text-[2rem] leading-none font-extrabold text-[#121210]">
              {stat.value}
            </p>
            <p className="text-[12px] text-[#9C9790]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Activity placeholder */}
      <div className="mt-8 rounded-2xl border border-[#121210]/[0.07] bg-white p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#121210]">Actividad reciente</h2>
          <span className="rounded-full bg-[#F4F3F0] px-3 py-1 text-[11px] font-medium text-[#9C9790]">
            Sin datos aún
          </span>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-[#121210]/[0.05] p-4"
            >
              <div
                className="h-8 w-8 shrink-0 rounded-full bg-[#E9E7E2]"
                style={{ opacity: 1 - i * 0.18 }}
              />
              <div className="flex-1 space-y-2">
                <div
                  className="h-2.5 rounded-full bg-[#E9E7E2]"
                  style={{ width: `${72 - i * 10}%`, opacity: 1 - i * 0.18 }}
                />
                <div
                  className="h-2 rounded-full bg-[#F2F1EE]"
                  style={{ width: `${48 - i * 8}%`, opacity: 1 - i * 0.18 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
