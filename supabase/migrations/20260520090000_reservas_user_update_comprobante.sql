-- Allow users to update their own reservations (needed to write comprobante_url).
-- Multiple UPDATE policies combine with OR, so admins retain full update access.
CREATE POLICY "reservas_update_own" ON public.reservas
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());
