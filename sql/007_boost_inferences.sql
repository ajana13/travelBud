-- 007: Boost Inferences
-- Owner: AI Layer / Persona Boost (Agent B3)

CREATE TABLE IF NOT EXISTS boost_inferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_detail TEXT NOT NULL,
  inferred_preference JSONB NOT NULL,
  confidence DOUBLE PRECISION NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  visibility_state TEXT NOT NULL DEFAULT 'pending' CHECK (visibility_state IN ('pending', 'visible', 'hidden')),
  acceptance_status TEXT NOT NULL DEFAULT 'pending' CHECK (acceptance_status IN ('pending', 'accepted', 'rejected', 'edited')),
  plain_language_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_boost_user ON boost_inferences(user_id);
CREATE INDEX IF NOT EXISTS idx_boost_pending ON boost_inferences(user_id) WHERE acceptance_status = 'pending';

COMMENT ON TABLE boost_inferences IS 'Persona Boost inferences from public-source discovery. Every inference must be visible and editable before affecting ranking.';
