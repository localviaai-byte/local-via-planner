-- Update Pompei city with correct coordinates
UPDATE cities 
SET 
  latitude = 40.7509,
  longitude = 14.4869,
  region = 'Campania'
WHERE slug = 'pompei';

-- Fix Scavi di Pompei (currently has coordinates in Trentino!)
UPDATE places 
SET 
  latitude = 40.7509,
  longitude = 14.4869,
  address = 'Via Villa dei Misteri, 2, 80045 Pompei NA'
WHERE name = 'Scavi di Pompei' AND city_id = '6125a12d-4ec4-4646-8454-4709186d3ca0';

-- Add coordinates for Santuario (currently null)
UPDATE places 
SET 
  latitude = 40.7489,
  longitude = 14.4999,
  address = 'Piazza Bartolo Longo, 1, 80045 Pompei NA'
WHERE name LIKE '%Santuario%' AND city_id = '6125a12d-4ec4-4646-8454-4709186d3ca0';