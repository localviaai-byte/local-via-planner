-- Add TripAdvisor enrichment columns to places table
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS tripadvisor_id TEXT,
ADD COLUMN IF NOT EXISTS tripadvisor_ranking INTEGER,
ADD COLUMN IF NOT EXISTS tripadvisor_ranking_category TEXT,
ADD COLUMN IF NOT EXISTS tripadvisor_rating NUMERIC(2,1),
ADD COLUMN IF NOT EXISTS tripadvisor_reviews_count INTEGER,
ADD COLUMN IF NOT EXISTS tripadvisor_price_level TEXT,
ADD COLUMN IF NOT EXISTS tripadvisor_url TEXT,
ADD COLUMN IF NOT EXISTS tripadvisor_image_url TEXT,
ADD COLUMN IF NOT EXISTS tripadvisor_enriched_at TIMESTAMP WITH TIME ZONE;

-- Create index for TripAdvisor ID lookups
CREATE INDEX IF NOT EXISTS idx_places_tripadvisor_id ON public.places(tripadvisor_id) WHERE tripadvisor_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.places.tripadvisor_id IS 'TripAdvisor location ID';
COMMENT ON COLUMN public.places.tripadvisor_ranking IS 'Ranking position (e.g., #12 of 150 restaurants)';
COMMENT ON COLUMN public.places.tripadvisor_ranking_category IS 'Category for ranking (e.g., restaurants in Pompei)';
COMMENT ON COLUMN public.places.tripadvisor_rating IS 'TripAdvisor rating (0.0-5.0)';
COMMENT ON COLUMN public.places.tripadvisor_reviews_count IS 'Number of TripAdvisor reviews';
COMMENT ON COLUMN public.places.tripadvisor_price_level IS 'Price level (€, €€, €€€, €€€€)';
COMMENT ON COLUMN public.places.tripadvisor_url IS 'Direct link to TripAdvisor page';
COMMENT ON COLUMN public.places.tripadvisor_image_url IS 'Main image from TripAdvisor';
COMMENT ON COLUMN public.places.tripadvisor_enriched_at IS 'When TripAdvisor data was last fetched';