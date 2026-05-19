import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

function IconGrid() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.7}>
      <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" />
      <rect x="9.5" y="1" width="5.5" height="5.5" rx="1.2" />
      <rect x="1" y="9.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1.2" />
    </svg>
  )
}

function IconField() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.7}>
      <rect x="1" y="2.5" width="14" height="11" rx="1.5" />
      <line x1="8" y1="2.5" x2="8" y2="13.5" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.7}>
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" />
      <path d="M11 1v3M5 1v3M1.5 7h13" strokeLinecap="round" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.7}>
      <path d="M11 14v-1.5a3 3 0 00-3-3H4a3 3 0 00-3 3V14" strokeLinecap="round" />
      <circle cx="6" cy="5" r="3" />
      <path d="M15 14v-1.5a3 3 0 00-2-2.8M10.5 2.2a3 3 0 010 5.6" strokeLinecap="round" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.7}>
      <path d="M11 11l3-3m0 0l-3-3m3 3H6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 8V5a1.5 1.5 0 011.5-1.5H6" strokeLinecap="round" />
      <path d="M2 8v3a1.5 1.5 0 001.5 1.5H6" strokeLinecap="round" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5}>
      <path d="M5 11l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5}>
      <path d="M9 11L5 7l4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconX() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 12L12 4M4 4l8 8" strokeLinecap="round" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
      <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" />
    </svg>
  )
}

const NAV_SECTIONS = [
  {
    label: 'General',
    items: [
      { label: 'Dashboard', path: '/admin', icon: <IconGrid />, exact: true },
      { label: 'Canchas', path: '/admin/canchas', icon: <IconField />, exact: false },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { label: 'Reservas', path: '/admin/reservas', icon: <IconCalendar />, exact: false },
      { label: 'Usuarios', path: '/admin/usuarios', icon: <IconUsers />, exact: false },
    ],
  },
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
    <div className="flex min-h-screen bg-[#FAFAF9]">
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-[#072f1a]/30 backdrop-blur-sm transition-all duration-300 md:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen flex-col overflow-hidden border-r border-[#EBEBEA] bg-white transition-all duration-300 ease-in-out ${
          collapsed ? 'md:w-[52px]' : 'md:w-[220px]'
        } w-[220px] ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo row */}
        <div className="flex h-14 shrink-0 items-center border-b border-[#F0EFED] px-[18px]">
          <div
            className={`flex flex-1 items-center gap-2.5 overflow-hidden transition-opacity duration-200 ${
              collapsed ? 'md:opacity-0' : 'opacity-100'
            }`}
          >
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#072f1a]">
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="#12D176" strokeWidth="1.8">
                <rect x="1" y="1" width="4" height="4" rx="1" />
                <rect x="7" y="1" width="4" height="4" rx="1" />
                <rect x="1" y="7" width="4" height="4" rx="1" />
                <rect x="7" y="7" width="4" height="4" rx="1" />
              </svg>
            </div>
            <span className="whitespace-nowrap text-[12px] font-bold tracking-[0.05em] text-[#072f1a]">
              CANCHA
            </span>
          </div>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="ml-auto hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#BCBAB5] transition-colors hover:bg-[#F5F4F1] hover:text-[#6B6862] md:flex"
          >
            {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#BCBAB5] hover:bg-[#F5F4F1] hover:text-[#6B6862] md:hidden"
          >
            <IconX />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-[10px] py-3">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} className={si > 0 ? 'mt-2' : ''}>
              <p
                className={`px-[10px] pb-1 pt-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#BCBAB5] transition-opacity duration-200 ${
                  collapsed ? 'md:opacity-0' : 'opacity-100'
                }`}
              >
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <div key={item.path} className="group/item relative">
                    <NavLink
                      to={item.path}
                      end={item.exact}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-[9px] rounded-[7px] px-[10px] py-[7px] text-[13px] transition-colors duration-150 ${
                          isActive
                            ? 'bg-[#072f1a] font-semibold text-white'
                            : 'font-medium text-[#6B6862] hover:bg-[#F5F4F1] hover:text-[#1a1a18]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className={`shrink-0 ${isActive ? 'text-[#12D176]' : 'text-current'}`}>
                            {item.icon}
                          </span>
                          <span
                            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                              collapsed ? 'md:max-w-0 md:opacity-0' : 'max-w-[160px] opacity-100'
                            }`}
                          >
                            {item.label}
                          </span>
                        </>
                      )}
                    </NavLink>
                    {collapsed && (
                      <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-2.5 hidden -translate-y-1/2 md:block">
                        <div className="rounded-md bg-[#1a1a18] px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/item:opacity-100">
                          {item.label}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-[#F0EFED] p-[10px]">
          <div
            className={`overflow-hidden transition-all duration-300 ${
              collapsed ? 'md:max-h-0 md:opacity-0' : 'max-h-16 opacity-100'
            }`}
          >
            <div className="mb-0.5 flex items-center gap-[9px] rounded-[7px] px-[10px] py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#072f1a]">
                <span className="text-[11px] font-bold text-[#12D176]">
                  {profile?.nombre?.[0]?.toUpperCase() ?? 'A'}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-[12px] font-semibold text-[#1a1a18]">
                  {profile?.nombre ?? '—'}
                </p>
                <p className="text-[10px] text-[#9C9790]">Administrador</p>
              </div>
              <IconChevronRight />
            </div>
          </div>
          <div className="group/logout relative">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-[9px] rounded-[7px] px-[10px] py-[7px] text-[13px] font-medium text-[#6B6862] transition-colors hover:bg-[#FEF2F2] hover:text-red-500"
            >
              <span className="shrink-0">
                <IconLogout />
              </span>
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  collapsed ? 'md:max-w-0 md:opacity-0' : 'max-w-[160px] opacity-100'
                }`}
              >
                Salir
              </span>
            </button>
            {collapsed && (
              <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-2.5 hidden -translate-y-1/2 md:block">
                <div className="rounded-md bg-[#1a1a18] px-2.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/logout:opacity-100">
                  Salir
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div
        className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'md:ml-[52px]' : 'md:ml-[220px]'
        }`}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-[#EBEBEA] bg-[rgba(250,250,249,0.9)] px-4 backdrop-blur-[8px] md:px-7">
          <button
            onClick={() => setMobileOpen(true)}
            className="mr-3 flex h-8 w-8 items-center justify-center rounded-[7px] border border-[#EBEBEA] bg-white text-[#6B6862] md:hidden"
            aria-label="Abrir menú"
          >
            <IconMenu />
          </button>
          <div className="flex-1" />
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#072f1a]">
            <span className="text-[11px] font-bold text-[#12D176]">
              {profile?.nombre?.[0]?.toUpperCase() ?? 'A'}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
