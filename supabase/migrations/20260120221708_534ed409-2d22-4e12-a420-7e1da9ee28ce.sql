-- Add distance_km column to city_connections
ALTER TABLE city_connections 
ADD COLUMN distance_km numeric DEFAULT NULL;