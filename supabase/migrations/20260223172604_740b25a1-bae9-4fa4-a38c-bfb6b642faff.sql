-- Drop the restrictive policy and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view approved places" ON public.places;

CREATE POLICY "Anyone can view approved places"
ON public.places
FOR SELECT
USING (status = 'approved'::place_status);

-- Also make the contributors view policy permissive (it's currently restrictive too)
DROP POLICY IF EXISTS "Contributors can view relevant places" ON public.places;

CREATE POLICY "Contributors can view relevant places"
ON public.places
FOR SELECT
USING (
  (created_by = auth.uid()) 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'editor'::app_role) 
  OR (EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
      AND ur.role = 'local_contributor'::app_role 
      AND ur.assigned_city_id = places.city_id
  ))
);