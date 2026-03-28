-- 003: Inventory Items (normalized catalog)
-- Owner: Inventory Service (Agent A4)

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL,
  source_provider TEXT NOT NULL,
  pillar TEXT NOT NULL CHECK (pillar IN ('events', 'dining', 'outdoors')),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  location_address TEXT NOT NULL,
  location_neighborhood TEXT,
  availability_start TIMESTAMPTZ NOT NULL,
  availability_end TIMESTAMPTZ,
  availability_recurring BOOLEAN NOT NULL DEFAULT false,
  price_band TEXT NOT NULL CHECK (price_band IN ('free', 'budget', 'mid', 'premium')),
  social_mode TEXT NOT NULL CHECK (social_mode IN ('solo', 'duo', 'group', 'any')),
  time_shape TEXT NOT NULL,
  nightlife BOOLEAN NOT NULL DEFAULT false,
  deep_link TEXT NOT NULL,
  image_url TEXT,
  source_meta JSONB NOT NULL DEFAULT '{}',
  last_refreshed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  availability_verified_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_source ON inventory_items(source_provider, source_id);
CREATE INDEX IF NOT EXISTS idx_inventory_pillar ON inventory_items(pillar) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_inventory_active ON inventory_items(active);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory_items(location_lat, location_lng) WHERE active = true;

COMMENT ON TABLE inventory_items IS 'Normalized local discovery inventory. One row per unique item across all providers.';
