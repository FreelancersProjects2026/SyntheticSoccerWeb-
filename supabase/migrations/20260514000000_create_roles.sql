-- Lookup table for user roles (cliente, administrador).
-- smallint PK: only 2 rows, no need for bigint/uuid.

create table public.roles (
  id   smallint primary key generated always as identity,
  name text     not null unique
);

insert into public.roles (name) values
  ('cliente'),
  ('administrador');

-- RLS: everyone can read roles, nobody can mutate via client.
alter table public.roles enable row level security;

create policy "roles_select" on public.roles
  for select using (true);
