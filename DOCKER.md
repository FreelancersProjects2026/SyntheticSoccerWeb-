# Docker (entorno de desarrollo opcional)

`Dockerfile` + `docker-compose.yml` en raíz del repo dan a los 3 devs mismo entorno local (Node 22 + pnpm). Alternativa a correr `pnpm dev` en el host. No reemplazo — ambos funcionan en paralelo. Sin efecto en deploy (sigue siendo Vercel, sin Docker ahí).

```bash
docker compose up          # build (primera vez) + levanta dev server en localhost:5173, hot reload vía volumen montado
docker compose up --build  # correr de nuevo tras cambio en package.json / pnpm-lock.yaml (deps quedan horneadas en imagen, no se reinstalan solas)
docker compose down        # apagar
```

Requiere `.env.local` ya existente en raíz del repo (mismo file que dev sin Docker). `docker-compose.yml` lo lee vía `env_file`.

Si vos (Claude) tocás deps en `package.json`, avisale al usuario correr `docker compose up --build` después, si no, imagen usa `node_modules` viejo.

**¿Cuándo usar cada uno?**
- Día a día: `pnpm dev` — sin cambio, sigue igual.
- Máquina nueva / PC rota / setup roto: `docker compose up` — mismas deps y versiones que resto del equipo, sin instalar Node/pnpm a mano ni debuggear versión rara.

## Pasos para arrancar el proyecto (setup completo)

1. **Clonar repo** + entrar a la carpeta.
2. **Instalar pnpm** (repo fija `pnpm@10.33.2` vía campo `packageManager`, corepack lo maneja).
3. **Conseguir `.env.local`** con el dueño del proyecto — necesita `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`. Colocar en raíz del repo.
4. **Correr proyecto** — 2 caminos, elegir uno:
   - Host: `pnpm install` -> `pnpm dev` -> `localhost:5173`
   - Docker (mismo entorno para los 3): `docker compose up` -> `localhost:5173`
5. **Comandos de desarrollo** (igual en host o dentro del contenedor):
   - `pnpm lint` / `pnpm lint:fix`
   - `pnpm format`
   - `pnpm type-check`
   - `pnpm build` antes de chequear deploy
6. **¿Cambiaron deps?** (`package.json`) usuarios de Docker corren `docker compose up --build` después de hacer pull.
7. **Alias de path**: `@/` -> `src/`.
8. **Auth/roles**: `AuthContext` -> `profile.rol` (`admin`/`user`), `ProtectedRoute` protege `/admin/*`.
9. **Sin construir aún**: CRUD de canchas, CRUD de reservas, retos, datos reales del dashboard — ver CLAUDE.md sección "Implementation Status" para lista completa.
