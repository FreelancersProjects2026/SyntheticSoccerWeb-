-- Index for RLS SELECT/UPDATE policy (EXISTS subquery on usuario_id)
CREATE INDEX idx_reservas_usuario_id ON public.reservas(usuario_id);

-- Composite index for the main booking query (slots taken for a cancha+date)
CREATE INDEX idx_reservas_cancha_fecha ON public.reservas(cancha_id, fecha);
