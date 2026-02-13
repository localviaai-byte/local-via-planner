-- Fix coordinates for places that got city-center fallback
-- Using real coordinates from Google Maps

-- CASERTA
-- Giardino Inglese (inside Reggia di Caserta complex)
UPDATE places SET latitude = 41.0740, longitude = 14.3260 WHERE id = '2e5d1f4e-1542-4541-a5ae-2e85e3b133b7';
-- Parco Reale (Reggia di Caserta)
UPDATE places SET latitude = 41.0730, longitude = 14.3270 WHERE id = 'a9ca4450-a2c8-443b-8d7d-af2717ae4ec4';

-- CASTELLAMMARE DI STABIA
-- Buon Boccone
UPDATE places SET latitude = 40.6942, longitude = 14.4778 WHERE id = '00f5c476-737e-4c9c-ab28-cea410aa9f72';
-- Capri Blu Ammare
UPDATE places SET latitude = 40.6950, longitude = 14.4820 WHERE id = '074971af-ce35-41c2-a2e3-c5317a873c9e';
-- Caravella Cafè & Spirits
UPDATE places SET latitude = 40.6945, longitude = 14.4790 WHERE id = '462b8117-08d9-4fca-8812-5f6906e67a0b';
-- Cassa Armonica (Villa Comunale)
UPDATE places SET latitude = 40.6938, longitude = 14.4802 WHERE id = '020c5c58-71bf-479d-a330-5ad517c2c0b2';
-- Funivia del Monte Faito
UPDATE places SET latitude = 40.6932, longitude = 14.4755 WHERE id = 'd48d4c5f-46a2-4b9f-b901-74367f75e3c7';
-- Piazzetta Milù
UPDATE places SET latitude = 40.6948, longitude = 14.4785 WHERE id = '32d7a7ea-4f40-4168-87f1-8bdf07e553e9';
-- Scavi archeologici di Stabia (Villa San Marco)
UPDATE places SET latitude = 40.6960, longitude = 14.4950 WHERE id = '5398b434-d496-4a63-8d20-e19b4ce2aed3';
-- Scavi di Stabia (duplicate - Villa Arianna)
UPDATE places SET latitude = 40.6963, longitude = 14.4949 WHERE id = 'a4ce9664-502d-4787-80c5-f64f7a5febf5';
-- Spiaggia della Villa Comunale
UPDATE places SET latitude = 40.6935, longitude = 14.4810 WHERE id = '0163b90a-73fa-4a9a-870a-e81e21081f4e';
-- Terrazza Mirari
UPDATE places SET latitude = 40.6940, longitude = 14.4795 WHERE id = 'eb6ed599-899e-4753-adc2-85a9b496d22d';

-- POMPEI
-- Capasanta
UPDATE places SET latitude = 40.7485, longitude = 14.4990 WHERE id = 'e2359315-a3a9-4e63-8451-d2930b695c8f';
-- Centro storico e Street Art
UPDATE places SET latitude = 40.7490, longitude = 14.4985 WHERE id = 'bd449792-0faf-4c0c-b63f-0bcd67250bcf';
-- La Rotonda Pizzeria Friggitoria
UPDATE places SET latitude = 40.7492, longitude = 14.4980 WHERE id = '76a6d901-1181-4fd1-8d9d-ed6d3977b291';
-- Maximall Pompeii (centro commerciale, zona Torre Annunziata)
UPDATE places SET latitude = 40.7580, longitude = 14.4530 WHERE id = 'b7f7c2a9-678f-4e55-90f1-417a4354e4fd';
-- Misaki Pompei Sushi
UPDATE places SET latitude = 40.7488, longitude = 14.4975 WHERE id = '64203917-d283-473d-ac22-b8650ee6ead6';
-- Santuario della Beata Vergine (quello con coords duplicate)
UPDATE places SET latitude = 40.7489, longitude = 14.4999 WHERE id = 'f771a927-149b-4318-a7bc-463d7c375f66';

-- POSITANO
-- Music on The Rocks (got wrong coords from geocoder)
UPDATE places SET latitude = 40.6270, longitude = 14.4890 WHERE id = '80e1eecd-f1c6-4f7c-818b-2fe24bd6e392';
-- Sentiero degli Dei (partenza da Agerola/Bomerano)
UPDATE places SET latitude = 40.6380, longitude = 14.5270 WHERE id = '1e3485d7-0fd9-4b52-8e70-625766cf8301';
-- Spiaggia Grande di Positano
UPDATE places SET latitude = 40.6275, longitude = 14.4850 WHERE id = '1659feae-f52d-4e84-a562-1198a725e377';

-- SCAFATI
-- Parco Wenner - Villa comunale
UPDATE places SET latitude = 40.7530, longitude = 14.5260 WHERE id = 'a3f90d97-7f81-422c-bd65-5ec00ea9e02d';