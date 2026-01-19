-- Add section visibility settings
INSERT INTO public.site_settings (key, value)
VALUES ('sections', '{
  "hero": true,
  "about": true,
  "gallery": true,
  "packages": true,
  "testimonials": true,
  "contact": true
}'::jsonb)
ON CONFLICT (key) DO NOTHING;