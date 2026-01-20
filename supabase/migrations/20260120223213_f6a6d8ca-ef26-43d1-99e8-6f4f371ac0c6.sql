-- =====================================================
-- PRODUCTS & ADD-ON SYSTEM
-- Sistema per monetizzare l'itinerario con esperienze acquistabili
-- =====================================================

-- 1) ENUM: Tipo di prodotto
CREATE TYPE product_type AS ENUM (
  'guided_tour',
  'tasting',
  'workshop',
  'dining_experience',
  'transport',
  'photo_experience',
  'ticket'
);

-- 2) ENUM: Tipo di item nel piano
CREATE TYPE plan_item_type AS ENUM ('place', 'product');

-- 3) TABELLA: products (cosa vendi)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.city_zones(id) ON DELETE SET NULL,
  
  product_type product_type NOT NULL,
  title TEXT NOT NULL,
  short_pitch TEXT NOT NULL,
  description TEXT,
  
  duration_minutes SMALLINT CHECK (duration_minutes BETWEEN 15 AND 1440),
  price_cents INTEGER,
  currency CHAR(3) DEFAULT 'EUR',
  
  -- Logistics
  meeting_point TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  capacity_note TEXT,
  booking_url TEXT,
  vendor_name TEXT,
  vendor_contact TEXT,
  photo_url TEXT,
  
  -- Timing preferences
  preferred_time_buckets time_bucket[] DEFAULT '{}',
  
  status place_status NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_products_city ON public.products(city_id);
CREATE INDEX idx_products_type ON public.products(product_type);
CREATE INDEX idx_products_status ON public.products(status);

-- 4) TABELLA: product_tags (riutilizza sistema tags esistente)
CREATE TABLE public.product_tags (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  weight SMALLINT CHECK (weight BETWEEN 1 AND 5) DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, tag_id)
);

-- 5) TABELLA: product_rules (quando mostrare il prodotto)
CREATE TABLE public.product_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  -- Trigger: contesto in cui appare
  trigger_place_types place_type[] DEFAULT '{}',
  trigger_interest_keys TEXT[] DEFAULT '{}',
  trigger_time_buckets time_bucket[] DEFAULT '{}',
  trigger_zone_ids UUID[] DEFAULT '{}',
  
  -- Trip constraints
  min_trip_days SMALLINT,
  max_trip_days SMALLINT,
  
  -- User compatibility
  requires_pace_max SMALLINT,
  suitable_for ideal_for[] DEFAULT '{}',
  min_social_level SMALLINT,
  
  -- Display settings
  anchor_type TEXT CHECK (anchor_type IN ('before', 'after', 'instead', 'standalone')),
  requires_booking BOOLEAN DEFAULT true,
  priority SMALLINT DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  
  note_internal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_rules_product ON public.product_rules(product_id);

-- 6) TABELLA: trip_plans (piano dell'utente)
CREATE TABLE public.trip_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  
  title TEXT,
  start_date DATE,
  days SMALLINT DEFAULT 1,
  
  -- User preferences snapshot
  preferences JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trip_plans_user ON public.trip_plans(user_id);
CREATE INDEX idx_trip_plans_city ON public.trip_plans(city_id);

-- 7) TABELLA: plan_items (elementi nel piano)
CREATE TABLE public.plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.trip_plans(id) ON DELETE CASCADE,
  
  item_type plan_item_type NOT NULL,
  place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  
  day_index SMALLINT NOT NULL DEFAULT 1,
  start_time TIME,
  end_time TIME,
  slot_type TEXT, -- morning, lunch, afternoon, aperitivo, dinner, evening
  
  -- Custom notes
  notes TEXT,
  is_booked BOOLEAN DEFAULT false,
  
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plan_items_plan ON public.plan_items(plan_id);
CREATE INDEX idx_plan_items_day ON public.plan_items(plan_id, day_index);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Products: visibili a tutti se approved, gestibili da admin/editor
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved products"
ON public.products FOR SELECT
USING (status = 'approved');

CREATE POLICY "Admins and editors can manage products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- Product Tags: visibili a tutti, gestibili da admin/editor
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product tags"
ON public.product_tags FOR SELECT
USING (true);

CREATE POLICY "Admins and editors can manage product tags"
ON public.product_tags FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- Product Rules: visibili a tutti, gestibili da admin/editor
ALTER TABLE public.product_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product rules"
ON public.product_rules FOR SELECT
USING (true);

CREATE POLICY "Admins and editors can manage product rules"
ON public.product_rules FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- Trip Plans: utenti vedono/gestiscono i propri, admin vedono tutti
ALTER TABLE public.trip_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own plans"
ON public.trip_plans FOR ALL
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view all plans"
ON public.trip_plans FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Plan Items: seguono le regole del plan padre
ALTER TABLE public.plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage items in their plans"
ON public.plan_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.trip_plans tp
    WHERE tp.id = plan_items.plan_id
    AND (tp.user_id = auth.uid() OR tp.user_id IS NULL)
  )
);

CREATE POLICY "Admins can view all plan items"
ON public.plan_items FOR SELECT
USING (has_role(auth.uid(), 'admin'));