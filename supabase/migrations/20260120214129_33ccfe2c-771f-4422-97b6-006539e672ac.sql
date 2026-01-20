-- Create table for storing discovered place suggestions
CREATE TABLE public.place_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  place_type TEXT NOT NULL,
  address TEXT,
  zone TEXT,
  description TEXT,
  why_people_go TEXT[],
  best_times TEXT[],
  confidence NUMERIC NOT NULL DEFAULT 0.5,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_place_id UUID REFERENCES public.places(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.place_suggestions ENABLE ROW LEVEL SECURITY;

-- Admin can do everything (for now, simple policy)
CREATE POLICY "Authenticated users can manage suggestions"
ON public.place_suggestions
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Index for fast city lookups
CREATE INDEX idx_place_suggestions_city_status ON public.place_suggestions(city_id, status);