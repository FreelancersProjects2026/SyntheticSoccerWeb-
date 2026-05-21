-- Drop old inline check constraint (auto-named by postgres)
ALTER TABLE public.reservas DROP CONSTRAINT reservas_estado_check;

-- Re-add including pagada
ALTER TABLE public.reservas
  ADD CONSTRAINT reservas_estado_check
  CHECK (estado IN ('pendiente', 'confirmada', 'pagada', 'cancelada'));

-- Optional rejection reason set when admin rejects a comprobante
ALTER TABLE public.reservas ADD COLUMN rechazo_motivo TEXT;
