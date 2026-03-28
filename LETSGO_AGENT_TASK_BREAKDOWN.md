# LetsGo V1 Detailed Task Breakdown By Agent

## Summary
This document expands [LETSGO_IMPLEMENTATION_BREAKDOWN.md](/Users/vkunderu/agentic-practice/LETSGO_IMPLEMENTATION_BREAKDOWN.md) into smaller execution tickets. Each ticket is intentionally scoped so it can be owned by one engineer or sub-agent without open-ended product decisions.

Conventions:
- `P0`: blocks core implementation or beta launch
- `P1`: important for beta quality but not on the earliest critical path
- `P2`: polish, hardening, or follow-on operational value

## Agent 0: Tech Lead / Integration Owner

### P0 Tickets
- Define repository layout and package boundaries for backend services, shared schema package, iOS client, and ops console.
- Define canonical domain schemas for `InventoryItem`, `PersonaEvent`, `PersonaSnapshot`, `BoostInference`, `RecommendationCard`, `LearningQuestion`, `LearningAnswer`, and `ProactiveDecision`.
- Define API contracts for `GET /feed`, `POST /actions`, `POST /chat/messages`, `GET/PATCH /persona`, `POST /persona-boost/start`, `GET /persona-boost/status`, `POST /notifications/preferences`, `GET /learning/prompt`, `POST /learning/answer`, and `DELETE /account`.
- Define event naming, versioning, and backward-compatibility policy.
- Define feature-flag catalog and rollout ownership model.

### P1 Tickets
- Publish service interaction diagram and critical-path sequence diagrams for feed generation, learning prompt generation, and push delivery.
- Define error taxonomy and user-visible failure behavior across app, backend, and AI surfaces.
- Define integration test contract checklist for cross-service signoff.

### P2 Tickets
- Maintain architecture decision log as implementation discoveries appear.
- Define migration and schema-change playbook for parallel contributors.

## Agent 1: Foundation / Platform Backend

### P0 Tickets
- Scaffold backend workspace in TypeScript/Node with package scripts, linting, formatting, and test harness.
- Add config loader for local, staging, and production environments.
- Set up Postgres connection layer and migration framework.
- Set up REST server shell with request validation, auth middleware hooks, and typed error responses.
- Set up queue/scheduler foundation for nightly jobs, decay jobs, digest jobs, and proactive scheduling.
- Add structured logging and request correlation IDs.
- Add feature-flag evaluation library and environment-backed flag configuration.

### P1 Tickets
- Add metrics and tracing hooks for API latency, queue throughput, and job failures.
- Add shared secrets/config management integration for cloud deploys.
- Add local development bootstrap scripts and seed hooks.

### P2 Tickets
- Add rate-limiting middleware for public endpoints.
- Add circuit-breaker or retry utilities for external provider integrations and LLM calls.

## Agent 2: Identity / User / Consent / Privacy

### P0 Tickets
- Implement user table, linked-identity table, and notification-preferences table.
- Implement Apple sign-in backend flow.
- Implement Google sign-in backend flow.
- Implement email auth flow.
- Implement account linking rules so multiple identities can map to one user safely.
- Implement consent records for Persona Boost, push, calendar, and significant-location permissions.
- Implement channel-only notification preference endpoints for push/email enablement.
- Implement `DELETE /account` anonymization workflow for direct identifiers.

### P1 Tickets
- Add audit log entries for auth, consent changes, and deletion requests.
- Add recovery and conflict-handling flows for duplicate email or provider-link collisions.
- Add internal admin lookup for user identity resolution during support.

### P2 Tickets
- Add account-session revocation and device/session management.
- Add notification preference change history for ops visibility.

## Agent 3: Data Model / Event Store / Persona Snapshot

### P0 Tickets
- Implement `PersonaEvent` storage schema and append API.
- Implement `PersonaSnapshot` storage schema.
- Implement event-to-snapshot replay engine.
- Implement snapshot update transaction pattern so persona writes are atomic and replayable.
- Add event version field and migration strategy for future schema evolution.
- Implement plain-language persona projection model from raw structured state.
- Implement provenance support for chat-derived and boost-derived changes.

### P1 Tickets
- Add snapshot rebuild command for one user.
- Add snapshot rebuild job for many users or backfills.
- Add event replay diff tooling to compare replayed vs stored snapshot.

### P2 Tickets
- Add snapshot compaction strategy if event streams grow large.
- Add event retention and archival policy hooks for anonymized history.

## Agent 4: Inventory / Provider Integration / Normalization

### P0 Tickets
- Define normalized `InventoryItem` schema fields and validation rules.
- Build provider adapter interface with transform, validation, dedupe, and error-report hooks.
- Implement events provider adapter for Seattle launch inventory.
- Implement dining provider adapter for Seattle launch inventory.
- Implement outdoors provider adapter for Seattle launch inventory.
- Implement inventory upsert pipeline and storage tables.
- Implement nightly full-refresh scheduler.
- Implement same-day availability validation path used before proactive sends.
- Implement deep-link target handling and provider attribution storage.

### P1 Tickets
- Implement inventory dedupe rules across providers and categories.
- Add nightlife-specific tagging as secondary dining inventory.
- Add source-health metrics and freshness markers per adapter.

### P2 Tickets
- Add manual suppression list support for bad inventory items.
- Add canonical neighborhood or area tagging inside Seattle for future ranking improvements.

## Agent 5: Recommendation / Ranking / Diversity Engine

### P0 Tickets
- Implement candidate retrieval from active inventory plus user location context.
- Implement hard-filter application before scoring.
- Implement feed score calculation using persona state and exploration logic.
- Implement elastic feed sizing rule: default 6, valid range 3-8.
- Implement exploration budget logic with cap of 2 exploration cards per surface.
- Implement strict diversity pass across pillar, time shape, social mode, and price band.
- Implement confidence-label mapping to `New`, `Learning`, and `Strong match`.
- Implement structured reason-fact generation for each recommendation.
- Implement `GET /feed` endpoint response assembly.

### P1 Tickets
- Implement travel-state handling so one persona ranks current-area inventory.
- Implement fallback behavior when diversity rules conflict with sparse inventory.
- Implement recommendation refresh trigger after immediate persona updates from learning answers.

### P2 Tickets
- Add support for ranking diagnostics payloads for ops inspection.
- Add cohort-level ranking metrics for acceptance-rate analysis.

## Agent 6: Persona Logic / Feedback / Learning Engine

### P0 Tickets
- Define exact semantics for `I'm in`, `Maybe`, `Pass`, and `Can't` in code.
- Implement `POST /actions` ingestion and validation.
- Implement quick-reason handling for `Pass` and `Can't`.
- Implement optional free-text attachment storage for `Pass` and `Can't`.
- Implement ambiguity-first negative update logic for `Pass`.
- Implement circumstantial no-penalty logic for `Can't`.
- Implement weak-positive or reminder eligibility logic for `I'm in` and `Maybe` per plan.
- Implement contradiction-aware decay jobs for persona confidence.
- Implement hard-filter promotion rules after repeated low-circumstance evidence.
- Implement active-learning candidate model and `LearningQuestion` persistence.
- Implement learning selector scoring: expected near-term lift first, low confidence second.
- Implement standalone-vs-attached learning budget accounting.
- Implement cadence state updates on answered vs ignored learning prompts.
- Implement 60-minute TTL handling for standalone push learning nudges.
- Implement attached follow-up eligibility after `Pass` and `Can't` only.
- Implement session-level learning cap state needed by the app.
- Implement comparative-question answer mapping using relative boosts only.
- Implement immediate persona update and re-rank trigger from learning answers.
- Implement `POST /learning/answer`.

### P1 Tickets
- Implement sensitive-topic context gating rules for proactive learning.
- Implement support for one allowed follow-up in in-app chat after a push-based learning answer.
- Implement plain-language explanation of persona changes for UI acknowledgement.

### P2 Tickets
- Add experimentation hooks around learning cadence and selector weighting.
- Add support for future topic-memory mode behind a flag, without enabling it in v1.

## Agent 7: AI Layer / Chat / Persona Boost / Explanation Polish

### P0 Tickets
- Implement one-provider LLM gateway with typed request/response wrappers.
- Implement schema validation layer so LLM output is parsed into safe typed structures.
- Implement chat parsing prompt and structured extraction output.
- Implement `POST /chat/messages` orchestration for reply plus structured updates.
- Implement Persona Boost extraction pipeline from discovered public-source content into visible `BoostInference` proposals.
- Implement explanation polishing pipeline using structured reason facts as source input.
- Implement learning-question generation fallback when templates do not fit.

### P1 Tickets
- Add prompt versioning and prompt-level observability.
- Add safety checks to reject unsupported hidden-signal or opaque-persona outputs.
- Add LLM retry behavior and failure fallback to template-only outputs.

### P2 Tickets
- Add quality-evaluation harness for explanation style and learning-question quality.
- Add offline prompt regression snapshots.

## Agent 8: iOS App / UX Surfaces

### P0 Tickets
- Scaffold SwiftUI app shell, navigation, and environment configuration.
- Implement auth entry, sign-in, and session restore flows.
- Implement onboarding conversation flow.
- Implement Persona Boost screen with complete, skip, and in-progress states.
- Implement home feed UI for 3-8 cards with confidence labels and explanation text.
- Implement card action controls for `I'm in`, `Maybe`, `Pass`, and `Can't`.
- Implement quick reasons and optional text UI for `Pass` and `Can't`.
- Implement attached follow-up learning UI after `Pass` and `Can't`.
- Implement chat thread UI with system-message style for unsolicited learning prompts.
- Implement persona editor with plain-language preferences and visible hard filters.
- Implement push/email preference controls.
- Implement deep-link handling from push and email into the right in-app surface.

### P1 Tickets
- Implement location permission flow and travel-aware UX hints.
- Implement calendar-permission request UX if enabled by feature flag.
- Implement immediate feed refresh after learning answers or persona edits.
- Implement lightweight acknowledgement UI after persona-changing actions.

### P2 Tickets
- Add skeleton/loading states and offline/failure UX polish.
- Add internal beta instrumentation hooks for UI-level funnel tracking.

## Agent 9: Proactive Delivery / Push / Email / Scheduling

### P0 Tickets
- Implement `Proactive Service` scheduling loop.
- Implement interrupt-score evaluation pipeline.
- Implement shared push budget accounting across recommendation and learning pushes.
- Implement priority rule so recommendation pushes always outrank learning pushes.
- Implement 6-hour minimum separation between proactive pushes.
- Implement quiet-hours suppression using system default 9pm-8am.
- Implement single-recommendation push payload generation.
- Implement standalone learning push payload generation.
- Implement APNs delivery integration.
- Implement weekly digest selection and assembly with 3-item target when at least 2 qualify.
- Implement post-activity confirmation prompt scheduling after `I'm in`.
- Implement telemetry capture for sends, opens, taps, ignores, and answers.

### P1 Tickets
- Implement resend/suppression behavior for failed push deliveries.
- Implement in-app fallback trigger when learning push expires unanswered.
- Implement digest suppression when inventory quality is too low.

### P2 Tickets
- Add send-time experimentation hooks.
- Add channel-level operational dashboards and anomaly alerts.

## Agent 10: Internal Ops Console / Audit / Debugging

### P0 Tickets
- Scaffold internal web console with operator auth.
- Implement user lookup and persona timeline view.
- Implement event stream inspection view.
- Implement stored-vs-replayed persona snapshot comparison view.
- Implement recommendation audit view showing score factors, explanation facts, and diversity decisions.
- Implement learning audit view showing prompt selection, channel, status, answer, and cadence effects.
- Implement notification log view for recommendation pushes, learning pushes, and digests.
- Implement source-health dashboard for provider freshness and sync failures.
- Implement feature-flag management UI.

### P1 Tickets
- Implement hard-filter audit view with promotion provenance.
- Implement boost inference review/audit visibility.
- Implement support actions for temporarily suppressing broken sources or features.

### P2 Tickets
- Add cohort analytics for recommendation lift after learning prompts.
- Add operator notes or incident tagging on problematic users/events.

## Agent 11: QA / Simulation / Reliability

### P0 Tickets
- Build deterministic fixture framework for replaying persona and ranking scenarios.
- Write replay tests for action sequences involving `I'm in`, `Maybe`, `Pass`, and `Can't`.
- Write tests for attached follow-up eligibility after `Pass` and `Can't`.
- Write tests for ambiguity-first negative updates and circumstantial handling.
- Write tests for hard-filter promotion.
- Write tests for learning-selector priority: expected lift first, confidence second.
- Write tests for learning cadence increase on answers and backoff on ignores.
- Write tests for shared learning budget across standalone and attached prompts.
- Write tests for 60-minute standalone learning TTL.
- Write tests for 6-hour proactive push cooldown.
- Write tests for immediate re-ranking after learning answers.
- Write tests for comparative-question mapping.
- Write tests for sensitive-topic context gating.
- Write tests for travel-state ranking behavior.
- Write tests for deletion/anonymization behavior.

### P1 Tickets
- Build staging smoke tests across auth, feed, chat, actions, persona edit, and notification flows.
- Build regression tests for snapshot replay correctness after schema changes.
- Add failure injection tests for provider outages and LLM fallback paths.

### P2 Tickets
- Add long-run simulation tests for cadence drift and exploration behavior.
- Add performance benchmarks for ranking and replay cost under growing event history.

## Suggested Ticket Ordering

### Wave 1: Foundation
- Agent 0 P0
- Agent 1 P0
- Agent 2 P0 identity model
- Agent 3 P0 event/snapshot model

### Wave 2: Core Data And Inventory
- Agent 4 P0
- Agent 5 P0 candidate retrieval and feed assembly
- Agent 6 P0 action semantics and persona updates

### Wave 3: AI And User Surfaces
- Agent 7 P0
- Agent 8 P0 app shell, onboarding, feed, actions, chat
- Agent 9 P0 push and digest backbone

### Wave 4: Audit And Hardening
- Agent 10 P0
- Agent 11 P0
- P1 work across agents

### Wave 5: Beta Readiness
- cross-agent bug fixing
- staging signoff
- feature-flag tuning
- dogfood and invite-only rollout prep

## Minimum Ticket Set To Reach First End-To-End Demo
- Agent 0: shared contracts
- Agent 1: backend scaffold, migrations, API shell
- Agent 2: one auth method plus basic user model
- Agent 3: event store plus persona snapshot
- Agent 4: one provider per launch pillar
- Agent 5: feed ranking and `GET /feed`
- Agent 6: `POST /actions` plus basic persona updates
- Agent 7: chat extraction and explanation polish
- Agent 8: onboarding, feed, action flows, chat, persona view
- Agent 9: recommendation push delivery only
- Agent 10: basic persona timeline and notification log
- Agent 11: smoke tests for onboarding -> feed -> action -> persona update
