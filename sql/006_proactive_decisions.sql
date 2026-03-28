-- 006: Proactive Decisions
-- Owner: Proactive Service (Agent C2)

CREATE TABLE IF NOT EXISTS proactive_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('push', 'email', 'in_app_chat')),
  content_type TEXT NOT NULL CHECK (content_type IN ('recommendation', 'learning', 'confirmation', 'digest')),
  selected_content_id UUID NOT NULL,
  reason_type TEXT NOT NULL,
  interrupt_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  delivered BOOLEAN NOT NULL DEFAULT false,
  suppression_reason TEXT CHECK (suppression_reason IS NULL OR suppression_reason IN (
    'quiet_hours', 'cooldown', 'budget_exhausted', 'channel_disabled', 'higher_priority_pending'
  )),
  scheduled_at TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_type TEXT CHECK (response_type IS NULL OR response_type IN (
    'opened', 'tapped', 'answered', 'ignored', 'expired'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proactive_user ON proactive_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_proactive_scheduled ON proactive_decisions(scheduled_at) WHERE delivered = false;
CREATE INDEX IF NOT EXISTS idx_proactive_channel ON proactive_decisions(user_id, channel, scheduled_at);

COMMENT ON TABLE proactive_decisions IS 'Log of all proactive delivery decisions. Used for budget enforcement, cooldown tracking, and ops audit.';
