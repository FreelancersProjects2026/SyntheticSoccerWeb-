-- Tabla de perfiles de usuario vinculada a auth.users
create table public.usuarios (
  id        uuid primary key references auth.users (id) on delete cascade,
  nombre    text not null,
  telefono  text not null,
  rol       text not null default 'user' check (rol in ('admin', 'user')),
  created_at timestamptz default now()
);

-- RLS
alter table public.usuarios enable row level security;

create policy "usuarios: leer propio perfil"
  on public.usuarios for select
  using (auth.uid() = id);

create policy "usuarios: actualizar propio perfil"
  on public.usuarios for update
  using (auth.uid() = id);

create policy "usuarios: insertar propio perfil"
  on public.usuarios for insert
  with check (auth.uid() = id);

-- Trigger: crea el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.usuarios (id, nombre, telefono, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    coalesce(new.raw_user_meta_data->>'telefono', ''),
    'user'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
