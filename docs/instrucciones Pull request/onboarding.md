# Onboarding — Nuevo Desarrollador

Seguí esta guía en orden. Al final tenés el proyecto corriendo localmente y estás listo para trabajar.

---

## 1. Accesos que necesitás pedir

Antes de empezar, pedile al dueño del proyecto:

- [ ] Acceso al repositorio en GitHub (`FreelancersProjects2026/SyntheticSoccerWeb-`)
- [ ] Valores de `.env.local` (URL y key de Supabase)
- [ ] Acceso al proyecto en Supabase Dashboard (opcional, para ver DB)

---

## 2. Requisitos previos

Verificá que tenés instalado:

```bash
node --version    # necesitás v22+
pnpm --version    # necesitás pnpm (no npm, no yarn)
git --version
```

Si no tenés `pnpm`:
```bash
npm install -g pnpm
```

---

## 3. Clonar el repositorio

```bash
git clone https://github.com/FreelancersProjects2026/SyntheticSoccerWeb-.git
cd SyntheticSoccerWeb-
```

---

## 4. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Abrir `.env.local` y llenar con los valores que te pasó el dueño del proyecto:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

Nunca commitear `.env.local` — ya está en `.gitignore`.

---

## 5. Instalar dependencias

```bash
pnpm install
```

Siempre usar `pnpm`. Nunca `npm install` ni `yarn` — rompe el lockfile.

---

## 6. Correr el proyecto

```bash
pnpm dev
```

Abrir `http://localhost:5173` en el navegador. Si carga la landing page, todo está bien.

---

## 7. Verificar que CI pasará antes de tu primer commit

```bash
pnpm type-check && pnpm lint && pnpm prettier --check "src/**/*.{ts,tsx,css}" && pnpm build
```

Los 4 checks deben pasar en verde. Si alguno falla, revisá `errores-comunes.md`.

---

## 8. Leer la documentación del proyecto

Antes de tocar código, leer en orden:

1. `CLAUDE.md` — stack, estructura, comandos, estado de implementación
2. `docs/instrucciones Pull request/git-workflow.md` — cómo trabajar con ramas y commits
3. `docs/instrucciones Pull request/como-hacer-un-buen-pr.md` — cómo abrir PRs
4. `docs/instrucciones Pull request/errores-comunes.md` — bugs frecuentes y soluciones

---

## 9. Crear tu primera rama

Nunca trabajar directo en `main`:

```bash
git checkout main
git pull
git checkout -b feat/tu-primera-tarea
```

---

## Stack del proyecto

| Capa | Tecnología |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite |
| Routing | React Router v7 |
| Estilos | Tailwind CSS 4 |
| Backend | Supabase (auth + DB) |
| Animaciones | GSAP 3 |
| Package manager | pnpm |

---

## Estructura de carpetas clave

```
src/
  components/   → UI pura, sin lógica de negocio
  pages/        → componentes de ruta, solo composición
  hooks/        → lógica y estado
  services/     → todas las llamadas a Supabase (solo aquí)
  context/      → AuthContext (auth state global)
  utils/        → funciones puras
  types/        → interfaces TypeScript
```

Regla principal: **Supabase solo en `src/services/`**. Nunca importar el cliente directo en un componente o página.

---

## Comandos del día a día

```bash
pnpm dev          # servidor de desarrollo
pnpm type-check   # verificar tipos TypeScript
pnpm lint         # verificar ESLint
pnpm lint:fix     # auto-corregir ESLint
pnpm format       # formatear con Prettier
pnpm build        # build de producción
```

---

## Preguntas frecuentes

**¿Por qué no puedo mergear mi PR?**
El repo requiere al menos 1 aprobación. Asigná un reviewer en GitHub y esperá la aprobación.

**¿Por qué CI falla con error de tipos?**
Corré `pnpm type-check` local para ver el error exacto antes de pushear.

**¿Dónde agrego una nueva feature?**
Seguí la estructura de capas — componente en `components/`, lógica en `hooks/`, Supabase en `services/`. Ver `CLAUDE.md` para el patrón completo.

**¿Tengo un bug raro?**
Revisá `docs/instrucciones Pull request/errores-comunes.md` primero.
