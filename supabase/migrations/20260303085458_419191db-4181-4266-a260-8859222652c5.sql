
-- Create storage bucket for partner place photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('place-photos', 'place-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload place photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'place-photos');

-- Allow anyone to view place photos (public bucket)
CREATE POLICY "Anyone can view place photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-photos');

-- Allow users to delete their own uploaded photos
CREATE POLICY "Users can delete their own place photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'place-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
