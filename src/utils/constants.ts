// ─── NAVIGATION ───────────────────────────────────────────────────────────────

export const NAV_LINKS = ['Canchas', 'Reservar', 'Retos'] as const

// ─── HERO ─────────────────────────────────────────────────────────────────────

export const HERO_STATS = [
  { val: '+50', label: 'canchas activas' },
  { val: '98%', label: 'confirmadas' },
  { val: '2min', label: 'para reservar' },
] as const

// ─── MARQUEE ──────────────────────────────────────────────────────────────────

export const MARQUEE_ITEMS = [
  'RESERVA',
  'RETA',
  'JUEGA',
  'CANCHAS SINTÉTICAS',
  'FÚTBOL 5 · 7 · 11',
  'BOOKING INSTANTÁNEO',
  'RETOS EN VIVO',
  'GESTIONA TUS TURNOS',
] as const

// ─── FEATURES BENTO ───────────────────────────────────────────────────────────

export type FeatureVariant = 'dark' | 'lime' | 'light'

export type Feature = {
  title: string
  desc: string
  image?: string
  variant: FeatureVariant
  span: string
}

export const FEATURES: Feature[] = [
  {
    title: 'Reserva tu cancha',
    desc: 'Elige fecha, horario y tipo de cancha. Confirma en segundos con disponibilidad en tiempo real.',
    image: 'https://picsum.photos/seed/reservation/800/500',
    variant: 'dark',
    span: 'col-span-2 row-span-1',
  },
  {
    title: 'Reta equipos',
    desc: 'Publica un reto, encuentra rivales y acepta partidos. Fútbol competitivo sin complicaciones.',
    image: 'https://picsum.photos/seed/soccer/600/900',
    variant: 'light',
    span: 'col-span-1 row-span-2',
  },
  {
    title: 'Calendario de turnos',
    desc: 'Todos tus turnos en un calendario interactivo. Cancela o reagenda con un toque.',
    variant: 'lime',
    span: 'col-span-1 row-span-1',
  },
  {
    title: 'Panel admin',
    desc: 'Dashboard para administradores: canchas, horarios y reservas desde un solo lugar.',
    variant: 'dark',
    span: 'col-span-1 row-span-1',
  },
]

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

export type Step = {
  n: string
  title: string
  desc: string
}

export const STEPS: Step[] = [
  {
    n: '01',
    title: 'Busca tu cancha',
    desc: 'Filtra por ubicación, tipo de superficie y precio. Disponibilidad en tiempo real.',
  },
  {
    n: '02',
    title: 'Elige tu horario',
    desc: 'Selecciona fecha y slot disponible. Ve los horarios libres sin llamar a nadie.',
  },
  {
    n: '03',
    title: 'Confirma y juega',
    desc: 'Confirmación instantánea. Recibes notificación y solo queda llegar a la cancha.',
  },
]

// ─── RETOS ────────────────────────────────────────────────────────────────────

export type RetoChallenge = {
  team: string
  time: string
  status: string
}

export const RETO_CHALLENGES: RetoChallenge[] = [
  { team: 'Los Cóndores', time: '19:00', status: 'Esperando rival' },
  { team: 'FC Mestizo', time: '20:30', status: 'Reto publicado' },
]

// ─── FOOTER ───────────────────────────────────────────────────────────────────

export const FOOTER_LINKS = ['Canchas', 'Reservar', 'Retos', 'Administración', 'Contacto'] as const

// ─── UI STYLES ────────────────────────────────────────────────────────────────

export const CLS = {
  label: 'text-[11px] font-medium tracking-[0.3em] text-[#0C6E3C] uppercase',
  btnDark:
    'rounded-full bg-[#072f1a] px-7 py-3.5 text-sm font-bold text-[#F2F0EB] transition-all hover:scale-105 hover:bg-[#171715] active:scale-95',
  btnOutline:
    'rounded-full border border-[#121210]/15 px-7 py-3.5 text-sm font-medium text-[#57534E] transition-all hover:border-[#121210]/30 hover:text-[#121210]',
  btnGhost:
    'rounded-full border border-white/10 px-7 py-3.5 text-sm font-medium text-[#7A9480] transition-all hover:border-[#12D176]/30 hover:text-[#12D176]',
}

export const CARD_STYLES = {
  dark: {
    wrapper: 'bg-[#072f1a] border-white/[0.05]',
    gradient: 'from-transparent to-[#072f1a]/90',
    imgOpacity: 0.15,
    imgFilter: 'grayscale(60%) contrast(1.1)',
    title: 'text-[#F2F0EB]',
    desc: 'text-[#7A9480]',
  },
  lime: {
    wrapper: 'bg-[#D8F5E8] border-[#0A9952]/20',
    gradient: 'from-transparent to-[#D8F5E8]/90',
    imgOpacity: 0.12,
    imgFilter: 'sepia(10%) contrast(1.05) saturate(0.8)',
    title: 'text-[#121210]',
    desc: 'text-[#57534E]',
  },
  light: {
    wrapper: 'bg-[#F2F1EE] border-[#121210]/[0.06]',
    gradient: 'from-transparent to-[#F2F1EE]/90',
    imgOpacity: 0.12,
    imgFilter: 'sepia(10%) contrast(1.05) saturate(0.8)',
    title: 'text-[#121210]',
    desc: 'text-[#57534E]',
  },
} satisfies Record<
  FeatureVariant,
  {
    wrapper: string
    gradient: string
    imgOpacity: number
    imgFilter: string
    title: string
    desc: string
  }
>
