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

Ver [CLAUDE.md](./CLAUDE.md) para el resto del stack y [DOCKER.md](./DOCKER.md) para Docker de la app.
