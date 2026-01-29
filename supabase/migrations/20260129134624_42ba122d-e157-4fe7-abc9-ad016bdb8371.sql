-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Contributors can view relevant places" ON public.places;

-- Create a new policy that allows contributors to view ALL places in their city
CREATE POLICY "Contributors can view relevant places" 
ON public.places 
FOR SELECT 
USING (
  -- User created the place
  (created_by = auth.uid()) 
  OR 
  -- User is admin or editor
  has_role(auth.uid(), 'admin'::app_role) 
  OR 
  has_role(auth.uid(), 'editor'::app_role)
  OR
  -- User is a contributor and the place is in their assigned city (any status)
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'local_contributor'
    AND ur.assigned_city_id = places.city_id
  )
);