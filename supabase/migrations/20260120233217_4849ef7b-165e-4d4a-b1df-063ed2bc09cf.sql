-- Approve all draft places for Pompei for testing
UPDATE places 
SET status = 'approved', 
    reviewed_at = now()
WHERE city_id = '6125a12d-4ec4-4646-8454-4709186d3ca0' 
  AND status = 'draft';