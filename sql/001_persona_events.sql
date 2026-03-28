-- 001: Persona Events (append-only event store)
-- Owner: Persona Service (sole writer)

CREATE TABLE IF NOT EXISTS persona_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'action', 'boost_inference', 'chat_extraction',
    'learning_answer', 'confirmation', 'system_decision', 'persona_edit'
  )),
  version INTEGER NOT NULL DEFAULT 1,
  payload JSONB NOT NULL,
  source JSONB NOT NULL DEFAULT '{}',
  sequence_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_persona_events_user_id ON persona_events(user_id);
CREATE INDEX IF NOT EXISTS idx_persona_events_user_sequence ON persona_events(user_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_persona_events_type ON persona_events(type);

-- Enforce per-user monotonic sequence
CREATE UNIQUE INDEX IF NOT EXISTS idx_persona_events_user_seq_unique
  ON persona_events(user_id, sequence_number);

COMMENT ON TABLE persona_events IS 'Append-only event store for all persona state changes. Every ranking-relevant inference flows through here.';
