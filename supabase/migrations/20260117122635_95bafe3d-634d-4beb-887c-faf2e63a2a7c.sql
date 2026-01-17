-- Add admin role for the first user
-- You'll need to replace USER_ID with the actual user ID after signup
-- Or run this after the first user signs up:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'admin@weddingphoto.com'
ON CONFLICT DO NOTHING;