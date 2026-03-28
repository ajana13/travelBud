-- 009: Consent Records
-- Owner: Identity / Privacy Service (Agent A2)

CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'persona_boost', 'push_notifications', 'email_notifications',
    'calendar_access', 'location_access', 'terms_of_service', 'privacy_policy'
  )),
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_user ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_type ON consent_records(user_id, consent_type);

COMMENT ON TABLE consent_records IS 'Audit trail of all user consent grants and revocations. Required for privacy compliance.';
