-- 005: Learning Answers
-- Owner: Learning Service (Agent B2), consumed by Persona Service

CREATE TABLE IF NOT EXISTS learning_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES learning_questions(id),
  answer_payload JSONB NOT NULL,
  source_surface TEXT NOT NULL CHECK (source_surface IN ('push', 'in_app_chat', 'attached_follow_up')),
  linked_recommendation_id UUID,
  linked_action_type TEXT CHECK (linked_action_type IS NULL OR linked_action_type IN ('im_in', 'maybe', 'pass', 'cant')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_answers_user ON learning_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_answers_question ON learning_answers(question_id);

COMMENT ON TABLE learning_answers IS 'Records of user responses to learning questions. Feeds into persona update pipeline.';
