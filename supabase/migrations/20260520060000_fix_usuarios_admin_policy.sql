-- The previous policy queried usuarios from inside a usuarios RLS policy,
-- causing PostgreSQL to throw "infinite recursion detected in policy for relation usuarios".
-- Every usuarios query (including admin self-read on login) was failing.
DROP POLICY IF EXISTS "usuarios: admin puede leer todos" ON public.usuarios;

-- SECURITY DEFINER bypasses RLS for the inner query, breaking the recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin'
  )
$$;

-- Admins can now read any usuarios row (needed for the reservas join).
-- Non-admins are unaffected: policy 1 (own row) still applies.
CREATE POLICY "usuarios: admin puede leer todos"
  ON public.usuarios FOR SELECT
  USING (public.is_admin());
