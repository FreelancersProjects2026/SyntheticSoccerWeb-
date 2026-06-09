# Cómo agregar una Feature nueva

Guía paso a paso para implementar cualquier feature nueva siguiendo la arquitectura del proyecto. Usá `canchas` como ejemplo mental mientras leés.

---

## Estructura de carpetas por feature

Cada feature vive en su propia carpeta dentro de `src/`:

```
src/
  pages/
    NombreFeature.tsx          ← página principal (solo composición)
  components/
    nombre-feature/
      NombreFeatureList.tsx    ← renderiza lista
      NombreFeatureCard.tsx    ← renderiza item individual
      NombreFeatureForm.tsx    ← formulario de creación/edición
  hooks/
    use-nombre-feature-list.ts ← fetch + estado de la lista
    use-nombre-feature-form.ts ← estado del formulario + submit
  services/
    nombre-feature-service.ts  ← todas las queries a Supabase
  types/
    nombre-feature.types.ts    ← interfaces y tipos
```

---

## Paso 1 — Definir los tipos

Primero los tipos. Nada más. Archivo en `src/types/`:

```ts
// src/types/cancha.types.ts

export interface Cancha {
  id: string
  nombre: string
  ubicacion: string
  precio_por_hora: number
  activa: boolean
  created_at: string
}

export interface CreateCanchaInput {
  nombre: string
  ubicacion: string
  precio_por_hora: number
}

export interface UpdateCanchaInput extends Partial<CreateCanchaInput> {
  activa?: boolean
}
```

Reglas:
- `interface` para shapes de objetos
- Tipo separado para input de creación (sin `id`, sin `created_at`)
- Tipo separado para input de edición (`Partial` del input de creación)
- Sin lógica, sin imports de framework

---

## Paso 2 — Crear el service

Todo lo que toca Supabase va aquí. Nada más. Archivo en `src/services/`:

```ts
// src/services/cancha-service.ts

import { supabase } from '@/services/supabaseClient'
import type { Cancha, CreateCanchaInput, UpdateCanchaInput } from '@/types/cancha.types'

export async function fetchCanchas(): Promise<Cancha[]> {
  const { data, error } = await supabase
    .from('canchas')
    .select('*')
    .eq('activa', true)
    .order('nombre')

  if (error) throw new Error(error.message)
  return data
}

export async function createCancha(input: CreateCanchaInput): Promise<Cancha> {
  const { data, error } = await supabase
    .from('canchas')
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateCancha(id: string, input: UpdateCanchaInput): Promise<Cancha> {
  const { data, error } = await supabase
    .from('canchas')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteCancha(id: string): Promise<void> {
  const { error } = await supabase
    .from('canchas')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
```

Reglas:
- Importar `supabase` siempre desde `@/services/supabaseClient`
- Siempre manejar `error` explícitamente — nunca ignorarlo
- Devolver tipos del dominio, no los tipos raw de Supabase
- Sin estado, sin hooks, sin JSX

---

## Paso 3 — Crear los hooks

Los hooks conectan el service con los componentes. Archivos en `src/hooks/`:

```ts
// src/hooks/use-cancha-list.ts

import { useState, useEffect } from 'react'
import { fetchCanchas } from '@/services/cancha-service'
import type { Cancha } from '@/types/cancha.types'

interface UseCanchaListResult {
  canchas: Cancha[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCanchaList(): UseCanchaListResult {
  const [canchas, setCanchas] = useState<Cancha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load(): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCanchas()
      setCanchas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar canchas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return { canchas, loading, error, refetch: load }
}
```

Reglas:
- Siempre modelar los 3 estados: `loading`, `error`, `data`
- Exponer `refetch` para que el componente pueda recargar
- Sin JSX, sin imports de componentes
- Retornar tipo explícito

---

## Paso 4 — Crear los componentes

Solo UI. Sin fetch, sin lógica de negocio. Archivos en `src/components/`:

```tsx
// src/components/canchas/CanchaCard.tsx

import type { Cancha } from '@/types/cancha.types'

interface CanchaCardProps {
  cancha: Cancha
  onEditar: (id: string) => void
  onEliminar: (id: string) => void
}

export function CanchaCard({ cancha, onEditar, onEliminar }: CanchaCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-display text-lg">{cancha.nombre}</h3>
      <p className="text-sm text-gray-500">{cancha.ubicacion}</p>
      <p className="font-semibold">${cancha.precio_por_hora}/hr</p>
      <div className="mt-4 flex gap-2">
        <button onClick={() => onEditar(cancha.id)}>Editar</button>
        <button onClick={() => onEliminar(cancha.id)}>Eliminar</button>
      </div>
    </div>
  )
}
```

Reglas:
- Props solo con los campos que el componente realmente usa
- Emitir eventos hacia arriba con callbacks (`onEditar`, `onEliminar`)
- Sin llamadas a Supabase, sin hooks de fetch
- Máximo 150 líneas — si supera, dividir

---

## Paso 5 — Crear la página

La página solo compone. Usa el hook, pasa datos a componentes. Archivo en `src/pages/`:

```tsx
// src/pages/admin/Canchas.tsx

import { useCanchaList } from '@/hooks/use-cancha-list'
import { CanchaCard } from '@/components/canchas/CanchaCard'

export default function Canchas() {
  const { canchas, loading, error, refetch } = useCanchaList()

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Canchas</h1>
      <div className="grid gap-4">
        {canchas.map(cancha => (
          <CanchaCard
            key={cancha.id}
            cancha={cancha}
            onEditar={(id) => console.log('editar', id)}
            onEliminar={(id) => console.log('eliminar', id)}
          />
        ))}
      </div>
    </div>
  )
}
```

Reglas:
- Sin fetch directo, sin queries Supabase
- Sin lógica de negocio
- Solo composición de componentes

---

## Flujo de dependencias (nunca al revés)

```
página → hook → service → supabaseClient
página → componente ← tipos
```

Un componente nunca importa un service. Un service nunca importa un hook.

---

## Checklist antes de abrir PR con la feature

- [ ] Tipos definidos en `src/types/`
- [ ] Service en `src/services/` — sin imports de React
- [ ] Hook en `src/hooks/` — maneja loading/error/data
- [ ] Componentes en `src/components/nombre-feature/` — sin fetch
- [ ] Página en `src/pages/` — solo composición
- [ ] Ningún archivo supera 150 líneas
- [ ] Ninguna función supera 30 líneas
- [ ] Sin `any` en TypeScript
- [ ] Todos los errores de Supabase manejados con `throw new Error`
- [ ] `pnpm type-check && pnpm lint && pnpm build` pasan
