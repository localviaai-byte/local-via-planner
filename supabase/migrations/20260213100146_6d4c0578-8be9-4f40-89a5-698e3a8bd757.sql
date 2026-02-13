
-- Add structured food dimensions to places table
ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS food_primary text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS food_secondary text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS format_experience text DEFAULT NULL;

-- Backfill: map existing cuisine_type to food_primary where possible
-- (keeping cuisine_type for backward compatibility but new fields take priority)
