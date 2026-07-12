# Supabase local (reglas para IA y devs)

DB corre local vía Docker (`supabase start`), no remoto. 3 comandos, nada mas:

```bash
pnpm db:start   # supabase start — levanta stack (Postgres/Auth/Storage/Studio)
pnpm db:reset   # supabase db reset — aplica migraciones + seed
pnpm db:stop    # supabase stop — apaga stack
```

## Nueva tabla / nueva migración

Creaste o editaste algo en `supabase/migrations/*.sql` (tabla nueva, columna nueva, policy nueva, etc)?
Correr **`pnpm db:reset`** después, siempre. Es lo único que aplica migraciones a la DB local — escribir el `.sql` no alcanza.

## Error "supabase no corre" / conexión rechazada

Si un comando falla porque Supabase no está corriendo (`ECONNREFUSED`, `fetch failed` a `127.0.0.1:54321`, etc):
Correr **`pnpm db:start`** primero, después reintentar.

## Terminar de trabajar

Correr **`pnpm db:stop`** para apagar los contenedores (opcional, libera Docker).

## Database Tables

| Table | Description |
|---|---|
| `roles` | Lookup: `{ id: smallint, name: text }` — rows: 'cliente', 'administrador'. RLS: read-only for all. |
| `usuarios` | User profiles: `{ id uuid FK auth.users, nombre, telefono, rol, created_at }`. RLS: users can read/update/insert only their own row. A trigger `handle_new_user()` auto-creates a profile on `auth.signup`, pulling `nombre` and `telefono` from `raw_user_meta_data`. |
| `canchas` | Fields: `{ id uuid, nombre, tipo: 'futbol5'\|'futbol6'\|'futbol7'\|'futbol11', slots_por_dia, precio_por_slot, estado: 'activa'\|'inactiva', descripcion, imagen_url, created_at }`. RLS: any authenticated user can `SELECT`; only admins can `INSERT`/`UPDATE`. Images in public storage bucket `canchas-images` (admin-only upload). |
| `reservas` | Bookings: `{ id uuid, cancha_id FK, usuario_id FK, fecha, slot_inicio, estado: 'pendiente'\|'confirmada'\|'pagada'\|'cancelada', comprobante_url, rechazo_motivo, created_at }`, unique on `(cancha_id, fecha, slot_inicio)`. RLS: users see/insert only their own rows (`usuario_id = auth.uid()`), admins see all and are the only ones who can update `estado`; a separate policy lets users update their own `comprobante_url`. Payment proof images in storage bucket `comprobantes`. |

**Pending (not yet created):** `retos` — team challenges.

## Contributor vs owner commands

Local dev runs against your own local Supabase stack (Postgres/Auth/Storage/Studio in Docker), not the shared remote project.

```bash
pnpm install
pnpm db:start     # supabase start — applies supabase/migrations/* + supabase/seed.sql
pnpm dev
```

`pnpm db:start` prints the local URL + anon key. Copy `.env.local.example` to `.env.local` — the values there are the standard Supabase CLI local-dev constants (same on every machine, not secrets), so no need to ask the owner.

Seed creates a test admin: `admin@local.test` / `admin1234`.

**Owner-only** (remote/staging — contributors never run these):

```bash
pnpm supabase link --project-ref <ref>      # link local CLI to the remote project
pnpm supabase migration new <name>          # create a new migration file
pnpm supabase db push                       # apply pending migrations to remote (after validating locally via pnpm db:reset)
```

Ver [CLAUDE.md](./CLAUDE.md) para el resto del stack y [DOCKER.md](./DOCKER.md) para Docker de la app.
