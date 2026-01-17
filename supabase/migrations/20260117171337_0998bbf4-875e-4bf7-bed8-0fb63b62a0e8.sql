-- Create storage bucket for site images (hero, about, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access for site images
CREATE POLICY "Site images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-images');

-- Allow authenticated admins to upload site images
CREATE POLICY "Admins can upload site images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-images' 
  AND auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow authenticated admins to update site images
CREATE POLICY "Admins can update site images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-images' 
  AND auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow authenticated admins to delete site images
CREATE POLICY "Admins can delete site images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-images' 
  AND auth.uid() IS NOT NULL
  AND public.has_role(auth.uid(), 'admin')
);