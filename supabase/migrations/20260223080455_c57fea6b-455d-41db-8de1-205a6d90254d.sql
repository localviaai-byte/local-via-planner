-- Allow anonymous users to view approved places (needed for public wizard)
CREATE POLICY "Anyone can view approved places"
ON public.places
FOR SELECT
USING (status = 'approved'::place_status);