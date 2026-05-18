import { useState, useEffect } from 'react'
import {
  NAV_LINKS, HERO_STATS, MARQUEE_ITEMS,
  FEATURES, STEPS, RETO_CHALLENGES, FOOTER_LINKS,
  CLS, CARD_STYLES,
} from '@/utils/constants'
import {
  useParallaxScroll,
  useWordScrub,
  useStaggerEntrance,
} from '@/hooks/useScrollAnimations'

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const expanded = !scrolled || hovered

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-5 z-50 flex justify-center">
      <nav
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`pointer-events-auto flex items-center gap-1 rounded-full border bg-[#F9F9F8]/85 p-1.5 backdrop-blur-2xl transition-all duration-500 ease-in-out ${
          scrolled && !hovered
            ? 'border-[#121210]/[0.12] shadow-[0_8px_28px_rgba(0,0,0,0.10)]'
            : 'border-[#121210]/[0.07] shadow-[0_4px_16px_rgba(0,0,0,0.07)]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 rounded-full px-4 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#12D176]" />
          <span className="text-xs font-bold tracking-[0.22em] text-[#072f1a] uppercase">
            Cancha
          </span>
        </div>

        {/* Links — collapse on scroll, re-expand on hover */}
        <div
          className={`hidden items-center overflow-hidden transition-all duration-500 ease-in-out md:flex ${
            expanded ? 'max-w-[440px] opacity-100' : 'max-w-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="mx-1 h-4 w-px shrink-0 bg-[#121210]/[0.10]" />
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-medium text-[#57534E] transition-all duration-200 hover:bg-[#121210]/[0.05] hover:text-[#121210]"
            >
              {link}
            </a>
          ))}
          <div className="mx-1 h-4 w-px shrink-0 bg-[#121210]/[0.10]" />
        </div>

        {/* CTA */}
        <button className="rounded-full bg-[#072f1a] px-5 py-2 text-xs font-bold text-[#F2F0EB] transition-all duration-200 hover:bg-[#0d4526] hover:scale-105 active:scale-95">
          Entrar
        </button>
      </nav>
    </div>
  )
}

function Hero() {
  const { sectionRef, targetRef } = useParallaxScroll()

  return (
    <section ref={sectionRef} className="relative flex min-h-screen items-center overflow-hidden bg-[#F9F9F8] pt-20">
      <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/4 -translate-y-1/4 rounded-full bg-[#12D176]/[0.05] blur-[120px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-10">

          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-[#12D176]" />
              <span className={CLS.label}>Canchas sintéticas · Booking</span>
            </div>

            <h1 className="text-[clamp(4.5rem,7.5vw,8rem)] leading-[0.86] tracking-[-0.03em]">
              <span className="block font-extrabold text-[#121210]">Reserva.</span>
              <span className="block font-extrabold text-outline">Reta.</span>
              <span className="block font-extrabold text-[#0C6E3C]">Juega.</span>
            </h1>

            <p className="max-w-xs text-[15px] leading-relaxed text-[#57534E]">
              Encuentra tu cancha, elige el horario y confirma en segundos. Sin llamadas, sin filas.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button className={CLS.btnDark}>Reservar ahora</button>
              <button className={CLS.btnOutline}>Ver canchas →</button>
            </div>

            <div className="flex items-center gap-6 border-t border-[#121210]/[0.07] pt-6">
              {HERO_STATS.map(({ val, label }, i) => (
                <div key={i} className="flex items-center gap-6">
                  {i > 0 && <div className="h-8 w-px bg-[#121210]/[0.07]" />}
                  <div>
                    <p className="text-2xl font-extrabold text-[#072f1a]">{val}</p>
                    <p className="text-xs text-[#9C9790]">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={targetRef} className="relative overflow-hidden rounded-[2.5rem]">
            <img
              src="https://picsum.photos/seed/grassfield/900/720"
              alt="Cancha sintética"
              className="h-[580px] w-full object-cover"
              style={{ filter: 'sepia(5%) brightness(0.82) contrast(1.1) saturate(0.9)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#072f1a]/60" />

            <div className="absolute bottom-5 left-5 right-5">
              <div className="flex items-center justify-between rounded-2xl bg-[#F9F9F8]/92 px-5 py-4 backdrop-blur-md">
                <div>
                  <p className="text-sm font-semibold text-[#121210]">Disponible ahora mismo</p>
                  <p className="text-xs text-[#57534E]">Fútbol 5 · Cancha norte · 20:00</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#072f1a]">
                  <svg className="h-4 w-4 text-[#12D176]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="absolute right-5 top-5 rounded-xl bg-[#12D176] px-3.5 py-1.5 text-xs font-bold text-[#072f1a]">
              En vivo
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

function MarqueeStrip() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="relative overflow-hidden border-y border-[#121210]/[0.06] bg-[#F9F9F8] py-4">
      <div className="flex animate-marquee gap-12 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="text-[11px] font-semibold tracking-[0.25em] text-[#121210]/30 uppercase">
            {item}
            <span className="mx-8 text-[#12D176] opacity-70">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function Features() {
  const { containerRef, titleRef } = useWordScrub()

  return (
    <section ref={containerRef} id="canchas" className="mx-auto w-full max-w-7xl px-6 py-32 lg:px-12 lg:py-48">
      <div className="mb-16 space-y-5">
        <p className={CLS.label}>Todo lo que necesitas</p>
        <h2 ref={titleRef} className="max-w-4xl text-[clamp(2.5rem,4.5vw,5rem)] leading-[0.9] tracking-tight text-[#121210]">
          {'Una plataforma.'.split(' ').map((w, i) => (
            <span key={`a${i}`} className="mr-[0.25em] font-extrabold">{w}</span>
          ))}
          <br />
          {'Todas las herramientas.'.split(' ').map((w, i) => (
            <span key={`b${i}`} className="mr-[0.25em] font-extrabold">{w}</span>
          ))}
        </h2>
      </div>

      <div className="grid grid-flow-dense auto-rows-[290px] grid-cols-3 gap-3">
        {FEATURES.map((f, i) => {
          const s = CARD_STYLES[f.variant]
          return (
            <div key={i} className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 ${s.wrapper} ${f.span}`}>
              {f.image && (
                <img
                  src={f.image}
                  alt={f.title}
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                  style={{ opacity: s.imgOpacity, filter: s.imgFilter }}
                />
              )}
              <div className={`absolute inset-0 bg-gradient-to-b ${s.gradient}`} />
              <div className="relative flex h-full flex-col justify-end p-7">
                <h3 className={`mb-2 text-lg font-bold ${s.title}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${s.desc}`}>{f.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function HowItWorks() {
  const { containerRef } = useStaggerEntrance('.step-card')

  return (
    <section ref={containerRef} id="reservar" className="bg-[#072f1a] py-32 lg:py-48">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
        <div className="mb-20 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-4 text-[11px] font-medium tracking-[0.3em] text-[#12D176] uppercase">Proceso</p>
            <h2 className="text-[clamp(2.5rem,4.5vw,5rem)] leading-[0.9] tracking-tight">
              <span className="block font-extrabold text-[#F2F0EB]">Tres pasos.</span>
              <span className="block font-extrabold" style={{ WebkitTextStroke: '1.5px #F2F0EB', color: 'transparent' }}>Sin complicaciones.</span>
            </h2>
          </div>
          <button className={CLS.btnGhost}>Empezar →</button>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={i} className="step-card group rounded-3xl border border-white/[0.06] bg-[#171715] p-8 transition-all duration-500 hover:border-white/10 hover:bg-[#1E1E1C]">
              <div className="mb-10 flex items-center justify-between">
                <span className="select-none text-[4rem] font-black leading-none text-white/[0.04]">{step.n}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#12D176]/10 ring-1 ring-[#12D176]/20 transition-all group-hover:bg-[#12D176]/15 group-hover:ring-[#12D176]/30">
                  <div className="h-2 w-2 rounded-full bg-[#12D176]" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#F2F0EB]">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[#5E8268]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RetosSection() {
  return (
    <section id="retos" className="mx-auto w-full max-w-7xl px-6 py-32 lg:px-12 lg:py-48">
      <div className="overflow-hidden rounded-[2.5rem] border border-[#121210]/[0.07]">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-7 bg-[#F2F1EE] p-10 lg:p-16">
            <p className={CLS.label}>Sistema de retos</p>
            <h2 className="text-[clamp(2rem,3.5vw,4.2rem)] leading-[0.9] tracking-tight">
              <span className="block font-extrabold text-[#121210]">¿Tienes equipo?</span>
              <span className="block font-extrabold text-[#0C6E3C]">Reta a alguien.</span>
            </h2>
            <p className="max-w-sm text-[15px] leading-relaxed text-[#57534E]">
              Publica un reto en cualquier slot disponible. Otros equipos lo ven, aceptan y el partido queda listo.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className={CLS.btnDark}>Publicar reto</button>
              <button className={CLS.btnOutline}>Ver retos activos</button>
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden">
            <img
              src="https://picsum.photos/seed/match700/700/500"
              alt="Partido en cancha"
              className="h-full w-full object-cover"
              style={{ filter: 'sepia(5%) brightness(0.65) contrast(1.1)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F2F1EE]/40 to-transparent" />
            <div className="absolute left-6 top-6 space-y-2">
              {RETO_CHALLENGES.map((reto, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#F9F9F8]/92 px-4 py-3 backdrop-blur-sm">
                  <div className="h-2 w-2 rounded-full bg-[#12D176]" />
                  <div>
                    <p className="text-xs font-semibold text-[#121210]">{reto.team}</p>
                    <p className="text-[10px] text-[#57534E]">{reto.time} · {reto.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[#072f1a] py-32 lg:py-48">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-[#12D176]/[0.05] blur-[130px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-12">
        <p className="mb-5 text-[11px] font-medium tracking-[0.3em] text-[#12D176] uppercase">Empieza hoy</p>
        <h2 className="mb-8 text-[clamp(3.5rem,7vw,8rem)] leading-[0.86] tracking-[-0.03em]">
          <span className="block font-extrabold text-[#F2F0EB]">Tu cancha</span>
          <span className="block font-extrabold" style={{ WebkitTextStroke: '1.5px #F2F0EB', color: 'transparent' }}>te espera.</span>
        </h2>
        <p className="mx-auto mb-10 max-w-xs text-[15px] leading-relaxed text-[#5E8268]">
          Sin filas, sin llamadas. Reserva en menos de dos minutos desde cualquier dispositivo.
        </p>
        <button className="rounded-full bg-[#12D176] px-10 py-5 text-base font-bold text-[#072f1a] transition-all hover:scale-105 hover:bg-[#22E484] active:scale-95">
          Reservar mi cancha ahora
        </button>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#121210]/[0.07] bg-[#F9F9F8] py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div>
          <span className="text-sm font-bold tracking-[0.18em] text-[#072f1a] uppercase">Cancha</span>
          <p className="mt-1 text-xs text-[#9C9790]">Booking para canchas sintéticas</p>
        </div>
        <div className="flex flex-wrap gap-6">
          {FOOTER_LINKS.map((link) => (
            <a key={link} href="#" className="text-xs text-[#9C9790] transition-colors hover:text-[#57534E]">
              {link}
            </a>
          ))}
        </div>
        <p className="text-xs text-[#C4BFB8]">© 2026 Cancha.</p>
      </div>
    </footer>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <Nav />
      <Hero />
      <MarqueeStrip />
      <Features />
      <HowItWorks />
      <RetosSection />
      <CTASection />
      <Footer />
    </main>
  )
}
