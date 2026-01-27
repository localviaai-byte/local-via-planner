INSERT INTO public.user_roles (user_id, role)
VALUES ('bd128d45-b485-42ed-967f-2e7c16a9b09b', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;