-- Create enums for city connections
CREATE TYPE connection_type AS ENUM (
  'day_trip',        -- gita in giornata
  'metro',           -- area metropolitana (quasi stessa base)
  'nearby_city',     -- vicina ma non da day-trip per tutti
  'multi_city'       -- consigliabile come tappa del viaggio
);

CREATE TYPE transport_mode AS ENUM ('car', 'train', 'bus', 'ferry', 'walk', 'mixed');

-- Main city connections table
CREATE TABLE city_connections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id_from        UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  city_id_to          UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  
  connection_type     connection_type NOT NULL,
  primary_mode        transport_mode NOT NULL DEFAULT 'mixed',
  
  -- Tempi realistici "door-to-door"
  typical_min_minutes SMALLINT CHECK (typical_min_minutes BETWEEN 1 AND 2000),
  typical_max_minutes SMALLINT CHECK (typical_max_minutes BETWEEN 1 AND 2000),
  
  cost_note           TEXT,    -- "treno economico", "parking caro"
  reliability_score   SMALLINT CHECK (reliability_score BETWEEN 1 AND 5) DEFAULT 3,
  friction_score      SMALLINT CHECK (friction_score BETWEEN 1 AND 5) DEFAULT 3,
  
  -- Regole/consigli locali
  best_departure_time time_bucket[],
  best_return_time    time_bucket[],
  local_tip           TEXT,
  warning             TEXT,
  seasonality_note    TEXT,
  
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by          UUID REFERENCES auth.users(id),
  
  UNIQUE(city_id_from, city_id_to, connection_type),
  CHECK (city_id_from != city_id_to)
);

-- Place coverage: contenuti "nei dintorni" senza duplicare città
CREATE TABLE place_coverage (
  place_id      UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  base_city_id  UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  relevance     SMALLINT CHECK (relevance BETWEEN 1 AND 5) DEFAULT 3,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by    UUID REFERENCES auth.users(id),
  PRIMARY KEY (place_id, base_city_id)
);

-- City clusters for macro-areas (optional but useful)
CREATE TABLE city_clusters (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  country      TEXT NOT NULL DEFAULT 'Italia',
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  created_by   UUID REFERENCES auth.users(id)
);

CREATE TABLE city_cluster_members (
  cluster_id UUID NOT NULL REFERENCES city_clusters(id) ON DELETE CASCADE,
  city_id    UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  role       TEXT CHECK (role IN ('core', 'satellite')) DEFAULT 'satellite',
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (cluster_id, city_id)
);

-- Indexes for performance
CREATE INDEX idx_city_conn_from ON city_connections(city_id_from);
CREATE INDEX idx_city_conn_to ON city_connections(city_id_to);
CREATE INDEX idx_city_conn_active ON city_connections(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_place_coverage_base ON place_coverage(base_city_id);
CREATE INDEX idx_cluster_members_city ON city_cluster_members(city_id);

-- RLS Policies
ALTER TABLE city_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_cluster_members ENABLE ROW LEVEL SECURITY;

-- City connections: anyone can view active, admins/editors can manage
CREATE POLICY "Anyone can view active connections"
  ON city_connections FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins and editors can manage connections"
  ON city_connections FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- Place coverage: anyone can view, admins/editors can manage
CREATE POLICY "Anyone can view place coverage"
  ON place_coverage FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins and editors can manage place coverage"
  ON place_coverage FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

-- City clusters: anyone can view, admins can manage
CREATE POLICY "Anyone can view clusters"
  ON city_clusters FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage clusters"
  ON city_clusters FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Cluster members: anyone can view, admins can manage
CREATE POLICY "Anyone can view cluster members"
  ON city_cluster_members FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage cluster members"
  ON city_cluster_members FOR ALL
  USING (has_role(auth.uid(), 'admin'));