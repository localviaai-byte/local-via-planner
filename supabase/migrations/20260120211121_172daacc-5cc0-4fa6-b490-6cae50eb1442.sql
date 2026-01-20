-- =========================================
-- LOCALVIA SCHEMA UPGRADE - COMPLETE
-- =========================================

-- =========================================
-- 0) NEW ENUMS
-- =========================================

CREATE TYPE vibe_label AS ENUM (
  'easy',
  'energetic',
  'romantic',
  'chaotic',
  'chic',
  'underground',
  'authentic'
);

CREATE TYPE why_go AS ENUM (
  'have_fun',
  'socialize',
  'date_spot',
  'eat_drink_well',
  'relax',
  'do_something_different',
  'culture',
  'scenic'
);

CREATE TYPE ideal_for AS ENUM (
  'couple',
  'friends',
  'solo_traveler',
  'family',
  'first_time',
  'meet_people',
  'chill',
  'party',
  'flirt_friendly'
);

CREATE TYPE time_bucket AS ENUM (
  'morning',
  'lunch',
  'afternoon',
  'aperitivo',
  'dinner',
  'evening',
  'night'
);

CREATE TYPE crowd_type AS ENUM ('low', 'medium', 'high', 'variable');
CREATE TYPE price_level AS ENUM ('budget', 'moderate', 'expensive', 'luxury');
CREATE TYPE yes_no_maybe AS ENUM ('yes', 'no', 'depends');
CREATE TYPE gender_balance AS ENUM ('balanced', 'more_men', 'more_women', 'unknown');
CREATE TYPE suggested_stay AS ENUM ('short', 'medium', 'long');
CREATE TYPE review_decision AS ENUM ('approve', 'reject', 'request_changes');

-- =========================================
-- 1) ENHANCE city_zones WITH NEW FIELDS
-- =========================================

ALTER TABLE city_zones 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS vibe_primary vibe_label,
  ADD COLUMN IF NOT EXISTS vibe_secondary vibe_label,
  ADD COLUMN IF NOT EXISTS best_time time_bucket,
  ADD COLUMN IF NOT EXISTS touristy_score SMALLINT,
  ADD COLUMN IF NOT EXISTS safety_note TEXT,
  ADD COLUMN IF NOT EXISTS local_tip TEXT,
  ADD COLUMN IF NOT EXISTS status place_status NOT NULL DEFAULT 'draft';

-- Add check constraint separately to avoid issues
ALTER TABLE city_zones 
  ADD CONSTRAINT city_zones_touristy_score_check 
  CHECK (touristy_score IS NULL OR (touristy_score BETWEEN 1 AND 5));

-- =========================================
-- 2) ENHANCE places WITH NEW CORE FIELDS
-- =========================================

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS mood_primary vibe_label,
  ADD COLUMN IF NOT EXISTS mood_secondary vibe_label,
  ADD COLUMN IF NOT EXISTS gender_balance gender_balance DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS tourist_trap BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS overrated BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS local_secret BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS physical_effort SMALLINT,
  ADD COLUMN IF NOT EXISTS mental_effort SMALLINT,
  ADD COLUMN IF NOT EXISTS suggested_stay suggested_stay,
  ADD COLUMN IF NOT EXISTS dead_times_note TEXT,
  ADD COLUMN IF NOT EXISTS ideal_for ideal_for[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes_internal TEXT,
  ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Add check constraints separately
ALTER TABLE places 
  ADD CONSTRAINT places_physical_effort_check 
  CHECK (physical_effort IS NULL OR (physical_effort BETWEEN 1 AND 5));

ALTER TABLE places 
  ADD CONSTRAINT places_mental_effort_check 
  CHECK (mental_effort IS NULL OR (mental_effort BETWEEN 1 AND 5));

-- =========================================
-- 3) TAGS SYSTEM
-- =========================================

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_group TEXT NOT NULL,
  tag_key TEXT NOT NULL,
  label_it TEXT NOT NULL,
  label_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tag_group, tag_key)
);

CREATE TABLE IF NOT EXISTS place_tags (
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  weight SMALLINT CHECK (weight BETWEEN 1 AND 5) DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (place_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_place_tags_tag ON place_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_group ON tags(tag_group);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON tags FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view place tags" ON place_tags FOR SELECT USING (true);
CREATE POLICY "Contributors can manage their place tags" ON place_tags FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM places p 
      WHERE p.id = place_tags.place_id 
      AND (p.created_by = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))
    )
  );

-- =========================================
-- 4) PLACE OPENING HOURS
-- =========================================

CREATE TABLE IF NOT EXISTS place_opening_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opening_place ON place_opening_hours(place_id);

ALTER TABLE place_opening_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view opening hours" ON place_opening_hours FOR SELECT USING (true);
CREATE POLICY "Contributors can manage opening hours" ON place_opening_hours FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM places p 
      WHERE p.id = place_opening_hours.place_id 
      AND (p.created_by = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))
    )
  );

-- =========================================
-- 5) PLACE MEDIA (multiple photos)
-- =========================================

CREATE TABLE IF NOT EXISTS place_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  caption TEXT,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_place_media_place ON place_media(place_id);

ALTER TABLE place_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view media" ON place_media FOR SELECT USING (true);
CREATE POLICY "Contributors can manage their media" ON place_media FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM places p 
      WHERE p.id = place_media.place_id 
      AND (p.created_by = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'))
    )
  );

-- =========================================
-- 6) PLACE REVIEWS (editorial workflow)
-- =========================================

CREATE TABLE IF NOT EXISTS place_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  editor_id UUID NOT NULL,
  decision review_decision NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_place ON place_reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_editor ON place_reviews(editor_id);

ALTER TABLE place_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors can view reviews" ON place_reviews FOR SELECT 
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));
CREATE POLICY "Editors can create reviews" ON place_reviews FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- =========================================
-- 7) SEED DEFAULT TAGS
-- =========================================

INSERT INTO tags (tag_group, tag_key, label_it, label_en) VALUES
  ('interest', 'archaeology', 'Archeologia', 'Archaeology'),
  ('interest', 'history', 'Storia', 'History'),
  ('interest', 'architecture', 'Architettura', 'Architecture'),
  ('interest', 'art', 'Arte', 'Art'),
  ('interest', 'museums', 'Musei', 'Museums'),
  ('interest', 'views', 'Panorami', 'Views'),
  ('interest', 'nature', 'Natura', 'Nature'),
  ('interest', 'photospots', 'Spot foto', 'Photo spots'),
  ('interest', 'local_life', 'Vita locale', 'Local life'),
  ('interest', 'shopping', 'Shopping', 'Shopping'),
  ('interest', 'religious', 'Luoghi religiosi', 'Religious'),
  ('interest', 'markets', 'Mercati', 'Markets'),
  ('interest', 'hidden_gems', 'Posti nascosti', 'Hidden gems'),
  ('experience_style', 'slow', 'Slow', 'Slow'),
  ('experience_style', 'fast_paced', 'Intenso', 'Fast paced'),
  ('experience_style', 'walk_heavy', 'Molte camminate', 'Walk heavy'),
  ('experience_style', 'low_walk', 'Pochi spostamenti', 'Low walk'),
  ('experience_style', 'guided', 'Con guida', 'Guided'),
  ('experience_style', 'self_guided', 'Autonomo', 'Self guided'),
  ('experience_style', 'hands_on', 'Esperienziale', 'Hands on'),
  ('experience_style', 'educational', 'Didattico', 'Educational'),
  ('experience_style', 'instagrammable', 'Instagrammabile', 'Instagrammable'),
  ('experience_style', 'rain_ok', 'Ok con pioggia', 'Rain OK'),
  ('experience_style', 'sunset_best', 'Top al tramonto', 'Best at sunset'),
  ('experience_style', 'night_best', 'Top di notte', 'Best at night'),
  ('social_scene', 'meet_people_easy', 'Facile conoscere gente', 'Easy to meet people'),
  ('social_scene', 'conversation_friendly', 'Si parla tanto', 'Conversation friendly'),
  ('social_scene', 'flirt_friendly', 'Vibe flirt', 'Flirt friendly'),
  ('social_scene', 'solo_ok', 'Ok da solo', 'Solo OK'),
  ('social_scene', 'group_ok', 'Ok in gruppo', 'Group OK'),
  ('social_scene', 'date_spot', 'Perfetto per appuntamento', 'Date spot'),
  ('social_scene', 'tourist_heavy', 'Molti turisti', 'Tourist heavy'),
  ('social_scene', 'local_heavy', 'Molti locals', 'Local heavy'),
  ('social_scene', 'student_scene', 'Scena studenti', 'Student scene'),
  ('social_scene', 'expat_scene', 'Scena expat', 'Expat scene'),
  ('nightlife', 'aperitivo', 'Aperitivo', 'Aperitivo'),
  ('nightlife', 'cocktail_bar', 'Cocktail', 'Cocktails'),
  ('nightlife', 'wine_bar', 'Vino', 'Wine'),
  ('nightlife', 'beer_pub', 'Birra / pub', 'Beer / pub'),
  ('nightlife', 'live_music', 'Musica live', 'Live music'),
  ('nightlife', 'dj_set', 'DJ set', 'DJ set'),
  ('nightlife', 'dancing', 'Si balla', 'Dancing'),
  ('nightlife', 'late_night', 'Tardi', 'Late night'),
  ('nightlife', 'dressy', 'Dressy', 'Dressy'),
  ('nightlife', 'underground', 'Underground', 'Underground'),
  ('food', 'traditional', 'Tradizionale', 'Traditional'),
  ('food', 'street_food', 'Street food', 'Street food'),
  ('food', 'pizza', 'Pizza', 'Pizza'),
  ('food', 'seafood', 'Mare', 'Seafood'),
  ('food', 'meat', 'Carne', 'Meat'),
  ('food', 'vegetarian', 'Vegetariano', 'Vegetarian'),
  ('food', 'vegan', 'Vegano', 'Vegan'),
  ('food', 'gluten_free', 'Senza glutine', 'Gluten free'),
  ('food', 'dessert', 'Dolci', 'Dessert'),
  ('food', 'coffee', 'Caffè', 'Coffee'),
  ('food', 'tasting_menu', 'Degustazione', 'Tasting menu'),
  ('food', 'budget_eats', 'Economico', 'Budget eats'),
  ('food', 'special_occasion', 'Occasione speciale', 'Special occasion'),
  ('logistics', 'reservation_needed', 'Prenotazione consigliata', 'Reservation needed'),
  ('logistics', 'queue_likely', 'Fila probabile', 'Queue likely'),
  ('logistics', 'kid_friendly', 'Bimbi ok', 'Kid friendly'),
  ('logistics', 'stroller_ok', 'Passeggino ok', 'Stroller OK'),
  ('logistics', 'wheelchair_ok', 'Accessibile', 'Wheelchair OK'),
  ('logistics', 'stairs', 'Molte scale', 'Many stairs'),
  ('logistics', 'steep', 'Salite', 'Steep'),
  ('logistics', 'parking_easy', 'Parcheggio ok', 'Easy parking'),
  ('logistics', 'public_transport_easy', 'Mezzi comodi', 'Easy public transport'),
  ('logistics', 'cash_only', 'Solo contanti', 'Cash only'),
  ('logistics', 'card_ok', 'Carta ok', 'Card OK'),
  ('crowd_risk', 'avoid_weekends', 'Evita weekend', 'Avoid weekends'),
  ('crowd_risk', 'avoid_peak_hours', 'Evita ore di punta', 'Avoid peak hours'),
  ('crowd_risk', 'tourist_trap_risk', 'Rischio trappola turistica', 'Tourist trap risk'),
  ('crowd_risk', 'overrated_risk', 'Sopravvalutato', 'Overrated risk'),
  ('crowd_risk', 'hidden_gem', 'Gemma locale', 'Hidden gem'),
  ('seasonality', 'summer_best', 'Meglio in estate', 'Best in summer'),
  ('seasonality', 'winter_ok', 'Ok in inverno', 'Winter OK'),
  ('seasonality', 'spring_best', 'Meglio in primavera', 'Best in spring'),
  ('seasonality', 'rainy_season_ok', 'Ok con pioggia', 'Rainy season OK')
ON CONFLICT (tag_group, tag_key) DO NOTHING;

-- =========================================
-- 8) FULL-TEXT SEARCH
-- =========================================

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS search_tsv tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(name,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(address,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(local_one_liner,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(local_warning,'')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_places_search ON places USING GIN (search_tsv);

-- =========================================
-- 9) UPDATE QUALITY SCORE FUNCTION
-- =========================================

CREATE OR REPLACE FUNCTION public.calculate_quality_score(place_row places)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    IF place_row.local_warning IS NOT NULL AND place_row.local_warning != '' THEN
        score := score + 1;
    END IF;
    
    IF array_length(place_row.best_times, 1) > 0 THEN
        score := score + 1;
    END IF;
    
    IF array_length(place_row.best_days, 1) > 0 THEN
        score := score + 1;
    END IF;
    
    IF place_row.vibe_calm_to_energetic IS NOT NULL 
       AND place_row.vibe_quiet_to_loud IS NOT NULL 
       AND place_row.vibe_empty_to_crowded IS NOT NULL 
       AND place_row.vibe_touristy_to_local IS NOT NULL THEN
        score := score + 1;
    END IF;
    
    IF place_row.social_level IS NOT NULL 
       AND place_row.target_audience IS NOT NULL THEN
        score := score + 1;
    END IF;
    
    IF place_row.photo_url IS NOT NULL AND place_row.photo_url != '' THEN
        score := score + 1;
    END IF;
    
    IF place_row.mood_primary IS NOT NULL THEN
        score := score + 1;
    END IF;
    
    IF array_length(place_row.ideal_for, 1) > 0 THEN
        score := score + 1;
    END IF;
    
    IF place_row.local_secret = TRUE OR place_row.tourist_trap = TRUE THEN
        score := score + 1;
    END IF;
    
    RETURN score;
END;
$$;