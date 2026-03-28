-- 004: Learning Questions
-- Owner: Learning Service (Agent B2)

CREATE TABLE IF NOT EXISTS learning_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_family TEXT NOT NULL,
  question_text TEXT NOT NULL,
  expected_lift DOUBLE PRECISION NOT NULL DEFAULT 0,
  confidence_gap DOUBLE PRECISION NOT NULL DEFAULT 0,
  channel_eligibility TEXT[] NOT NULL DEFAULT '{}',
  answer_schema JSONB NOT NULL,
  is_comparative BOOLEAN NOT NULL DEFAULT false,
  comparison_items JSONB,
  source_type TEXT NOT NULL CHECK (source_type IN ('template', 'llm_generated')),
  sensitive_topic_flag BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_learning_questions_topic ON learning_questions(topic_family);
CREATE INDEX IF NOT EXISTS idx_learning_questions_lift ON learning_questions(expected_lift DESC);

COMMENT ON TABLE learning_questions IS 'Active learning question catalog. Templates and LLM-generated questions scored by expected recommendation lift.';
