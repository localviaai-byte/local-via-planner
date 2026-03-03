-- Add announcements column to partners
ALTER TABLE public.partners ADD COLUMN announcements jsonb DEFAULT '[]'::jsonb;

-- Allow affiliate partners to manage opening hours of their linked place
CREATE POLICY "Partners can manage opening hours of their linked place"
ON public.place_opening_hours
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM partners p
    WHERE p.user_id = auth.uid()
      AND p.linked_place_id = place_opening_hours.place_id
      AND p.partner_type = 'affiliate'
      AND p.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM partners p
    WHERE p.user_id = auth.uid()
      AND p.linked_place_id = place_opening_hours.place_id
      AND p.partner_type = 'affiliate'
      AND p.status = 'active'
  )
);