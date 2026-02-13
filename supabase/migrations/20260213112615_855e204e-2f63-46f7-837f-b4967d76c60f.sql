
-- Fix places stuck at city-center fallback coordinates
-- Capasanta (restaurant on Via Sacra)
UPDATE places SET latitude = 40.7485, longitude = 14.4990 WHERE id = 'e2359315-a3a9-4e63-8451-d2930b695c8f';

-- Centro storico e Street Art (central Pompei area)
UPDATE places SET latitude = 40.7502, longitude = 14.4978 WHERE id = 'bd449792-0faf-4c0c-b63f-0bcd67250bcf';

-- La Rotonda Pizzeria Friggitoria (Via Roma area)
UPDATE places SET latitude = 40.7496, longitude = 14.4955 WHERE id = '76a6d901-1181-4fd1-8d9d-ed6d3977b291';

-- Maximall Pompeii (large mall near highway, south of Scavi)
UPDATE places SET latitude = 40.7398, longitude = 14.4867 WHERE id = 'b7f7c2a9-678f-4e55-90f1-417a4354e4fd';

-- Misaki Pompei - Sushi (Via Lepanto area)
UPDATE places SET latitude = 40.7510, longitude = 14.5025 WHERE id = '64203917-d283-473d-ac22-b8650ee6ead6';

-- Santuario della Beata Vergine del Santo Rosario (Piazza Bartolo Longo)
UPDATE places SET latitude = 40.7493, longitude = 14.4988 WHERE id = 'f771a927-149b-4318-a7bc-463d7c375f66';

-- Garum (missing coords - Via Lepanto)
UPDATE places SET latitude = 40.7478, longitude = 14.5015 WHERE id = '56277012-2d56-46f7-8ba3-b22b71c1fde5';
