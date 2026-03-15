-- Add 'shopping' to place_type enum
ALTER TYPE public.place_type ADD VALUE IF NOT EXISTS 'shopping';

-- Add shop_category and shop_format columns to places table
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS shop_category text NULL;
ALTER TABLE public.places ADD COLUMN IF NOT EXISTS shop_format text NULL;