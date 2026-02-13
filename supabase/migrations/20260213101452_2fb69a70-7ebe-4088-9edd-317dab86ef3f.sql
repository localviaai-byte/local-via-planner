ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS dietary_options text[] DEFAULT '{}'::text[];