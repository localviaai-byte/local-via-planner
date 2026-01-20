-- =====================================================
-- LOCALVIA DATA LABELING BACKEND
-- =====================================================

-- 1. ROLES SYSTEM
-- =====================================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'local_contributor', 'editor');

-- Create place type enum
CREATE TYPE public.place_type AS ENUM ('attraction', 'bar', 'restaurant', 'club', 'zone', 'experience');

-- Create place status enum  
CREATE TYPE public.place_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'archived');

-- Create target audience enum
CREATE TYPE public.target_audience AS ENUM ('locals', 'tourists', 'mixed', 'students', 'couples');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_city_id UUID, -- Local contributors can be assigned to specific cities
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Security definer function for role checking (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = _user_id 
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'editor' THEN 2 
      WHEN 'local_contributor' THEN 3 
    END
  LIMIT 1
$$;

-- 2. CITIES TABLE
-- =====================================================

CREATE TABLE public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region TEXT,
    country TEXT NOT NULL DEFAULT 'Italia',
    slug TEXT UNIQUE NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    cover_image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Add city reference to user_roles
ALTER TABLE public.user_roles 
ADD CONSTRAINT fk_assigned_city 
FOREIGN KEY (assigned_city_id) REFERENCES public.cities(id) ON DELETE SET NULL;

-- 3. PLACES TABLE (CORE)
-- =====================================================

CREATE TABLE public.places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    
    -- STEP 0: Context
    place_type place_type NOT NULL,
    
    -- STEP 1: Identity
    name TEXT NOT NULL,
    address TEXT,
    zone TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    photo_url TEXT,
    google_place_id TEXT,
    
    -- STEP 2: Why people go (intent-based)
    why_people_go TEXT[] DEFAULT '{}',
    -- Values: fun, meet_people, bring_someone, relax, eat_drink_well, something_different, other
    why_other TEXT, -- If "other" is selected
    
    -- STEP 3: Social & Flirt
    social_level INTEGER CHECK (social_level >= 1 AND social_level <= 5),
    solo_friendly BOOLEAN DEFAULT false,
    flirt_friendly BOOLEAN DEFAULT false,
    group_friendly BOOLEAN DEFAULT false,
    target_audience target_audience,
    
    -- STEP 4: Vibe (1-5 scales)
    vibe_calm_to_energetic INTEGER CHECK (vibe_calm_to_energetic >= 1 AND vibe_calm_to_energetic <= 5),
    vibe_quiet_to_loud INTEGER CHECK (vibe_quiet_to_loud >= 1 AND vibe_quiet_to_loud <= 5),
    vibe_empty_to_crowded INTEGER CHECK (vibe_empty_to_crowded >= 1 AND vibe_empty_to_crowded <= 5),
    vibe_touristy_to_local INTEGER CHECK (vibe_touristy_to_local >= 1 AND vibe_touristy_to_local <= 5),
    
    -- STEP 5: Timing
    best_days TEXT[] DEFAULT '{}', -- mon, tue, wed, thu, fri, sat, sun
    best_times TEXT[] DEFAULT '{}', -- morning, lunch, aperitivo, dinner, night, late_night
    periods_to_avoid TEXT,
    
    -- STEP 6: Local secrets
    local_warning TEXT,
    
    -- STEP 7: Local one-liner (REQUIRED - DNA of the place)
    local_one_liner TEXT, -- Max 140 chars, the key field
    
    -- Metadata
    status place_status NOT NULL DEFAULT 'draft',
    quality_score INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Review tracking
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT
);

-- 4. PLACE VERSIONS (for review/diff)
-- =====================================================

CREATE TABLE public.place_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    data JSONB NOT NULL, -- Snapshot of the place at this version
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    change_summary TEXT
);

-- 5. REVIEW FLAGS
-- =====================================================

CREATE TABLE public.place_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    flag_type TEXT NOT NULL, -- too_touristy, unclear, duplicate, needs_rewrite
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id)
);

-- 6. QUALITY SCORE FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_quality_score(place_row public.places)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- +1 if local_warning present
    IF place_row.local_warning IS NOT NULL AND place_row.local_warning != '' THEN
        score := score + 1;
    END IF;
    
    -- +1 if best_times filled
    IF array_length(place_row.best_times, 1) > 0 THEN
        score := score + 1;
    END IF;
    
    -- +1 if best_days filled
    IF array_length(place_row.best_days, 1) > 0 THEN
        score := score + 1;
    END IF;
    
    -- +1 if all vibe fields filled
    IF place_row.vibe_calm_to_energetic IS NOT NULL 
       AND place_row.vibe_quiet_to_loud IS NOT NULL 
       AND place_row.vibe_empty_to_crowded IS NOT NULL 
       AND place_row.vibe_touristy_to_local IS NOT NULL THEN
        score := score + 1;
    END IF;
    
    -- +1 if social fields filled
    IF place_row.social_level IS NOT NULL 
       AND place_row.target_audience IS NOT NULL THEN
        score := score + 1;
    END IF;
    
    -- +1 if photo present
    IF place_row.photo_url IS NOT NULL AND place_row.photo_url != '' THEN
        score := score + 1;
    END IF;
    
    RETURN score;
END;
$$;

-- Trigger to auto-update quality score
CREATE OR REPLACE FUNCTION public.update_place_quality_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.quality_score := calculate_quality_score(NEW);
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_place_quality
BEFORE INSERT OR UPDATE ON public.places
FOR EACH ROW
EXECUTE FUNCTION public.update_place_quality_score();

-- 7. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_flags ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Cities policies
CREATE POLICY "Anyone can view active cities"
ON public.cities FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage cities"
ON public.cities FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Places policies
CREATE POLICY "Contributors can view their own places"
ON public.places FOR SELECT
TO authenticated
USING (
    created_by = auth.uid() 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'editor')
);

CREATE POLICY "Contributors can insert places"
ON public.places FOR INSERT
TO authenticated
WITH CHECK (
    created_by = auth.uid() 
    AND (
        public.has_role(auth.uid(), 'local_contributor') 
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'editor')
    )
);

CREATE POLICY "Contributors can update their draft places"
ON public.places FOR UPDATE
TO authenticated
USING (
    (created_by = auth.uid() AND status = 'draft')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'editor')
);

CREATE POLICY "Only admins can delete places"
ON public.places FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Place versions policies
CREATE POLICY "Users can view versions of places they can see"
ON public.place_versions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.places p 
        WHERE p.id = place_id 
        AND (
            p.created_by = auth.uid() 
            OR public.has_role(auth.uid(), 'admin') 
            OR public.has_role(auth.uid(), 'editor')
        )
    )
);

CREATE POLICY "System can create versions"
ON public.place_versions FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Place flags policies
CREATE POLICY "Editors and admins can view flags"
ON public.place_flags FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'editor')
);

CREATE POLICY "Editors and admins can create flags"
ON public.place_flags FOR INSERT
TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'editor')
);

CREATE POLICY "Editors and admins can update flags"
ON public.place_flags FOR UPDATE
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'editor')
);

-- 8. INDEXES
-- =====================================================

CREATE INDEX idx_places_city ON public.places(city_id);
CREATE INDEX idx_places_status ON public.places(status);
CREATE INDEX idx_places_created_by ON public.places(created_by);
CREATE INDEX idx_places_type ON public.places(place_type);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_place_versions_place ON public.place_versions(place_id);
CREATE INDEX idx_place_flags_place ON public.place_flags(place_id);