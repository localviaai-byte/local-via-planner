-- Add day_worth enum and column to city_connections
CREATE TYPE day_worth_type AS ENUM ('full_day', 'half_day', 'combine_with_other');

ALTER TABLE city_connections 
ADD COLUMN day_worth day_worth_type DEFAULT NULL;