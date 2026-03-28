-- 010: Feature Flags
-- Owner: Tech Lead / Integration (Agent C0)

CREATE TABLE IF NOT EXISTS feature_flags (
  flag_name TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  user_overrides JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default flags
INSERT INTO feature_flags (flag_name, enabled, description) VALUES
  ('persona_boost', false, 'Whether Persona Boost is offered during onboarding'),
  ('active_learning', false, 'Whether learning questions are generated and delivered'),
  ('proactive_pushes', false, 'Whether proactive push notifications are sent'),
  ('calendar_access', false, 'Whether calendar data is requested and used for ranking'),
  ('significant_location_access', false, 'Whether significant-location data is used'),
  ('nightlife_recommendations', false, 'Whether nightlife items surface beyond dining subcategory tagging')
ON CONFLICT (flag_name) DO NOTHING;

COMMENT ON TABLE feature_flags IS 'System-wide and per-user feature flag configuration. Each flag has an independent kill switch.';
