-- =============================================
-- CITY EVOLUTION: Add city-level data labeling
-- =============================================

-- City tags enum
CREATE TYPE public.city_tag AS ENUM (
  'archeology', 'sea', 'nightlife', 'food', 'romantic', 'chaotic', 'slow', 'art', 'nature', 'shopping'
);

-- City walkability enum
CREATE TYPE public.city_walkability AS ENUM ('yes', 'no', 'depends');

-- City rhythm enum  
CREATE TYPE public.city_rhythm AS ENUM ('very_slow', 'medium', 'intense');

-- Best time of day enum
CREATE TYPE public.best_time_of_day AS ENUM ('morning', 'afternoon', 'evening', 'night');

-- City status enum
CREATE TYPE public.city_status AS ENUM ('empty', 'building', 'active');

-- Add new columns to cities
ALTER TABLE public.cities
ADD COLUMN IF NOT EXISTS status city_status DEFAULT 'empty',
ADD COLUMN IF NOT EXISTS tags city_tag[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS walkable city_walkability,
ADD COLUMN IF NOT EXISTS rhythm city_rhythm,
ADD COLUMN IF NOT EXISTS best_times best_time_of_day[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tourist_errors text,
ADD COLUMN IF NOT EXISTS local_warning text;

-- =============================================
-- CITY ZONES: Neighborhoods/Areas within cities
-- =============================================

CREATE TABLE public.city_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  name text NOT NULL,
  vibe text[], -- local, tourist, nightlife, residential, etc.
  why_go text,
  when_to_go text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on city_zones
ALTER TABLE public.city_zones ENABLE ROW LEVEL SECURITY;

-- RLS policies for city_zones
CREATE POLICY "Anyone can view zones of active cities"
ON public.city_zones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cities c 
    WHERE c.id = city_zones.city_id AND c.is_active = true
  )
);

CREATE POLICY "Admins and editors can manage zones"
ON public.city_zones FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor')
);

-- =============================================
-- PLACE TYPE EVOLUTION: Add new types
-- =============================================

-- Add new place types to enum (if not exist)
ALTER TYPE public.place_type ADD VALUE IF NOT EXISTS 'club';
ALTER TYPE public.place_type ADD VALUE IF NOT EXISTS 'experience';
ALTER TYPE public.place_type ADD VALUE IF NOT EXISTS 'view';
ALTER TYPE public.place_type ADD VALUE IF NOT EXISTS 'zone';

-- =============================================
-- PLACE-SPECIFIC FIELDS: Type-based extensions
-- =============================================

-- General fields for all
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS zone_id uuid REFERENCES public.city_zones(id),
ADD COLUMN IF NOT EXISTS duration_minutes integer,
ADD COLUMN IF NOT EXISTS indoor_outdoor text CHECK (indoor_outdoor IN ('indoor', 'outdoor', 'both')),
ADD COLUMN IF NOT EXISTS crowd_level text CHECK (crowd_level IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS pace text CHECK (pace IN ('slow', 'fast', 'flexible'));

-- Restaurant-specific
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS cuisine_type text,
ADD COLUMN IF NOT EXISTS price_range text CHECK (price_range IN ('budget', 'moderate', 'expensive', 'luxury')),
ADD COLUMN IF NOT EXISTS meal_time text CHECK (meal_time IN ('lunch', 'dinner', 'both')),
ADD COLUMN IF NOT EXISTS shared_tables boolean DEFAULT false;

-- Bar-specific
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS bar_time text CHECK (bar_time IN ('aperitivo', 'after_dinner', 'both')),
ADD COLUMN IF NOT EXISTS standing_ok boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS drink_focus text CHECK (drink_focus IN ('wine', 'cocktails', 'beer', 'mixed'));

-- Club-specific
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS real_start_time text,
ADD COLUMN IF NOT EXISTS dress_code text,
ADD COLUMN IF NOT EXISTS pre_or_post text CHECK (pre_or_post IN ('pre', 'post', 'both'));

-- Experience-specific
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS needs_booking boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_repeatable boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS works_solo boolean DEFAULT true;

-- View/Panorama-specific
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS best_light_time text,
ADD COLUMN IF NOT EXISTS worth_detour boolean DEFAULT true;

-- Zone-specific (when place_type = 'zone')
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS time_to_spend text,
ADD COLUMN IF NOT EXISTS best_period text CHECK (best_period IN ('day', 'evening', 'night', 'anytime'));

-- =============================================
-- UPDATE CITY STATUS FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION public.update_city_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  place_count integer;
BEGIN
  SELECT COUNT(*) INTO place_count 
  FROM public.places 
  WHERE city_id = COALESCE(NEW.city_id, OLD.city_id) 
    AND status = 'approved';
  
  UPDATE public.cities 
  SET status = CASE 
    WHEN place_count = 0 THEN 'empty'::city_status
    WHEN place_count < 10 THEN 'building'::city_status
    ELSE 'active'::city_status
  END
  WHERE id = COALESCE(NEW.city_id, OLD.city_id);
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-update city status
CREATE TRIGGER update_city_status_on_place_change
AFTER INSERT OR UPDATE OR DELETE ON public.places
FOR EACH ROW
EXECUTE FUNCTION public.update_city_status();