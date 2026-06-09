# Errores Comunes — Guía de Solución Rápida

Catálogo de bugs frecuentes en este proyecto. Antes de preguntar al equipo, buscá aquí.

---

## Supabase

### Error: `supabase client undefined` o `TypeError: Cannot read properties of undefined`
**Causa:** `VITE_SUPABASE_URL` o `VITE_SUPABASE_PUBLISHABLE_KEY` no están en `.env.local`
**Fix:**
```bash
cp .env.example .env.local
# Pedir valores al dueño del proyecto y llenarlos
```

---

### Error: query devuelve `[]` aunque hay datos en la tabla
**Causa:** RLS activo pero la policy no cubre al usuario actual
**Fix:**
1. Ir a Supabase Dashboard → Authentication → Policies
2. Verificar que existe una policy `SELECT` para el rol correspondiente
3. Verificar que `auth.uid()` coincide con el campo `id` del row

---

### Error: `insert` falla con `new row violates row-level security policy`
**Causa:** No hay policy `INSERT` para el usuario autenticado
**Fix:** Agregar policy `INSERT` en Supabase Dashboard para esa tabla. Ver las policies existentes en `supabase/migrations/` como referencia.

---

### Error: datos de usuario `null` justo después de login
**Causa:** `onAuthStateChange` es async — el componente renderiza antes que llegue el session
**Fix:** Verificar `loading` del `AuthContext` antes de consumir `profile`:
```tsx
const { profile, loading } = useAuth()
if (loading) return <Spinner />
```

---

### Error: `JWT expired` en producción pero no en dev
**Causa:** Token de Supabase expiró y no se refrescó
**Fix:** `supabase-js` refresca automáticamente si el cliente es singleton. Verificar que no se están creando múltiples instancias del cliente — debe importarse siempre desde `src/services/supabaseClient.ts`.

---

## TypeScript

### Error: `Type 'string | undefined' is not assignable to type 'string'`
**Causa:** Variable de entorno puede ser `undefined` — TypeScript lo detecta
**Fix:** El singleton ya valida esto al inicio. Si aparece en otro lugar:
```ts
const value = import.meta.env.VITE_ALGO
if (!value) throw new Error('Missing VITE_ALGO')
```

---

### Error: `Property does not exist on type '{}'`
**Causa:** Objeto tipado como `{}` o `any` implícito
**Fix:** Definir la interface correcta en `src/types/` y tipar explícitamente. Nunca usar `as any`.

---

### Error: `noUnusedLocals` — variable declarada pero no usada
**Causa:** `tsconfig.app.json` tiene `noUnusedLocals: true`
**Fix:** Eliminar la variable o usarla. Si es un parámetro de función que no se usa: prefijarlo con `_`:
```ts
function handler(_event: Event, value: string) { ... }
```

---

## React

### Bug: `useEffect` corre en loop infinito
**Causa:** Objeto o array como dependencia — nueva referencia en cada render
**Fix:**
```tsx
// ❌ mal — objeto nuevo cada render
useEffect(() => { ... }, [{ id, nombre }])

// ✅ bien — primitivos estables
useEffect(() => { ... }, [id, nombre])
```

---

### Bug: estado desactualizado dentro de un callback async
**Causa:** Closure captura el valor inicial del estado
**Fix:** Usar `useRef` para valores que necesitás leer dentro de async, o usar el patrón de setter funcional:
```ts
setCount(prev => prev + 1) // ✅ siempre usa el valor actual
```

---

### Error: componente renderiza antes que lleguen los datos y rompe la UI
**Causa:** No se maneja el estado `loading`
**Fix:** Siempre modelar los tres estados:
```tsx
if (loading) return <Spinner />
if (error) return <ErrorMessage message={error} />
return <MiComponente data={data} />
```

---

### Bug: navegación con `navigate()` no actualiza los datos de la página
**Causa:** El componente destino cachea datos del render anterior
**Fix:** Verificar que el hook de fetch depende de un parámetro de ruta (`useParams`) y que ese parámetro está en el array de dependencias.

---

## Vite / Build

### Error: `VITE_` variable undefined en producción (Vercel)
**Causa:** Variable no agregada como secret en el proyecto de Vercel
**Fix:** Ir a Vercel Dashboard → Settings → Environment Variables → agregar `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.

---

### Error: `Failed to resolve import` al agregar un archivo nuevo
**Causa:** Alias `@/` no reconocido o path incorrecto
**Fix:** Verificar que el import usa `@/` desde `src/`:
```ts
import { algo } from '@/components/MiComponente' // ✅
import { algo } from '../../../components/MiComponente' // ❌ no usar relative profundo
```

---

### Error: build pasa local pero falla en CI con error de tipos
**Causa:** CI corre `tsc -b` estricto — el check local puede estar usando caché
**Fix:** Correr `pnpm type-check` (no solo `pnpm build`) antes de pushear:
```bash
pnpm type-check && pnpm build
```

---

## ESLint / Prettier

### Error: `react-hooks/exhaustive-deps` warning en lint
**Causa:** Falta una dependencia en el array de `useEffect` o `useCallback`
**Fix:** Agregar la dependencia faltante. Si es una función, definirla con `useCallback` o moverla fuera del componente si no depende de estado.

---

### Error: prettier falla en CI pero el archivo se ve bien
**Causa:** Diferencia de line endings (CRLF en Windows vs LF en CI)
**Fix:**
```bash
pnpm prettier --write "src/**/*.{ts,tsx,css}"
git add .
```

---

## Cómo agregar un error nuevo a esta lista

Cuando encuentres un bug que te costó más de 15 minutos resolver:

1. Documentarlo aquí con el formato: **Error**, **Causa**, **Fix**
2. Ser específico — incluir el mensaje de error exacto si es posible
3. Abrir PR con el agregado (tipo `docs:`)
