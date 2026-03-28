-- 011: Row Level Security policies
-- Owner: Tech Lead / Integration (Agent C0)
-- All user-owned tables get user_id = auth.uid() policies

-- ─── persona_events ──────────────────────────────────────────────────────────
ALTER TABLE persona_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY persona_events_select ON persona_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY persona_events_insert ON persona_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- No UPDATE/DELETE: append-only event store

-- ─── persona_snapshots ───────────────────────────────────────────────────────
ALTER TABLE persona_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY persona_snapshots_select ON persona_snapshots
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY persona_snapshots_insert ON persona_snapshots
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY persona_snapshots_update ON persona_snapshots
  FOR UPDATE USING (user_id = auth.uid());

-- No DELETE: snapshots are rebuilt, not deleted by users

-- ─── inventory_items ─────────────────────────────────────────────────────────
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY inventory_items_select ON inventory_items
  FOR SELECT USING (active = true);

-- No INSERT/UPDATE/DELETE for users: managed by Inventory Service (service role)

-- ─── learning_questions ──────────────────────────────────────────────────────
ALTER TABLE learning_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_questions_select ON learning_questions
  FOR SELECT USING (true);

-- Public read, write managed by Learning Service (service role)

-- ─── learning_answers ────────────────────────────────────────────────────────
ALTER TABLE learning_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_answers_select ON learning_answers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY learning_answers_insert ON learning_answers
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- No UPDATE/DELETE: answers are immutable records

-- ─── proactive_decisions ─────────────────────────────────────────────────────
ALTER TABLE proactive_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY proactive_decisions_select ON proactive_decisions
  FOR SELECT USING (user_id = auth.uid());

-- INSERT/UPDATE managed by Proactive Service (service role)

-- ─── boost_inferences ────────────────────────────────────────────────────────
ALTER TABLE boost_inferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY boost_inferences_select ON boost_inferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY boost_inferences_update ON boost_inferences
  FOR UPDATE USING (user_id = auth.uid());

-- INSERT managed by AI Layer (service role)

-- ─── notification_preferences ────────────────────────────────────────────────
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_preferences_select ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notification_preferences_insert ON notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY notification_preferences_update ON notification_preferences
  FOR UPDATE USING (user_id = auth.uid());

-- ─── consent_records ─────────────────────────────────────────────────────────
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY consent_records_select ON consent_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY consent_records_insert ON consent_records
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- No UPDATE/DELETE: consent records are immutable audit trail

-- ─── feature_flags ───────────────────────────────────────────────────────────
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY feature_flags_select ON feature_flags
  FOR SELECT USING (true);

-- Public read, write managed by admin (service role)

COMMENT ON POLICY persona_events_select ON persona_events IS 'Users can only read their own persona events';
COMMENT ON POLICY inventory_items_select ON inventory_items IS 'All authenticated users can read active inventory items';
COMMENT ON POLICY feature_flags_select ON feature_flags IS 'Feature flags are publicly readable';
