-- Fix: recreate cities SELECT policy as PERMISSIVE (default)
DROP POLICY IF EXISTS "Anyone can view active cities" ON public.cities;

CREATE POLICY "Anyone can view active cities"
ON public.cities
FOR SELECT
USING (is_active = true);