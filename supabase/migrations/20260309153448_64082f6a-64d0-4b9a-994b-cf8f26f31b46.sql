
-- Transport hubs for cities (airports, train stations, bus stations)
CREATE TABLE public.city_transport_hubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  hub_type TEXT NOT NULL CHECK (hub_type IN ('airport', 'train_station', 'bus_station', 'port')),
  name TEXT NOT NULL,
  code TEXT, -- e.g. NAP for Naples airport, or station code
  latitude NUMERIC,
  longitude NUMERIC,
  distance_from_center_km NUMERIC,
  travel_time_to_center_minutes SMALLINT,
  transport_to_center TEXT, -- e.g. "Alibus ogni 20 min", "Metro L2 ogni 8 min"
  ncc_taxi_note TEXT, -- info for NCC/taxi contact
  ncc_contact_url TEXT, -- link to book NCC/taxi
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- RLS
ALTER TABLE public.city_transport_hubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage transport hubs"
ON public.city_transport_hubs FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active transport hubs"
ON public.city_transport_hubs FOR SELECT TO public
USING (is_active = true);
