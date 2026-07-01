-- Seed local (supabase db reset). No corre contra remoto.
-- Usuario admin de prueba: admin@local.test / admin1234

-- confirmation_token/recovery_token/email_change_token_new/email_change deben ser
-- '' y no NULL, GoTrue hace scan a string y NULL rompe el login ("converting NULL to string").
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@local.test',
  crypt('admin1234', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"nombre":"Admin Local","telefono":"0000000000"}',
  now(),
  now(),
  '', '', '', ''
);

update public.usuarios set rol = 'admin'
where id = (select id from auth.users where email = 'admin@local.test');
