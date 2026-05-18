import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

function IconGrid() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function IconField() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <circle cx="12" cy="12" r="3" />
      <path d="M2 9h3M19 9h3M2 15h3M19 15h3" strokeLinecap="round" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      <circle cx="8" cy="15" r="1" fill="currentColor" />
      <circle cx="12" cy="15" r="1" fill="currentColor" />
      <circle cx="16" cy="15" r="1" fill="currentColor" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg
      className="h-[18px] w-[18px]"
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

function IconLogout() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12V7a2 2 0 012-2h7" strokeLinecap="round" />
      <path d="M3 12v5a2 2 0 002 2h7" strokeLinecap="round" />
    </svg>
  )
}

function IconChevron({ right }: { right?: boolean }) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={right ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
      />
    </svg>
  )
}

function IconX() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: <IconGrid />, exact: true },
  { label: 'Canchas', path: '/admin/canchas', icon: <IconField />, exact: false },
  { label: 'Reservas', path: '/admin/reservas', icon: <IconCalendar />, exact: false },
  { label: 'Usuarios', path: '/admin/usuarios', icon: <IconUsers />, exact: false },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  async function handleSignOut() {
    await signOut()
    setMobileOpen(false)
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-[#F4F3F0]">
      {/* ── Mobile overlay ───────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-30 bg-[#072f1a]/40 backdrop-blur-sm transition-all duration-300 md:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-60 flex-col overflow-hidden bg-[#072f1a] transition-all duration-300 ease-in-out ${collapsed ? 'md:w-16' : 'md:w-60'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} `}
      >
        {/* Logo row */}
        <div className="flex h-[60px] shrink-0 items-center border-b border-white/[0.06] px-3">
          <div
            className={`flex flex-1 items-center gap-2.5 overflow-hidden transition-all duration-200 ${
              collapsed ? 'md:opacity-0' : 'opacity-100'
            }`}
          >
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#12D176]" />
            <span className="text-[11px] font-bold tracking-[0.22em] whitespace-nowrap text-[#F9F9F8] uppercase">
              Cancha Admin
            </span>
          </div>

          {/* Desktop: collapse toggle */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="ml-auto hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#5E8268] transition-all duration-200 hover:bg-white/[0.07] hover:text-[#F9F9F8] md:flex"
          >
            <IconChevron right={collapsed} />
          </button>

          {/* Mobile: close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#5E8268] transition-all duration-200 hover:bg-white/[0.07] hover:text-[#F9F9F8] md:hidden"
          >
            <IconX />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-hidden px-2 py-4">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <div key={item.path} className="group/item relative">
                <NavLink
                  to={item.path}
                  end={item.exact}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                      isActive
                        ? 'bg-[#12D176]/[0.12] text-[#12D176]'
                        : 'text-[#5E8268] hover:bg-white/[0.06] hover:text-[#D4CFC8]'
                    }`
                  }
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span
                    className={`overflow-hidden text-[13px] font-medium whitespace-nowrap transition-all duration-300 ${
                      collapsed
                        ? 'max-w-[160px] opacity-100 md:max-w-0 md:opacity-0'
                        : 'max-w-[160px] opacity-100'
                    }`}
                  >
                    {item.label}
                  </span>
                </NavLink>

                {/* Tooltip when collapsed (desktop only) */}
                {collapsed && (
                  <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 hidden -translate-y-1/2 md:block">
                    <div className="rounded-lg bg-[#121210] px-3 py-1.5 text-[12px] font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/item:opacity-100">
                      {item.label}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom — user + logout */}
        <div className="shrink-0 border-t border-white/[0.06] p-2">
          {/* User info */}
          <div
            className={`mb-0.5 overflow-hidden px-3 py-2 transition-all duration-300 ${
              collapsed ? 'max-h-0 opacity-0 md:max-h-0 md:opacity-0' : 'max-h-14 opacity-100'
            }`}
          >
            <p className="truncate text-[12px] font-semibold text-[#D4CFC8]">
              {profile?.nombre ?? '—'}
            </p>
            <p className="text-[10px] text-[#3a5f4a]">Administrador</p>
          </div>

          {/* Logout */}
          <div className="group/logout relative">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[#5E8268] transition-all duration-200 hover:bg-white/[0.06] hover:text-red-400"
            >
              <span className="shrink-0">
                <IconLogout />
              </span>
              <span
                className={`overflow-hidden text-[13px] font-medium whitespace-nowrap transition-all duration-300 ${
                  collapsed
                    ? 'max-w-[160px] opacity-100 md:max-w-0 md:opacity-0'
                    : 'max-w-[160px] opacity-100'
                }`}
              >
                Salir
              </span>
            </button>

            {collapsed && (
              <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 hidden -translate-y-1/2 md:block">
                <div className="rounded-lg bg-[#121210] px-3 py-1.5 text-[12px] font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/logout:opacity-100">
                  Salir
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <div
        className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'md:ml-16' : 'md:ml-60'
        }`}
      >
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-[60px] items-center border-b border-[#121210]/[0.07] bg-[#F4F3F0]/90 px-4 backdrop-blur-sm md:px-8">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="mr-3 flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-lg border border-[#121210]/[0.08] bg-white/60 md:hidden"
            aria-label="Abrir menú"
          >
            <span className="block h-[1.5px] w-4 bg-[#072f1a]" />
            <span className="block h-[1.5px] w-4 bg-[#072f1a]" />
            <span className="block h-[1.5px] w-4 bg-[#072f1a]" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <span className="hidden text-[12px] text-[#9C9790] sm:block">{profile?.nombre}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#072f1a]">
              <span className="text-[11px] font-bold text-[#12D176]">
                {profile?.nombre?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
