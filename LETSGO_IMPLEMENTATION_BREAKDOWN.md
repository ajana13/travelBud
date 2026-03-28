# LetsGo V1 Implementation Work Breakdown By Agent

## Summary
This breakdown assumes parallel execution by specialized implementation agents working against the v1 plan in [LETSGO_V1_PLAN.md](/Users/vkunderu/agentic-practice/LETSGO_V1_PLAN.md). Ownership is split by subsystem with explicit handoff contracts so agents can work independently without redefining interfaces midstream.

The critical path is:
1. foundation and shared contracts
2. data model and event pipeline
3. ranking/persona/proactive core
4. iOS surfaces and delivery channels
5. ops, privacy, and rollout hardening

## Agent 0: Tech Lead / Integration Owner
**Purpose:** Own system-level decisions, interface stability, sequencing, and merge order.

**Owns**
- Canonical API contracts and event schemas
- Service boundaries and repository structure
- Cross-agent dependency management
- Feature-flag strategy and rollout gates
- Final integration testing and acceptance review

**Deliverables**
- Monorepo or service layout with package boundaries
- Shared type definitions for:
- `InventoryItem`
- `PersonaEvent`
- `PersonaSnapshot`
- `BoostInference`
- `RecommendationCard`
- `LearningQuestion`
- `LearningAnswer`
- `ProactiveDecision`
- Interface spec for each service and job
- Decision log for unresolved implementation choices discovered during build

**Dependencies**
- None. Starts first.

**Blocks**
- Every other agent if contracts are unstable

**Acceptance**
- Shared types compile cleanly across backend and iOS integration layers
- All other agents can build against fixed interfaces without schema churn

## Agent 1: Foundation / Platform Backend
**Purpose:** Create the backend skeleton and deployment baseline.

**Owns**
- TypeScript/Node backend foundation
- Service bootstrapping and environment config
- Postgres connectivity and migration framework
- Job runner / queue / scheduler foundation
- REST API shell, auth middleware, logging, metrics, feature flags

**Deliverables**
- Backend app scaffold with local/dev/prod config separation
- Database migration system
- Base API server with auth, request validation, and structured error handling
- Queue or job framework for nightly syncs, decay jobs, digests, and proactive scheduling
- Feature-flag plumbing for:
- Persona Boost
- active learning
- proactive pushes
- calendar access
- significant-location access
- nightlife recommendations
- Observability foundation: logs, metrics, tracing hooks, alerting stubs

**Dependencies**
- Agent 0 shared contracts

**Blocks**
- Agents 2, 3, 4, 5, 6, 7

**Acceptance**
- Services boot locally and in target managed cloud environment
- Migrations run cleanly
- Background jobs can be scheduled and monitored

## Agent 2: Identity / User / Consent / Privacy
**Purpose:** Implement user identity, consent state, notification preferences, and deletion/anonymization.

**Owns**
- Apple / Google / email auth flows
- Account linking rules
- Consent records for Persona Boost, calendar, location, and notifications
- Channel-only notification preferences
- Account deletion plus historical anonymization pipeline

**Deliverables**
- Auth endpoints and token/session model
- User profile model with linked identities
- Consent and permission tables/events
- `DELETE /account` anonymization workflow
- Preference endpoints for push/email enablement
- Audit records for consent changes and data lifecycle actions

**Dependencies**
- Agents 0 and 1

**Blocks**
- Agent 8 iOS onboarding/auth
- Agent 9 push/email delivery enablement
- Agent 11 compliance test coverage

**Acceptance**
- Users can sign in with all three auth methods
- Linked identities resolve to one user
- Deletion removes direct identifiers and preserves only anonymized allowed history

## Agent 3: Data Model / Event Store / Persona Snapshot
**Purpose:** Build the state backbone for all persona and learning behavior.

**Owns**
- Event-sourced persistence model
- `PersonaEvent` append-only store
- `PersonaSnapshot` persistence and rebuild flow
- Snapshot versioning and replay tooling
- Plain-language persona projection model

**Deliverables**
- Event schema and storage tables
- Snapshot tables and rebuild jobs
- Replay engine from event stream to current persona state
- Projection layer from raw model state to editable plain-language persona UI shape
- Support for provenance and reversibility of chat and boost updates

**Dependencies**
- Agents 0 and 1

**Blocks**
- Agents 4, 5, 6, 7, 10

**Acceptance**
- Persona can be rebuilt deterministically from events
- Snapshot rebuilds match live state
- Plain-language projection remains consistent with underlying model

## Agent 4: Inventory / Provider Integration / Normalization
**Purpose:** Ingest Seattle launch inventory and normalize it into a rankable catalog.

**Owns**
- Provider adapter framework
- One adapter per launch pillar first: events, dining, outdoors
- Inventory normalization, dedupe, availability windows, deep links
- Nightly refresh jobs and same-day availability validation

**Deliverables**
- Normalized `InventoryItem` schema implementation
- Source connector framework
- Initial pillar adapters
- Inventory storage and refresh pipeline
- Staleness rules and availability recheck path for proactive sends
- Source-health telemetry for ops console

**Dependencies**
- Agents 0 and 1

**Blocks**
- Agents 5 and 6 for ranking and proactive candidate generation
- Agent 10 ops source-health views

**Acceptance**
- Inventory loads nightly without schema breakage
- Items can be ranked consistently across pillars
- Same-day validation suppresses stale proactive content

## Agent 5: Recommendation / Ranking / Diversity Engine
**Purpose:** Turn persona plus inventory into feed and proactive candidate rankings.

**Owns**
- Feed assembly and ranking
- UCB exploration logic
- Diversity guardrails
- Travel/location-aware ranking
- Recommendation explanation facts

**Deliverables**
- `GET /feed` implementation
- Elastic feed sizing logic: default 6, range 3-8
- Exploration budget logic with cap of 2 exploration cards in one surface
- Diversity enforcement across pillar, time shape, social mode, and price band
- Confidence label mapping: `New`, `Learning`, `Strong match`
- Structured explanation-fact output for each card

**Dependencies**
- Agents 3 and 4

**Blocks**
- Agent 8 home feed UI
- Agent 6 proactive candidate selection
- Agent 7 explanation polishing integration

**Acceptance**
- Ranker produces deterministic outputs under fixed fixtures
- Feed respects exploration and diversity constraints
- Explanations are grounded in structured reason facts

## Agent 6: Persona Logic / Feedback / Learning Engine
**Purpose:** Implement the core behavioral logic that evolves the persona over time.

**Owns**
- Action semantics for `I'm in`, `Maybe`, `Pass`, `Can't`
- Reason-code handling
- Ambiguity-first negative updates
- Confidence decay and contradiction handling
- Hard-filter promotion
- Active Learning question selection and cadence

**Deliverables**
- `POST /actions` behavior pipeline
- Persona delta generation rules by action type
- Decay jobs and contradiction acceleration logic
- Auto-filter promotion rules plus visibility state
- `Learning Service`
- Candidate learning-question scoring: expected near-term lift first, confidence second
- Shared learning budget and cadence engine
- TTL logic for standalone push learning nudges
- Session-level learning pressure rules
- Comparative-question mapping using relative boosts only
- Immediate re-rank trigger on learning answers
- `POST /learning/answer` implementation

**Dependencies**
- Agents 1, 3, and 5

**Blocks**
- Agent 8 action UI and follow-up flows
- Agent 9 learning-push scheduling
- Agent 10 learning logs and audit views

**Acceptance**
- Event replay reproduces persona state exactly
- Learning cadence adjusts correctly on answers and ignores
- Hard filters and preference updates remain visible and reversible

## Agent 7: AI Layer / Chat / Persona Boost / Explanation Polish
**Purpose:** Implement the bounded LLM-powered parts of the product.

**Owns**
- LLM gateway abstraction for one provider
- Chat parsing and structured extraction
- Persona Boost inference extraction
- Explanation polishing
- Hybrid question generation for active learning

**Deliverables**
- `POST /chat/messages` implementation with structured extraction output
- Prompting and validation pipeline for:
- chat preference extraction
- boost inference extraction
- explanation rewrite/polish
- learning question generation fallback when templates do not fit
- Strict schema validation so LLM output never writes state directly
- Provenance capture for boost-derived inferences

**Dependencies**
- Agents 3, 5, and 6

**Blocks**
- Agent 8 chat UI
- Agent 10 boost and learning audit tools

**Acceptance**
- Every LLM response is validated into typed structures
- No hidden ranking-only signals are introduced
- Generated explanations and questions remain grounded in system facts

## Agent 8: iOS App / UX Surfaces
**Purpose:** Build the end-user app experience on iPhone.

**Owns**
- Onboarding flow
- auth and account linking UI
- Persona Boost UI
- home feed
- card actions and attached follow-up learning UX
- chat UI with unsolicited system prompts
- persona editor
- notification settings
- travel/location and permission UX

**Deliverables**
- SwiftUI app shell and navigation
- Onboarding ending at Persona Boost complete/skip
- Feed UI for 3-8 cards and confidence labels
- Action controls for `I'm in`, `Maybe`, `Pass`, `Can't`
- Quick reasons and optional text on `Pass` and `Can't`
- Attached learning follow-up flow after `Pass` and `Can't`
- Chat thread with unsolicited learning prompts as system messages
- Persona editor for plain-language edits and hard-filter visibility
- Auth screens and consent prompts
- Deep-link handling back from notifications and outbound providers

**Dependencies**
- Agents 2, 5, 6, and 7

**Blocks**
- User-facing beta readiness

**Acceptance**
- Core flows work end to end against staging APIs
- Learning prompts obey session caps and surface rules
- Persona changes are visible and editable in-app immediately after updates

## Agent 9: Proactive Delivery / Push / Email / Scheduling
**Purpose:** Deliver the product’s proactive behavior across channels.

**Owns**
- APNs push pipeline
- weekly digest generation and send pipeline
- interrupt-worthiness evaluation
- shared push budget enforcement
- recommendation-vs-learning push priority
- quiet hours and cooldown rules
- post-activity confirmation prompts

**Deliverables**
- `Proactive Service` scheduling and decision engine
- Recommendation push pipeline with single-rec payloads
- Standalone learning push pipeline
- Shared push-budget and priority enforcement
- Quiet-hours enforcement and 6-hour push cooldown
- Weekly digest generation with 3-item target when at least 2 qualify
- Post-activity follow-up prompt scheduler
- Delivery telemetry for opens, taps, and answer outcomes

**Dependencies**
- Agents 2, 5, and 6

**Blocks**
- Beta launch quality
- Agent 10 notification audit views

**Acceptance**
- Recommendation pushes always outrank learning pushes
- Cooldown and quiet-hour logic are enforced correctly
- Digest and push payloads deep-link back to the right surfaces

## Agent 10: Internal Ops Console / Audit / Debugging
**Purpose:** Give operators visibility into a complex adaptive system.

**Owns**
- Internal web console
- persona timelines
- event replay inspection
- recommendation audit
- learning-question and answer audit
- notification logs
- source-health views
- feature-flag toggles

**Deliverables**
- Operator authentication and role gating
- User-level persona timeline view
- Event replay/debug screen
- Recommendation explanation inspection screen
- Learning prompt history and cadence screen
- Notification delivery and suppression logs
- Provider/source health dashboard
- Feature-flag management UI

**Dependencies**
- Agents 2, 3, 4, 5, 6, and 9

**Blocks**
- Beta supportability
- Fast tuning and incident triage

**Acceptance**
- Operators can explain why a recommendation or learning prompt happened
- Operators can trace persona changes to concrete events and inputs

## Agent 11: QA / Simulation / Reliability
**Purpose:** Build the test harnesses needed to trust adaptive behavior.

**Owns**
- Deterministic simulation framework
- ranking fixtures
- persona replay tests
- proactive scheduling tests
- privacy and deletion tests
- end-to-end smoke tests

**Deliverables**
- Replayable fixture library for:
- action sequences
- contradictory behavior
- learning answers
- hard-filter promotion
- push suppression
- travel/location transitions
- Test suites for all critical plan rules
- Staging smoke tests across auth, feed, chat, push, and persona edit flows
- Regression suite for event-sourced rebuild correctness

**Dependencies**
- Parallel with all backend agents after contracts stabilize

**Blocks**
- Beta launch signoff

**Acceptance**
- Core behavioral rules are covered by deterministic tests
- Regression failures clearly identify which contract or rule changed

## Recommended Execution Order
1. Agent 0 defines contracts, repo structure, and service boundaries.
2. Agent 1 establishes backend/platform foundations.
3. Agents 2, 3, and 4 run in parallel once foundation is stable.
4. Agents 5 and 6 start as soon as persona state and inventory contracts are usable.
5. Agent 7 starts once typed AI inputs/outputs are fixed.
6. Agent 8 starts app-shell work early, then integrates progressively with 2/5/6/7.
7. Agent 9 starts after ranking and learning service contracts stabilize.
8. Agent 10 builds audit views as soon as event and decision logs exist.
9. Agent 11 runs throughout, but formal signoff begins once core flows are integrated.

## Cross-Agent Handoff Contracts
- Agent 0 -> all: shared schema package and API contract docs
- Agent 3 -> Agents 5/6/7/10/11: event model, snapshot shape, replay interface
- Agent 4 -> Agents 5/9/10/11: normalized inventory schema and availability signals
- Agent 5 -> Agents 7/8/9/11: ranked cards, confidence labels, explanation facts
- Agent 6 -> Agents 8/9/10/11: action semantics, learning-question contract, cadence outputs
- Agent 7 -> Agent 8: chat responses, polished explanations, boost inference proposal shapes
- Agent 9 -> Agents 8/10/11: delivery payload schema, deep-link rules, telemetry events

## Suggested Parallel Spawn Map
- `Agent A`: Agent 1 Foundation / Platform Backend
- `Agent B`: Agent 3 Data Model / Event Store / Persona Snapshot
- `Agent C`: Agent 4 Inventory / Provider Integration / Normalization
- `Agent D`: Agent 2 Identity / Consent / Privacy
- `Agent E`: Agent 5 Recommendation / Ranking / Diversity Engine
- `Agent F`: Agent 6 Persona Logic / Feedback / Learning Engine
- `Agent G`: Agent 7 AI Layer / Chat / Persona Boost / Explanation Polish
- `Agent H`: Agent 8 iOS App / UX Surfaces
- `Agent I`: Agent 9 Proactive Delivery / Push / Email / Scheduling
- `Agent J`: Agent 10 Internal Ops Console / Audit / Debugging
- `Agent K`: Agent 11 QA / Simulation / Reliability

## Definition Of Done For V1
- A Seattle beta user can onboard, complete or skip Persona Boost, and receive an initial feed.
- The user can act on feed cards with `I'm in`, `Maybe`, `Pass`, and `Can't`.
- `Pass` and `Can't` can trigger reasons and attached learning follow-ups.
- Standalone learning nudges can be sent by push, expire after 60 minutes, and later reappear in chat if still useful.
- The persona updates immediately from actions, chat, boost inferences, and learning answers.
- Recommendations, pushes, and digests respect exploration, diversity, quiet hours, and shared push budget rules.
- Operators can audit why recommendations and learning prompts were sent.
- Core adaptive behavior is covered by deterministic replay and simulation tests.
