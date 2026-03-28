-- 002: Persona Snapshots (current materialized state)
-- Owner: Persona Service (sole writer)

CREATE TABLE IF NOT EXISTS persona_snapshots (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  preferences JSONB NOT NULL DEFAULT '{"pillar": {}, "tags": {}}',
  hard_filters JSONB NOT NULL DEFAULT '[]',
  cadence_state JSONB NOT NULL DEFAULT '{"answeredCount": 0, "ignoredCount": 0, "currentRate": 3.5, "lastUpdatedAt": null}',
  learning_budget JSONB NOT NULL DEFAULT '{"usedThisPeriod": 0, "periodStart": null, "periodEnd": null}',
  boost_state JSONB NOT NULL DEFAULT '{"completed": false, "skipped": false, "startedAt": null, "completedAt": null}',
  travel_state JSONB NOT NULL DEFAULT '{"isAway": false, "currentLocation": null, "homeLocation": null}',
  plain_language_projections JSONB NOT NULL DEFAULT '[]',
  last_event_sequence INTEGER NOT NULL DEFAULT 0,
  rebuilt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE persona_snapshots IS 'Current materialized persona state per user. Rebuildable from persona_events. Only Persona Service writes here.';
