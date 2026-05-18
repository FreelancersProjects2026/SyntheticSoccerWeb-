import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'

function translateError(msg: string): string {
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return 'Este correo ya está registrado'
  if (msg.includes('Password should be at least'))
    return 'La contraseña debe tener al menos 6 caracteres'
  if (msg.includes('Unable to validate email address')) return 'Correo electrónico inválido'
  return msg
}

export default function Register() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, telefono } },
    })
    if (error) {
      setError(translateError(error.message))
    } else if (data.user) {
      // Fallback: upsert profile in case the DB trigger didn't run
      await supabase.from('usuarios').upsert({
        id: data.user.id,
        nombre,
        telefono,
        rol: 'user',
      })
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Brand Panel ─────────────────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-[#072f1a] lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute top-0 right-0 h-[400px] w-[400px] translate-x-1/3 -translate-y-1/3 rounded-full bg-[#12D176]/[0.08] blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#12D176]/[0.05] blur-[80px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#12D176 1px, transparent 1px), linear-gradient(90deg, #12D176 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#12D176]" />
          <span className="text-xs font-bold tracking-[0.22em] text-[#F9F9F8] uppercase">
            Cancha
          </span>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <p className="mb-5 text-[10px] font-semibold tracking-[0.3em] text-[#12D176]/60 uppercase">
            Únete hoy
          </p>
          <h2 className="mb-6 text-[4.5rem] leading-[0.86] font-extrabold">
            <span className="block text-[#F2F0EB]">Tu equipo.</span>
            <span className="block text-[#F2F0EB]">Tu cancha.</span>
            <span
              className="block"
              style={{ WebkitTextStroke: '1.5px #12D176', color: 'transparent' }}
            >
              Tu momento.
            </span>
          </h2>
          <p className="max-w-[260px] text-[14px] leading-relaxed text-[#4a7a5a]">
            Crea tu cuenta y empieza a reservar canchas y publicar retos en segundos.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <div className="mb-4 h-px w-12 bg-[#12D176]/30" />
          <p className="text-[11px] text-[#3a5f4a]">© 2026 Cancha · Canchas sintéticas</p>
        </div>
      </div>

      {/* ── Form Panel ──────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center bg-[#F9F9F8] px-6 py-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="h-1.5 w-1.5 rounded-full bg-[#12D176]" />
            <span className="text-xs font-bold tracking-[0.22em] text-[#072f1a] uppercase">
              Cancha
            </span>
          </div>

          <div className="mb-8">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-[#12D176] uppercase">
              Nueva cuenta
            </p>
            <h1 className="text-[2.4rem] leading-tight font-extrabold text-[#121210]">
              Regístrate
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold tracking-wide text-[#57534E] uppercase">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  className="w-full rounded-2xl border border-[#121210]/[0.10] bg-white px-4 py-3.5 text-[14px] text-[#121210] transition-all duration-200 outline-none placeholder:text-[#C4BFB8] focus:border-[#072f1a]/60 focus:ring-3 focus:ring-[#072f1a]/[0.06]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold tracking-wide text-[#57534E] uppercase">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+57 300..."
                  required
                  className="w-full rounded-2xl border border-[#121210]/[0.10] bg-white px-4 py-3.5 text-[14px] text-[#121210] transition-all duration-200 outline-none placeholder:text-[#C4BFB8] focus:border-[#072f1a]/60 focus:ring-3 focus:ring-[#072f1a]/[0.06]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold tracking-wide text-[#57534E] uppercase">
                Correo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full rounded-2xl border border-[#121210]/[0.10] bg-white px-4 py-3.5 text-[14px] text-[#121210] transition-all duration-200 outline-none placeholder:text-[#C4BFB8] focus:border-[#072f1a]/60 focus:ring-3 focus:ring-[#072f1a]/[0.06]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold tracking-wide text-[#57534E] uppercase">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full rounded-2xl border border-[#121210]/[0.10] bg-white px-4 py-3.5 pr-12 text-[14px] text-[#121210] transition-all duration-200 outline-none placeholder:text-[#C4BFB8] focus:border-[#072f1a]/60 focus:ring-3 focus:ring-[#072f1a]/[0.06]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#C4BFB8] transition-colors duration-150 hover:text-[#57534E]"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold tracking-wide text-[#57534E] uppercase">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  className="w-full rounded-2xl border border-[#121210]/[0.10] bg-white px-4 py-3.5 pr-12 text-[14px] text-[#121210] transition-all duration-200 outline-none placeholder:text-[#C4BFB8] focus:border-[#072f1a]/60 focus:ring-3 focus:ring-[#072f1a]/[0.06]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[#C4BFB8] transition-colors duration-150 hover:text-[#57534E]"
                  aria-label={showConfirm ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showConfirm ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-[12px] text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-2xl bg-[#072f1a] py-4 text-[13px] font-bold text-[#F2F0EB] transition-all duration-200 hover:scale-[1.015] hover:bg-[#0d4526] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-7 text-center text-[12px] text-[#9C9790]">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-bold text-[#072f1a] transition-colors hover:text-[#0d4526]"
            >
              Inicia sesión
            </Link>
          </p>

          <Link
            to="/"
            className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#C4BFB8] transition-colors hover:text-[#57534E]"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
