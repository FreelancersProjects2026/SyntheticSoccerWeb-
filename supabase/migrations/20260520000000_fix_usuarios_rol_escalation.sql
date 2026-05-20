-- Fix: prevent users from self-escalating their own 'rol' field.
-- The previous update policy had no WITH CHECK clause, allowing any
-- authenticated user to set rol='admin' on their own row.

drop policy if exists "usuarios: actualizar propio perfil" on public.usuarios;

-- WITH CHECK ensures the new row's rol equals the existing rol,
-- preventing any user (including admins) from changing their own role.
create policy "usuarios: actualizar propio perfil"
  on public.usuarios for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    AND rol = (SELECT rol FROM public.usuarios WHERE id = auth.uid())
  );
