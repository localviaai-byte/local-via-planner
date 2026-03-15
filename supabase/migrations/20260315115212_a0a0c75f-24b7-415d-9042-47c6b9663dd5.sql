
-- Convert food_primary from text to text[]
ALTER TABLE public.places 
  ALTER COLUMN food_primary TYPE text[] 
  USING CASE WHEN food_primary IS NULL THEN NULL ELSE ARRAY[food_primary] END;

-- Convert format_experience from text to text[]
ALTER TABLE public.places 
  ALTER COLUMN format_experience TYPE text[] 
  USING CASE WHEN format_experience IS NULL THEN NULL ELSE ARRAY[format_experience] END;

-- Add "Chi siamo" fields
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS about_us text;
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS contact_website text;
