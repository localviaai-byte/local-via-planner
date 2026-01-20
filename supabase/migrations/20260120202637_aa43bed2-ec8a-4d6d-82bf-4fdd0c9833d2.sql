-- Fix search_path for calculate_quality_score function
CREATE OR REPLACE FUNCTION public.calculate_quality_score(place_row public.places)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
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