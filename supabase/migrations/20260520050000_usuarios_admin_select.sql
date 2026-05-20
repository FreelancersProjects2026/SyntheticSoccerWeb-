-- Allow admins to read any usuarios row so PostgREST can resolve
-- the usuarios(nombre) join when fetching all reservas.
-- Supabase RLS is permissive: this policy is OR'd with the existing
-- "usuarios: leer propio perfil" policy.
create policy "usuarios: admin puede leer todos"
  on public.usuarios for select
  using (
    exists (
      select 1 from public.usuarios
      where id = auth.uid() and rol = 'admin'
    )
  );
