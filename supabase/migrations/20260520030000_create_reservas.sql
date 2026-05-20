CREATE TABLE public.reservas (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  cancha_id      uuid        NOT NULL REFERENCES public.canchas(id) ON DELETE CASCADE,
  usuario_id     uuid        NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  fecha          date        NOT NULL,
  slot_inicio    time        NOT NULL,
  estado         text        NOT NULL DEFAULT 'pendiente'
                             CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cancha_id, fecha, slot_inicio)
);

ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Users see their own reservas; admins see all
CREATE POLICY "reservas_select" ON public.reservas
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Users can only insert their own reservas
CREATE POLICY "reservas_insert" ON public.reservas
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- Only admins can update estado
CREATE POLICY "reservas_update" ON public.reservas
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  );
