# LetsGo V1 Spawn Plan

## Summary
This document converts the implementation breakdown into a practical sub-agent spawn plan. It is designed for parallel execution with minimal overlap and minimal coordinator intervention. Each spawned agent gets:
- a narrow ownership boundary
- an explicit write scope
- clear dependencies
- a concrete definition of done
- a ready-to-send prompt

The safest execution model is staged parallelism:
1. stabilize shared contracts
2. spawn foundation/data/inventory/identity in parallel
3. spawn ranking/persona/AI in parallel
4. spawn client/proactive/ops/QA in parallel
5. run integration and gap-fix passes

## Coordinator Rules
- Do not let multiple agents edit the same files unless one is explicitly integrating the other’s changes.
- Freeze shared schemas before broad parallel implementation.
- Prefer backend-first contract stabilization before large iOS and ops work.
- Keep one coordinator agent responsible for merge order and interface changes.
- If contract churn appears, pause downstream agents and reissue prompts with updated interfaces.

## Batch 0: Coordinator / Contract Lock

### Agent C0: Integration Coordinator
**Type:** Main coordinator or strongest worker

**Owns**
- final repo/package layout
- shared schema package
- API contract lock
- service boundary lock
- merge sequencing

**Write scope**
- shared schema package
- API contract docs
- architecture docs
- top-level repo scaffolding files

**Definition of done**
- shared types are defined
- endpoint contracts are fixed for v1
- service boundaries are documented
- downstream agents can work without making product decisions

**Spawn prompt**
```text
Own the integration contract for LetsGo v1. Your job is to lock the repository/package structure, shared domain schemas, and public/internal service contracts so parallel agents can implement without reinterpreting the product.

Primary outputs:
- shared types for InventoryItem, PersonaEvent, PersonaSnapshot, BoostInference, RecommendationCard, LearningQuestion, LearningAnswer, ProactiveDecision
- endpoint contracts for feed, actions, chat, persona, persona boost, notifications, learning prompt/answer, account deletion
- service boundary definitions for Persona, Recommendation, Feedback, Chat, Proactive, Learning
- repo/package layout and dependency rules

Constraints:
- do not implement broad feature logic unless needed to define interfaces
- keep contracts aligned to LETSGO_V1_PLAN.md and LETSGO_AGENT_TASK_BREAKDOWN.md
- you are not alone in the codebase; do not revert others’ work

Deliverable:
- committed schema/contracts/docs layer ready for downstream implementation
- list the exact files you changed
```

## Batch 1: Foundation Parallel Set
Spawn only after C0 has locked contracts.

### Agent A1: Platform Backend
**Type:** worker

**Owns**
- backend scaffold
- config system
- migrations
- REST shell
- queue/job framework
- logging/metrics/feature flags

**Write scope**
- backend app bootstrap files
- infra/config files
- migration framework
- queue/scheduler foundation

**Depends on**
- C0 contract lock

**Definition of done**
- backend boots locally
- migrations run
- API shell exists
- jobs can be scheduled

**Spawn prompt**
```text
You own LetsGo backend/platform foundation. Implement the TypeScript/Node backend scaffold, config loading, Postgres/migrations, REST server shell, queue/scheduler base, structured logging, and feature-flag plumbing.

Write scope:
- backend bootstrap and service skeleton
- migration setup
- config/env handling
- queue/job framework
- shared middleware and observability foundation

Constraints:
- follow the shared contracts already defined
- do not implement ranking, persona behavior, or iOS UI
- you are not alone in the codebase; do not revert others’ work

Deliverable:
- runnable backend foundation
- exact files changed
```

### Agent A2: Identity / Consent / Privacy
**Type:** worker

**Owns**
- auth flows
- linked identities
- consent records
- notification preference storage
- deletion/anonymization flow

**Write scope**
- auth modules
- user/identity/consent models
- deletion workflows
- preference endpoints/storage

**Depends on**
- C0
- preferably A1 foundation

**Definition of done**
- one user can authenticate with supported methods
- identities can link
- consent records persist
- delete/anonymize flow works

**Spawn prompt**
```text
You own identity, consent, and privacy for LetsGo v1. Implement Apple/Google/email auth support, linked identities, consent records, channel-only notification preferences, and account deletion with anonymization.

Write scope:
- auth modules
- user, identity, consent, notification-preference, and deletion/anonymization data paths

Constraints:
- follow locked contracts
- do not edit ranking, learning, inventory, or client UI code
- you are not alone in the codebase; do not revert others’ work

Deliverable:
- working auth/privacy backend slice
- exact files changed
```

### Agent A3: Event Store / Persona Snapshot Backbone
**Type:** worker

**Owns**
- event schema persistence
- snapshot persistence
- replay engine
- plain-language persona projection base

**Write scope**
- event/snapshot models
- replay logic
- projection layer

**Depends on**
- C0
- preferably A1 foundation

**Definition of done**
- persona state can be rebuilt from events
- snapshot storage and replay are deterministic

**Spawn prompt**
```text
You own the LetsGo persona state backbone. Implement PersonaEvent persistence, PersonaSnapshot persistence, deterministic replay from events to snapshot, and the base plain-language persona projection model.

Write scope:
- event store
- snapshot store
- replay/rebuild logic
- persona projection support

Constraints:
- do not implement recommendation ranking or active learning policy yet
- follow the shared schemas exactly
- you are not alone in the codebase; do not revert others’ work

Deliverable:
- deterministic event-sourced persona backbone
- exact files changed
```

### Agent A4: Inventory / Provider Normalization
**Type:** worker

**Owns**
- provider adapter interface
- events/dining/outdoors adapters
- normalized inventory storage
- nightly refresh
- same-day availability validation

**Write scope**
- provider integration modules
- normalization layer
- inventory models/storage/jobs

**Depends on**
- C0
- preferably A1 foundation

**Definition of done**
- normalized Seattle inventory exists for launch pillars
- refresh and availability checks run

**Spawn prompt**
```text
You own LetsGo inventory ingestion and normalization. Implement the provider adapter framework, one adapter each for events, dining, and outdoors, normalized InventoryItem persistence, nightly refresh, and same-day availability validation.

Write scope:
- provider adapters
- normalization logic
- inventory storage and jobs

Constraints:
- do not implement ranking or push delivery
- keep nightlife as secondary dining metadata only
- you are not alone in the codebase; do not revert others’ work

Deliverable:
- rankable normalized inventory pipeline
- exact files changed
```

## Batch 2: Core Intelligence Parallel Set
Spawn after A3 and A4 are stable enough to build against.

### Agent B1: Recommendation / Ranking Engine
**Type:** worker

**Owns**
- feed ranking
- hard-filter application
- UCB exploration
- diversity pass
- confidence labels
- explanation facts

**Write scope**
- recommendation service
- feed scoring logic
- feed API assembly

**Depends on**
- C0
- A3
- A4

**Definition of done**
- `GET /feed` returns valid cards with scoring, exploration, diversity, and explanation facts

**Spawn prompt**
```text
You own LetsGo recommendation ranking. Implement candidate retrieval, hard-filter application, feed scoring, UCB exploration, elastic feed sizing, strict diversity rules, confidence label mapping, and structured explanation facts used by the UI and AI layer.

Write scope:
- recommendation service
- feed ranker
- feed response assembly

Constraints:
- use the locked contracts
- do not implement persona update rules or push scheduling
- you are not alone in the codebase; do not revert others’ work

Deliverable:
- working GET /feed path with deterministic ranking behavior
- exact files changed
```

### Agent B2: Persona Logic / Feedback / Learning Engine
**Type:** worker

**Owns**
- action semantics
- ambiguity-first persona updates
- decay
- hard-filter promotion
- active learning selector
- learning budget/cadence
- learning answer ingestion

**Write scope**
- feedback service
- persona update rules
- learning service
- action and learning endpoints

**Depends on**
- C0
- A3
- preferably B1 contracts for immediate rerank hooks

**Definition of done**
- actions and learning answers correctly update persona state
- cadence and TTL rules are enforced

**Spawn prompt**
```text
You own LetsGo persona behavior, feedback semantics, and active learning. Implement action handling for I'm in / Maybe / Pass / Can't, ambiguity-first negative logic, circumstance handling, contradiction-aware decay, hard-filter promotion, learning-question selection, shared learning budget, cadence updates, attached follow-up eligibility, TTL logic, and learning-answer ingestion.

Write scope:
- feedback and persona-update logic
- learning service
- actions endpoint behavior
- learning answer endpoint behavior

Constraints:
- do not change shared schemas without coordinator approval
- do not implement push transport or iOS UI
- you are not alone in the codebase; do not revert others’ work

Deliverable:
- fully working persona/learning backend slice
- exact files changed
```

### Agent B3: AI Layer / Chat / Persona Boost / Explanation Polish
**Type:** worker

**Owns**
- LLM gateway
- chat extraction
- Persona Boost extraction
- explanation polishing
- hybrid question generation fallback

**Write scope**
- AI service modules
- prompt/validation layer
- chat orchestration

**Depends on**
- C0
- A3
- B1 explanation facts contract
- B2 learning question contract

**Definition of done**
- AI outputs validate into typed structures and never write state directly

**Spawn prompt**
```text
You own the bounded AI layer for LetsGo v1. Implement the single-provider LLM gateway, schema-validated chat extraction, Persona Boost inference extraction, explanation polishing from structured reason facts, and hybrid learning-question generation fallback.

Write scope:
- AI gateway
- prompt/validation modules
- chat and boost orchestration
- explanation/question generation support

Constraints:
- all outputs must validate into typed structures
- do not directly mutate persona state
- you are not alone in the codebase; do not revert others’ work

Deliverable:
- safe typed AI layer integrated to backend contracts
- exact files changed
```

## Batch 3: Product Surface Parallel Set
Spawn after core backend paths are stable enough for integration.

### Agent C1: iOS App / User Experience
**Type:** worker

**Owns**
- SwiftUI app shell
- onboarding
- Persona Boost UI
- home feed
- actions and attached follow-ups
- chat UI
- persona editor
- deep links

**Write scope**
- iOS app files only

**Depends on**
- C0
- A2
- B1
- B2
- B3

**Definition of done**
- user can onboard, view feed, take actions, answer learning prompts, chat, and edit persona

**Spawn prompt**
```text
You own the LetsGo iPhone app. Implement the SwiftUI app shell, onboarding flow, Persona Boost complete/skip flow, feed UI, card actions, Pass/Can't reason flow, attached learning follow-ups, chat thread with unsolicited system prompts, plain-language persona editor, notification settings, and deep-link handling.

Write scope:
- iOS app files only

Constraints:
- do not edit backend business logic unless absolutely necessary for integration and coordinated
- follow the locked API contracts
- you are not alone in the codebase; do not revert others’ work

Deliverable:
- end-user iOS surface integrated to staging/backend contracts
- exact files changed
```

### Agent C2: Proactive Delivery / Push / Email Scheduling
**Type:** worker

**Owns**
- proactive scheduler
- interrupt scoring
- recommendation-vs-learning push priority
- quiet hours
- 6-hour cooldown
- APNs integration
- weekly digest pipeline
- post-activity confirmation scheduling

**Write scope**
- proactive service
- notification delivery modules
- digest jobs

**Depends on**
- C0
- A2
- B1
- B2

**Definition of done**
- push and digest delivery logic respects plan rules

**Spawn prompt**
```text
You own LetsGo proactive delivery. Implement the proactive scheduler, interrupt-worthiness evaluation, shared push budget, recommendation-over-learning push priority, quiet hours, 6-hour cooldown, APNs delivery integration, weekly digest assembly/sending, and post-activity confirmation prompts.

Write scope:
- proactive service
- push/email scheduling and delivery modules

Constraints:
- recommendation pushes always outrank learning pushes
- use one shared push budget
- you are not alone in the codebase; do not revert others’ work

Deliverable:
- working proactive delivery pipeline
- exact files changed
```

### Agent C3: Internal Ops Console
**Type:** worker

**Owns**
- ops web console
- persona timeline
- event replay inspection
- recommendation audit
- learning audit
- notification logs
- source health
- feature flags UI

**Write scope**
- internal web console files only

**Depends on**
- C0
- A2
- A3
- A4
- B1
- B2
- C2

**Definition of done**
- operator can explain why a recommendation or learning prompt happened

**Spawn prompt**
```text
You own the LetsGo internal ops console. Implement operator auth, user lookup, persona timeline, event inspection, replay-vs-snapshot comparison, recommendation audit, learning audit, notification logs, source-health dashboard, and feature-flag UI.

Write scope:
- internal ops console only

Constraints:
- do not change core backend rules except where coordinated for required audit fields
- you are not alone in the codebase; do not revert others’ work

Deliverable:
- usable internal audit/debug console
- exact files changed
```

### Agent C4: QA / Simulation / Reliability
**Type:** worker

**Owns**
- deterministic simulations
- replay tests
- rule-based regression suite
- end-to-end smoke tests

**Write scope**
- test files
- fixtures
- simulation harness

**Depends on**
- C0
- should start once contracts are stable and expand as services land

**Definition of done**
- critical behavioral rules are covered by deterministic tests

**Spawn prompt**
```text
You own LetsGo QA, simulation, and reliability harnesses. Build deterministic replay/simulation fixtures and tests covering action semantics, ambiguity-first negatives, learning cadence, shared learning budget, TTL behavior, cooldown rules, immediate reranking, hard-filter promotion, sensitive-topic gating, travel behavior, and deletion/anonymization.

Write scope:
- tests
- fixtures
- simulation harnesses

Constraints:
- do not refactor production code unless needed for testability and coordinated
- you are not alone in the codebase; do not revert others’ work

Deliverable:
- reliable regression/simulation coverage for v1 rules
- exact files changed
```

## Suggested Spawn Order

### Wave 1
- C0 Integration Coordinator

Wait for:
- shared schemas locked
- endpoint contracts locked
- package layout locked

### Wave 2
- A1 Platform Backend
- A2 Identity / Consent / Privacy
- A3 Event Store / Persona Snapshot Backbone
- A4 Inventory / Provider Normalization

Wait for:
- backend scaffold exists
- event/snapshot contract usable
- normalized inventory contract usable

### Wave 3
- B1 Recommendation / Ranking Engine
- B2 Persona Logic / Feedback / Learning Engine
- B3 AI Layer / Chat / Persona Boost / Explanation Polish

Wait for:
- feed path stable
- actions/learning contract stable
- AI typed output contract stable

### Wave 4
- C1 iOS App / User Experience
- C2 Proactive Delivery / Push / Email Scheduling
- C3 Internal Ops Console
- C4 QA / Simulation / Reliability

### Wave 5
- Coordinator-led integration pass
- bug-fix respawns for any agent whose surface fails integration

## Minimal First Demo Spawn Set
If you want the smallest useful parallel run first:
- C0 Integration Coordinator
- A1 Platform Backend
- A3 Event Store / Persona Snapshot Backbone
- A4 Inventory / Provider Normalization
- B1 Recommendation / Ranking Engine
- B2 Persona Logic / Feedback / Learning Engine
- C1 iOS App / User Experience

This gives you:
- onboarding and feed
- actions and persona updates
- basic learning follow-ups
- enough surface area to validate the product loop before adding full proactive delivery, ops, and privacy hardening

## Full Parallel Spawn Set
- `Coordinator`: C0
- `Worker 1`: A1
- `Worker 2`: A2
- `Worker 3`: A3
- `Worker 4`: A4
- `Worker 5`: B1
- `Worker 6`: B2
- `Worker 7`: B3
- `Worker 8`: C1
- `Worker 9`: C2
- `Worker 10`: C3
- `Worker 11`: C4

## Coordinator Checklist During Execution
- Confirm downstream agents are using the latest schema package before merging.
- Review B2 carefully because persona semantics and active learning affect most other surfaces.
- Integrate B1 before C2 so proactive delivery never invents its own candidate logic.
- Keep C1 and C3 out of backend semantic changes unless coordinated.
- Require every worker to report exact files changed and any contract assumptions made.
- Run C4 simulation/regression suite after every major integration wave.

## Merge Order Recommendation
1. C0
2. A1
3. A3
4. A2
5. A4
6. B1
7. B2
8. B3
9. C2
10. C1
11. C3
12. C4

## Red Flags To Watch
- Shared schema churn after Wave 2
- B2 changing semantics after C1 and C2 have integrated
- A4 producing inventory shapes that force B1 to reinterpret categories late
- B3 introducing opaque AI outputs that bypass typed validation
- C2 creating delivery logic that drifts from ranking/learning contracts
- C3 requiring audit fields that were never emitted by backend services
