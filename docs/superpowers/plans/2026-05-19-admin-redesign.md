# Admin Panel Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite 5 admin files with light sidebar, horizontal stat cards, and borderless tables per spec.

**Architecture:** Pure visual rewrite — no new files, no shared components, no data changes. Each file self-contained. Icons stay inline SVG.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, GSAP 3, React Router v7

---

### Task 1: AdminLayout.tsx

**Files:**
- Modify: `src/pages/admin/AdminLayout.tsx`

- [ ] **Step 1: Replace file**

```tsx
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
```

- [ ] **Step 2: Type-check**

```bash
pnpm type-check
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/AdminLayout.tsx
git commit -m "feat(admin): rewrite AdminLayout — light sidebar, grouped nav, minimal topbar"
```

---

### Task 2: Dashboard.tsx

**Files:**
- Modify: `src/pages/admin/Dashboard.tsx`

- [ ] **Step 1: Replace file**

```tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

function IconField() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 18 18" stroke="currentColor" strokeWidth={1.7}>
      <rect x="1" y="2.5" width="16" height="13" rx="1.5" />
      <line x1="9" y1="2.5" x2="9" y2="15.5" />
      <circle cx="9" cy="9" r="2.2" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 18 18" stroke="currentColor" strokeWidth={1.7}>
      <rect x="1.5" y="2.5" width="15" height="14" rx="1.5" />
      <path d="M13 1v3M5 1v3M1.5 8h15" strokeLinecap="round" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 18 18" stroke="currentColor" strokeWidth={1.7}>
      <path d="M12 16v-1.5A3.5 3.5 0 008.5 11H4A3.5 3.5 0 00.5 14.5V16" strokeLinecap="round" />
      <circle cx="6.5" cy="5.5" r="3.5" />
      <path d="M17.5 16v-1.5a3.5 3.5 0 00-2.5-3.35M12 2.15a3.5 3.5 0 010 6.7" strokeLinecap="round" />
    </svg>
  )
}

function IconSwords() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 18 18" stroke="currentColor" strokeWidth={1.7}>
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
        <h1 className="font-display text-[22px] font-bold leading-tight text-[#0d1a12]">
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
              <p className="text-[22px] font-bold leading-none text-[#0d1a12]">{stat.value}</p>
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
            <p key={h} className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#BCBAB5]">
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
```

- [ ] **Step 2: Type-check**

```bash
pnpm type-check
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/Dashboard.tsx
git commit -m "feat(admin): rewrite Dashboard — horizontal stat cards, borderless activity table"
```

---

### Task 3: Canchas.tsx

**Files:**
- Modify: `src/pages/admin/Canchas.tsx`

- [ ] **Step 1: Replace file**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/Canchas.tsx
git commit -m "feat(admin): rewrite Canchas — page header + table card with empty state"
```

---

### Task 4: Reservas.tsx

**Files:**
- Modify: `src/pages/admin/Reservas.tsx`

- [ ] **Step 1: Replace file**

```tsx
export default function Reservas() {
  return (
    <div className="max-w-5xl">
      <div className="mb-7">
        <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-[#12D176] uppercase">
          Gestión
        </p>
        <h1 className="font-display text-[22px] font-bold leading-tight text-[#0d1a12]">
          Reservas
        </h1>
        <p className="mt-1 text-[13px] text-[#9C9790]">
          Historial y estado de todas las reservas
        </p>
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/Reservas.tsx
git commit -m "feat(admin): rewrite Reservas — consistent page header + table card"
```

---

### Task 5: Usuarios.tsx

**Files:**
- Modify: `src/pages/admin/Usuarios.tsx`

- [ ] **Step 1: Replace file**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/Usuarios.tsx
git commit -m "feat(admin): rewrite Usuarios — consistent page header + table card"
```

---

### Task 6: Verify

- [ ] **Step 1: Type-check all**

```bash
pnpm type-check
```
Expected: no errors

- [ ] **Step 2: Lint**

```bash
pnpm lint
```
Expected: no errors

- [ ] **Step 3: Dev server visual check**

```bash
pnpm dev
```

Navigate to `http://localhost:5173/admin` and verify:
- Sidebar is white, 220px, with GENERAL / GESTIÓN sections
- Active nav item shows `#072f1a` background, white text, green icon
- Topbar is minimal — only avatar right
- Dashboard shows 4 horizontal stat cards (icon + number)
- Canchas/Reservas/Usuarios show consistent page header + table card + empty state
- Collapse toggle works (52px icon-only mode)
- Mobile hamburger opens slide-in sidebar
