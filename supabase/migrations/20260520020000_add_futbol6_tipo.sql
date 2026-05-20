ALTER TABLE public.canchas
  DROP CONSTRAINT canchas_tipo_check,
  ADD CONSTRAINT canchas_tipo_check CHECK (tipo IN ('futbol5', 'futbol6', 'futbol7', 'futbol11'));
