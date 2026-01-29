-- Add admin role to cascone1994@gmail.com (user_id from auth logs)
INSERT INTO public.user_roles (user_id, role) 
VALUES ('5a48365b-76dc-46ea-811e-5b9dff033bc2', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;