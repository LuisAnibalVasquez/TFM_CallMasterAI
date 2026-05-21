-- Create 'template' storage bucket for downloadable CSV template
-- The bucket is public-read so tenants can download the sample template without auth
INSERT INTO storage.buckets (id, name, public)
VALUES ('template', 'template', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to template bucket
CREATE POLICY "Public read access for template bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'template');

-- Insert a sample template.csv file row into the storage
-- The actual file content should be uploaded via the Supabase dashboard or API
-- Template content:
-- Customer Name,Phone Number,Age,Preferred Language
-- John Doe,+14155552671,30,English
