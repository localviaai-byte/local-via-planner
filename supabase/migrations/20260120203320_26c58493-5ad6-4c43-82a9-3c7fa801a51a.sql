INSERT INTO public.user_roles (user_id, role) 
VALUES ('4a23cef5-9e5a-4de0-8293-95970b0d3151', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;