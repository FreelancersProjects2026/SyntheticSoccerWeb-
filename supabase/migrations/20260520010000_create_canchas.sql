-- canchas table
CREATE TABLE public.canchas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('futbol5', 'futbol7', 'futbol11')),
  slots_por_dia integer NOT NULL CHECK (slots_por_dia > 0),
  precio_por_slot numeric(10, 2) NOT NULL CHECK (precio_por_slot >= 0),
  estado text NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'inactiva')),
  descripcion text,
  imagen_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.canchas ENABLE ROW LEVEL SECURITY;

-- SELECT: authenticated users only
CREATE POLICY "Authenticated users can view canchas"
  ON public.canchas
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: admins only
CREATE POLICY "Admins can insert canchas"
  ON public.canchas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- UPDATE: admins only
CREATE POLICY "Admins can update canchas"
  ON public.canchas
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('canchas-images', 'canchas-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage: admins can upload
CREATE POLICY "Admins can upload cancha images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'canchas-images'
    AND EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Storage: admins can update
CREATE POLICY "Admins can update cancha images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'canchas-images'
    AND EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Storage: public read
CREATE POLICY "Public can view cancha images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'canchas-images');
