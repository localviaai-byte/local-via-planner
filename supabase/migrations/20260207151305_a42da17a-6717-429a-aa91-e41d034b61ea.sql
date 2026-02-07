-- Create table to track discovery jobs
CREATE TABLE public.discovery_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0,
  options JSONB,
  result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discovery_jobs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read and create jobs
CREATE POLICY "Authenticated users can view discovery jobs"
ON public.discovery_jobs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create discovery jobs"
ON public.discovery_jobs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow updates (for edge function via service role)
CREATE POLICY "Allow updates on discovery jobs"
ON public.discovery_jobs FOR UPDATE
USING (true);