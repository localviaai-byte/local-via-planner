-- Allow affiliate partners to manage media of their linked place
CREATE POLICY "Partners can manage media of their linked place"
ON public.place_media
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.partners p
    WHERE p.user_id = auth.uid()
      AND p.linked_place_id = place_media.place_id
      AND p.partner_type = 'affiliate'
      AND p.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.partners p
    WHERE p.user_id = auth.uid()
      AND p.linked_place_id = place_media.place_id
      AND p.partner_type = 'affiliate'
      AND p.status = 'active'
  )
);

-- Allow affiliate partners to update their linked place's description
CREATE POLICY "Partners can update linked place description"
ON public.places
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.partners p
    WHERE p.user_id = auth.uid()
      AND p.linked_place_id = places.id
      AND p.partner_type = 'affiliate'
      AND p.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.partners p
    WHERE p.user_id = auth.uid()
      AND p.linked_place_id = places.id
      AND p.partner_type = 'affiliate'
      AND p.status = 'active'
  )
);