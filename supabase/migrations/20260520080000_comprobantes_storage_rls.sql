-- Allow authenticated users to upload comprobantes
CREATE POLICY "Authenticated users can upload comprobantes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'comprobantes');

-- Allow authenticated users to read comprobantes (admin + owner)
CREATE POLICY "Authenticated users can read comprobantes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'comprobantes');
