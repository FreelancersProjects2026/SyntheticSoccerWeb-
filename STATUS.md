# Implementation Status (as of 2026-07-12)

## Done
- Landing page with GSAP scroll animations (parallax, word scrub, staggered entrance)
- Auth: email/password signup & login via Supabase
- Role-based protected routes (`ProtectedRoute`)
- `AuthContext` with profile fetching from `usuarios`
- `usuarios`, `roles`, `canchas`, `reservas` DB tables with RLS + auto-create trigger
- Admin layout shell (sidebar + header, responsive)
- Cancha CRUD (`admin/Canchas.tsx` + `CanchaModal.tsx`, image upload to `canchas-images`)
- Booking flow (`Reservar.tsx`): slot picker filtered by `getSlotsTomados`, `createReserva`
- User's own reservations (`MisReservas.tsx`) with comprobante (payment proof) upload
- Admin reservation review (`admin/Reservas.tsx`): aprobar/rechazar comprobante, `estado` transitions
- `src/types/index.ts` (Cancha, Reserva, ReservaConDetalles) and `src/utils/format.ts` (date helpers)

## Not yet implemented
- Retos system (challenge matching)
- Real data in Dashboard stats (still skeleton/stub)
- `admin/Usuarios.tsx` (still an empty, non-functional table)
- `retos` DB migration
- `src/components/Button.tsx` — removed; no shared Button component exists, one hasn't been reintroduced

See [CLAUDE.md](./CLAUDE.md) for the rest of the stack.
