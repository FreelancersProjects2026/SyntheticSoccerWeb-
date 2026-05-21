-- Add payment proof URL to reservations
ALTER TABLE reservas ADD COLUMN comprobante_url TEXT;

-- Storage bucket for payment proof uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes', 'comprobantes', true)
ON CONFLICT (id) DO NOTHING;
