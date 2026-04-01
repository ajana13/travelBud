# LetsGo V1 Comprehensive Plan

## Purpose Of This Document

This is the single authoritative reference for the LetsGo V1 system. It is designed so that any LLM agent can read this document, inspect the codebase, and independently determine what has been built, what is missing, and how to implement any remaining work. It integrates product specification, system architecture, service contracts, agent ownership boundaries, multi-agent execution strategy, platform abstraction, and behavioral test requirements into one self-contained document.

To assess progress: compare each section's specification against the actual codebase. Every function, service, endpoint, and behavioral rule described here has a concrete implementation target.

---

## 1. Product Overview

LetsGo V1 is an invite-only Seattle beta for local discovery, delivered as a native iPhone app with push notifications, a weekly email digest, and an in-app chat surface.

### 1.1 Launch Scope

- Market: Seattle only
- Target user: single 21+ user (invite-only beta)
- Client: iPhone-first (native SwiftUI)
- Auth: Apple, Google, email
- Discovery pillars: events, dining, outdoors (nightlife is secondary dining subcategory)
- Product vision: broad local discovery, but launch quality is guaranteed for three pillars only
- In-app booking is out of scope; all items deep-link out to provider surfaces
- Out of scope: Android, consumer web, group planning, export

### 1.2 Core Product Loop

```
User onboards -> Persona Boost (optional) -> Feed (3-8 cards)
    -> Actions (I'm in / Maybe / Pass / Can't)
    -> Chat (conversational preference refinement)
    -> Learning prompts (proactive questions via push/in-app)
    -> Persona evolves -> Feed re-ranks -> Loop continues
```

### 1.3 Hybrid Architecture Philosophy

Deterministic services own inventory, scoring, scheduling, state, and delivery. LLMs are bounded to four uses: chat understanding, Persona Boost inference extraction, explanation polishing, and question generation. Persona state is event-sourced with a current snapshot, and every ranking-relevant inference must remain visible and editable in plain language. Keep embeddings limited to selective retrieval/memory support; final ranking and persona state remain structured.

### 1.4 Core Principles

- The app is persona-first; aggregate cross-user learning is weak prior information only
- Anonymized cross-user data may be used only as weak priors and popularity/context signals
- Brevity wins over explanation inside learning prompts themselves, but any resulting persona change must remain visible/editable afterward
- Active learning is a launch-critical subsystem and must ship behind its own kill switch
- Ops scope is audit-and-debug first, not curation-first

---

## 2. Recommendation And Feedback Model

### 2.1 Action Semantics

| Action | Signal | Persona Effect | Follow-up Eligible |
|--------|--------|----------------|-------------------|
| I'm in | Strong positive | +0.3 weight to item tags; may trigger post-activity confirmation | No |
| Maybe | Neutral | +0.1 weight; creates resurfacing and reminder eligibility but does not directly change preference scores | No |
| Pass | Discounted negative (ambiguity-first) | -0.15 base weight; discounted at low confidence; amplified when contradicting positive | Yes |
| Can't | Circumstantial | Zero weight change | Yes |

### 2.2 Ambiguity-First Negative Logic

- Pass on a tag with no prior signal: apply weight at half strength (ambiguity discount)
- Pass contradicting a positive signal: apply weight at 1.5x (contradiction amplification)
- Pass on an already-negative tag with low absolute value: apply at half strength
- Negative confidence decays toward neutral over time
- Decay accelerates when later behavior contradicts prior assumptions

### 2.3 Hard-Filter Promotion

- Tags accumulating negative scores past a threshold auto-promote to hard filters
- Every active hard filter must appear in the plain-language persona editor
- Hard filters are visible, editable, and toggleable by the user

### 2.4 Feed Diversity And Travel

- Feed diversity is strict across pillar, time shape, social mode, and price band unless inventory is too sparse
- Ranking uses balanced exploration with 1-2 exploration cards in a normal 6-card feed and never more than 2 exploration cards in one feed or digest
- Travel behavior keeps one stable home persona while ranking local inventory from current location when the user is clearly away
- Use one provider adapter per launch pillar first; do not build generalized multi-provider merge logic until adapters are stable

### 2.5 Attached Follow-Up Rules

- Follow-ups are allowed only after Pass or Can't
- Follow-ups query the learning service for the highest-value question
- Follow-ups count against the shared learning budget
- Ignored follow-ups reduce overall learning cadence

---

## 3. Persona Boost And Trust Model

- Persona Boost is opt-in and happens before the first real feed is shown
- Persona Boost may use email-based discovery from public sources, but not create hidden ranking-only signals
- Every accepted boost-derived inference must become visible and editable in the persona UI
- Persona UI is plain-language only. Users see and edit preferences, constraints, and summaries, not raw scores or internal numeric confidence
- Chat auto-applies most persona updates, but every applied change must be logged, visible, and reversible
- Account deletion is in-product. Historical events are anonymized rather than fully purged, and anonymized cross-user data may be used only as weak priors and popularity/context signals

---

## 4. Active Learning System

### 4.1 Learning Service Responsibilities

- The Learning Service owns question selection, cadence scoring, channel choice, and learning-event generation. It does not write persona state directly.
- Question selection is ranked by expected near-term recommendation lift first, then weak-confidence bias. The value function includes both recommendation uncertainty and proactive-delivery uncertainty.
- Question selection is topic-stateless. The system does not remember "avoid this topic"; ignored questions only reduce overall learning cadence.
- Shared learning budget across standalone nudges and attached follow-ups. Recommendation-attached follow-ups are not free -- they count against the same budget.
- Cadence tracking: answer-based acceleration, ignore-based backoff. Positive engagement means answered questions only; opens, views, and taps without answers do not count.
- Learning cadence starts moderately eager at about 3-4 learning prompts per week total and can continue increasing as long as users keep answering.
- Session-level caps: at most 1 unsolicited in-app learning prompt per app session, at most 2 total learning questions per app session.
- 60-minute TTL for standalone push learning nudges. If ignored, the nudge expires. An expired push learning opportunity may later reappear as an unsolicited in-app chat prompt if it is still valuable.
- Standalone learning uses push first when no stronger recommendation deserves that push slot.

### 4.2 Learning Unlock Prerequisites

- Learning unlocks only after onboarding is complete, Persona Boost is completed or skipped, and the user has produced 3-5 meaningful events (actions, chat updates, or one post-activity confirmation).

### 4.3 Question Sources And Formats

- Hybrid: template library for common patterns, LLM generation fallback when templates do not fit
- Question formats are mixed: default to one-tap structured answers, but allow short free-text prompts when nuance is genuinely needed
- Comparative questions are allowed occasionally. Comparative answers produce relative boosts only, not a forced positive/negative split.
- Sensitive topics are allowed, but direct proactive asks must be context-gated by prior behavior, prior chat, or other clear recommendation relevance.

### 4.4 Follow-Up Mechanics

- Attached follow-up questions appear only after the user responds to a recommendation with Pass or Can't
- Attached follow-ups may ask the highest-value loosely related question, not necessarily one strictly tied to the just-acted-on card
- Attached follow-ups may ask about content, timing, or logistics
- Ignored attached follow-ups count against cadence exactly like ignored standalone nudges
- Learning interactions may be single-question or use one follow-up only
- If a push-based learning question needs that one follow-up, the follow-up may happen only in in-app chat

### 4.5 Learning Answer Processing

- Answers update persona immediately and trigger feed re-ranking where practical
- New explicit learning answers temporarily outrank older inferred signals
- Learning-answer signals decay over time and decay faster when contradicted by later behavior
- Attached follow-up answers and standalone learning answers are identical in weighting, precedence, and decay
- The learning subsystem's primary success metric is downstream recommendation lift, not answer rate

### 4.6 In-App Learning Prompt UX

- Unsolicited in-app learning prompts appear as a system message in the chat thread, with a badge or hint drawing the user there. They do not appear as modals.

---

## 5. System Architecture

### 5.1 Technology Stack

- Backend: TypeScript serverless functions, platform-agnostic via port/adapter abstraction
- Database: Postgres with append-only events + current snapshots (any managed or self-hosted provider)
- Client: Native iPhone (SwiftUI)
- AI: Single LLM provider with schema-validated outputs (provider-swappable)
- Ops Console: Internal web app
- Validation: Zod schemas for runtime type safety
- Testing: Vitest unit tests + live integration test suite

### 5.2 Platform Abstraction Layer

The backend must be decoupled from any specific BaaS provider through a port/adapter pattern:

**Port Interfaces** (platform-agnostic):
- `DatabasePort`: chainable query builder (from/select/insert/update/delete/upsert/eq/order/limit/single/maybeSingle)
- `AuthPort`: authenticate request from Bearer token, return user ID
- `RuntimePort`: environment variable access, secrets retrieval

**Adapter Implementations** (platform-specific, one per deployment target):
- Each adapter implements all three ports using the target platform's SDK or driver
- Example targets: any BaaS with Postgres + auth, cloud-native (Lambda/Cloud Functions + managed Postgres + OAuth), or self-hosted (Express/Fastify + pg driver + JWT)

**Factory**: `getDatabase()`, `getAuth()`, `getRuntime()` return the active adapter. `setPlatform()` allows swapping at initialization. The active adapter is selected by environment configuration, not by code changes.

### 5.3 Service Architecture

```
iOS App (SwiftUI)
    |
    | REST/JSON
    v
API Layer (13 endpoints, serverless or server-hosted)
    |
    +-- Persona Service (sole writer of persona state)
    +-- Recommendation Service (read-only ranking)
    +-- Feedback Service (action normalization -> Persona Service)
    +-- Chat Service (LLM conversation -> Persona Service)
    +-- Learning Service (question selection, cadence, budget)
    +-- Proactive Service (push/email scheduling and delivery)
    |
    v
Platform Abstraction (DatabasePort / AuthPort / RuntimePort)
    |
    v
Postgres (10 tables, any managed or self-hosted provider)
```

### 5.4 Write Ownership Rules

| Service | Owned Tables (Write) | Read Access |
|---------|---------------------|-------------|
| Persona Service | persona_snapshots, persona_events | All tables |
| Recommendation Service | (none -- read only) | persona_snapshots, inventory_items |
| Feedback Service | (writes via Persona Service) | persona_events, inventory_items |
| Chat Service | (writes via Persona Service) | persona_snapshots |
| Learning Service | learning_questions, learning_answers | persona_snapshots, persona_events |
| Proactive Service | proactive_decisions | persona_snapshots, notification_preferences, learning_questions, inventory_items |
| Inventory Service | inventory_items | (none) |
| Identity Service | notification_preferences, consent_records | users (via AuthPort) |

### 5.5 API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /health-check | GET | No | Liveness check |
| /feed | GET | Yes | 3-8 ranked recommendation cards |
| /actions | POST | Yes | Record user action on a card |
| /chat/messages | POST | Yes | Conversational interaction |
| /persona | GET | Yes | Plain-language persona view |
| /persona | PATCH | Yes | Edit preferences and hard filters |
| /persona-boost/start | POST | Yes | Start Persona Boost |
| /persona-boost/status | GET | Yes | Check boost progress |
| /notifications/preferences | POST | Yes | Channel toggles (push/email) |
| /learning/prompt | GET | Yes | Fetch eligible learning question |
| /learning/answer | POST | Yes | Record learning answer |
| /account | DELETE | Yes | Account deletion + anonymization |
| /inventory/seed | POST | No | Seed inventory (dev) |

### 5.6 Domain Types

All shared types have both TypeScript interfaces and Zod runtime validators:

- `InventoryItem`: normalized pillar, tags, location, availability, price band, social mode, deep link
- `PersonaEvent`: append-only event envelope (discriminated union: action, boost_inference, learning_answer, chat_extraction, confirmation, system_decision, persona_edit)
- `PersonaSnapshot`: current preference state, hard filters, cadence state, learning budget, boost state, travel state, plain-language projections
- `BoostInference`: source provenance, confidence, visibility state, acceptance status
- `RecommendationCard`: explanation facts, confidence label, exploration tag, allowed actions
- `LearningQuestion`: topic family, expected lift, confidence gap, channel eligibility, structured answer schema, comparison mode, sensitive flag
- `LearningAnswer`: answer payload, source surface, timestamp, linked question metadata
- `ProactiveDecision`: channel, reason type, interrupt score, suppression reason, selected content ID

### 5.7 Database Schema

11 SQL migration files:
- 001: persona_events (append-only)
- 002: persona_snapshots
- 003: inventory_items
- 004: learning_questions
- 005: learning_answers
- 006: proactive_decisions
- 007: boost_inferences
- 008: notification_preferences
- 009: consent_records
- 010: feature_flags
- 011: RLS policies for all 10 tables

### 5.8 Feature Flags

6 independent feature flags gating: Persona Boost, active learning, proactive pushes, calendar access, significant-location access, nightlife recommendations.

---

## 6. Proactive Delivery System

### 6.1 Push Rules

- Single-recommendation payloads only
- One shared push budget across recommendation and learning pushes
- Recommendation pushes always outrank learning pushes
- Quiet hours: 9pm-8am local time (system default)
- 6-hour minimum separation between proactive pushes
- Standalone learning push nudges expire after 60 minutes
- Expired push nudges may reappear as unsolicited in-app chat prompts

### 6.2 Weekly Digest

- Sends only if at least 2 items qualify
- Targets 3 items
- Never more than 2 exploration cards

### 6.3 Post-Activity Confirmation

- Lightweight prompt after relevant time window following an "I'm in" action

---

## 7. iOS App Specification

### 7.1 Core Flows

- Onboarding ending at Persona Boost complete/skip
- Home feed: 3-8 cards with confidence labels and explanation text
- Card actions: I'm in, Maybe, Pass, Can't
- Quick reasons + optional free text on Pass and Can't
- Attached learning follow-up after Pass and Can't
- Chat thread with unsolicited learning prompts as system messages
- Plain-language persona editor with visible hard filters
- Push/email preference controls
- Deep-link handling from notifications and outbound providers

### 7.2 Session Rules

- At most 1 unsolicited in-app learning prompt per app session
- At most 2 total learning questions per app session
- Immediate feed refresh after learning answers or persona edits

---

## 8. Internal Ops Console

- Operator auth with role gating
- User lookup and persona timeline
- Event stream inspection
- Stored-vs-replayed snapshot comparison
- Recommendation audit (score factors, explanation facts, diversity decisions)
- Learning audit (prompt selection, channel, status, answer, cadence effects)
- Notification logs (pushes, digests, delivery status)
- Source-health dashboard (provider freshness, sync failures)
- Feature-flag management UI

---

## 9. Multi-Agent Execution Model

### 9.1 Design Philosophy

This system is designed for **concurrent implementation by multiple independent LLM agents**. The core insight of agentic development is that software can be decomposed into ownership boundaries where each agent:
- Has a narrow, non-overlapping write scope
- Can execute without making product decisions
- Produces typed outputs that downstream agents build against
- Reports exactly which files it changed

The safest execution model is **staged parallelism**: stabilize shared contracts first, then spawn progressively more agents as stable interfaces emerge.

### 9.2 Agent Roster

14 agents total: 1 coordinator, 13 workers.

| ID | Name | Type | Wave |
|----|------|------|------|
| C0 | Integration Coordinator | Coordinator | 1 |
| A1 | Platform Backend | Worker | 2 |
| A2 | Identity / Consent / Privacy | Worker | 2 |
| A3 | Event Store / Persona Snapshot | Worker | 2 |
| A4 | Inventory / Provider Normalization | Worker | 2 |
| B1 | Recommendation / Ranking Engine | Worker | 3 |
| B2 | Persona Logic / Feedback / Learning | Worker | 3 |
| B3 | AI Layer / Chat / Persona Boost | Worker | 3 |
| P1 | Platform Abstraction | Worker | 3.5 |
| C1 | iOS App / User Experience | Worker | 4 |
| C2 | Proactive Delivery / Push / Email | Worker | 4 |
| C3 | Internal Ops Console | Worker | 4 |
| C4 | QA / Simulation / Reliability | Worker | 4 |

### 9.3 Execution Waves And Gate Conditions

**Wave 1 -- Coordinator (sequential, 1 agent)**

Agent C0 runs alone. No other agent may start until C0 is complete.

Gate to Wave 2:
- Shared type schemas are defined and compile
- Endpoint contracts are locked for v1
- Service boundaries are documented
- Package layout and dependency rules are committed

**Wave 2 -- Foundation (parallel, 4 agents)**

Agents A1, A2, A3, A4 run concurrently. Each depends only on C0's locked contracts.

Gate to Wave 3:
- Backend scaffold exists and boots locally
- Event/snapshot persistence contract is usable
- Normalized inventory contract is usable
- Auth flow works for at least one method

**Wave 3 -- Core Intelligence (parallel, 3 agents)**

Agents B1, B2, B3 run concurrently. Each depends on C0 + specific Wave 2 outputs.

Gate to Wave 3.5 and Wave 4:
- `GET /feed` path is stable and returns valid ranked cards
- `POST /actions` and `POST /learning/answer` contract is stable
- AI typed output contract is stable (all LLM outputs validate into typed structures)

**Wave 3.5 -- Platform Abstraction (parallel with Wave 4, 1 agent)**

Agent P1 can run concurrently with Wave 4 agents since it only changes import paths and initialization, not business logic.

Gate to Wave 5:
- All services import from platform factory, not from provider-specific SDKs
- All existing tests pass without logic changes
- At least one adapter implementation exists

**Wave 4 -- Product Surfaces (parallel, 4 agents)**

Agents C1, C2, C3, C4 run concurrently. Each depends on stable Wave 3 contracts.

Gate to Wave 5:
- iOS app connects to staging APIs end-to-end
- Push and digest delivery logic respects all plan rules
- Ops console can explain why a recommendation or learning prompt happened
- Critical behavioral rules are covered by deterministic tests

**Wave 5 -- Integration (coordinator-led)**

Coordinator C0 leads cross-agent integration, bug-fix respawns, staging signoff, feature-flag tuning, and invite-only rollout prep.

### 9.4 Full Parallel Spawn Topology

When maximum parallelism is desired, agents map to concurrent workers:

- Coordinator: C0
- Worker 1: A1
- Worker 2: A2
- Worker 3: A3
- Worker 4: A4
- Worker 5: B1
- Worker 6: B2
- Worker 7: B3
- Worker 8: P1
- Worker 9: C1
- Worker 10: C2
- Worker 11: C3
- Worker 12: C4

### 9.5 Minimal First Demo Spawn Set

For the smallest useful parallel run to validate the core product loop:

- C0: shared contracts
- A1: backend scaffold, migrations, API shell
- A3: event store + persona snapshot
- A4: one provider per launch pillar
- B1: feed ranking and `GET /feed`
- B2: `POST /actions` + basic persona updates
- C1: onboarding, feed, action flows

This gives: onboarding -> feed -> actions -> persona updates -> feed re-ranks, enough to validate the product loop before adding proactive delivery, ops, and privacy hardening.

### 9.6 Coordinator Rules

- Do not let multiple agents edit the same files unless one is explicitly integrating the other's changes
- Freeze shared schemas before broad parallel implementation
- Prefer backend-first contract stabilization before large iOS and ops work
- Keep one coordinator agent responsible for merge order and interface changes
- If contract churn appears, pause downstream agents and reissue prompts with updated interfaces
- Run C4 simulation/regression suite after every major integration wave
- Review B2 carefully because persona semantics and active learning affect most other surfaces
- Integrate B1 before C2 so proactive delivery never invents its own candidate logic
- Keep C1 and C3 out of backend semantic changes unless coordinated
- Require every worker to report exact files changed and any contract assumptions made

### 9.7 Coordinator Execution Checklist

During each wave, the coordinator must:
1. Confirm downstream agents are using the latest schema package before merging
2. Verify each agent's deliverable against its definition of done
3. Check for file ownership conflicts before merging any agent's work
4. Run the full test suite after each agent merge
5. Update the state tracker with completed deliverables
6. Reissue prompts to any agent whose surface fails integration

### 9.8 Merge Order

C0 -> A1 -> A3 -> A2 -> A4 -> P1 -> B1 -> B2 -> B3 -> C2 -> C1 -> C3 -> C4

### 9.9 Cross-Agent Handoff Contracts

Each arrow represents a typed interface that the upstream agent produces and the downstream agent builds against:

- C0 -> all: shared schema package, API contract docs, platform port interfaces
- A3 -> B1/B2/B3/C3/C4: event model, snapshot shape, replay interface
- A4 -> B1/C2/C3/C4: normalized inventory schema, availability signals
- P1 -> all: platform factory API (`getDatabase()`, `getAuth()`, `getRuntime()`)
- B1 -> B3/C1/C2/C4: ranked cards, confidence labels, explanation facts
- B2 -> C1/C2/C3/C4: action semantics, learning-question contract, cadence outputs
- B3 -> C1/C3: chat responses, polished explanations, boost inference shapes
- C2 -> C1/C3/C4: delivery payload schema, deep-link rules, telemetry events

### 9.10 Red Flags To Watch

- Shared schema churn after Wave 2 -- indicates C0 did not lock contracts properly
- B2 changing semantics after C1 and C2 have integrated -- forces cascading rework
- A4 producing inventory shapes that force B1 to reinterpret categories late
- B3 introducing opaque AI outputs that bypass typed validation
- C2 creating delivery logic that drifts from ranking/learning contracts
- C3 requiring audit fields that were never emitted by backend services
- Platform abstraction breaking the function bundling or deployment pipeline
- Any agent reverting another agent's committed work

---

## 10. Agent Cards (Structured Spawn Specifications)

Each agent card below is a self-contained specification. An LLM agent can be spawned with only its card and the shared schema package -- it should not need access to this master plan or to other agents' cards.

Every card contains: **Owns** (what this agent is responsible for), **Write Scope** (files this agent may create or modify), **Depends On** (what must exist before this agent starts), **Definition of Done** (concrete exit criteria), and **Spawn Prompt** (the actual prompt to send to the agent).

---

### 10.1 Agent C0: Integration Coordinator

**Type:** Coordinator

**Owns**
- Final repo/package layout
- Shared schema package (all 8 domain types)
- API contract lock (all 13 endpoints)
- Service boundary definitions
- Platform abstraction port interfaces
- Merge sequencing across all agents

**Write Scope**
- Shared schema package
- API contract docs
- Architecture docs
- Top-level repo scaffolding
- Platform port interface definitions

**Depends On**
- Nothing. Starts first.

**Blocks**
- Every other agent if contracts are unstable

**Definition of Done**
- Shared types compile cleanly
- Endpoint contracts are fixed for v1
- Service boundaries are documented
- Platform port interfaces are defined
- Downstream agents can work without making product decisions

**P1 Tickets**
- Publish service interaction diagram and critical-path sequence diagrams for feed generation, learning prompt generation, and push delivery
- Define error taxonomy and user-visible failure behavior across app, backend, and AI surfaces
- Define integration test contract checklist for cross-service signoff

**P2 Tickets**
- Maintain architecture decision log as implementation discoveries appear
- Define migration and schema-change playbook for parallel contributors

**Spawn Prompt**
```
Own the integration contract for LetsGo v1. Your job is to lock the repository/package structure, shared domain schemas, public/internal service contracts, and platform abstraction port interfaces so parallel agents can implement without reinterpreting the product.

Primary outputs:
- shared types for InventoryItem, PersonaEvent, PersonaSnapshot, BoostInference, RecommendationCard, LearningQuestion, LearningAnswer, ProactiveDecision
- endpoint contracts for all 13 endpoints
- service boundary definitions for Persona, Recommendation, Feedback, Chat, Proactive, Learning
- repo/package layout and dependency rules
- platform port interfaces (DatabasePort, AuthPort, RuntimePort)

Constraints:
- do not implement broad feature logic unless needed to define interfaces
- you are not alone in the codebase; do not revert others' work

Deliverable:
- committed schema/contracts/docs layer ready for downstream implementation
- list the exact files you changed
```

---

### 10.2 Agent A1: Platform Backend

**Type:** Worker

**Owns**
- Backend scaffold and bootstrapping
- Config system (local/dev/prod)
- Database migration framework
- REST API shell with auth middleware hooks
- Queue/job/scheduler foundation
- Structured logging, metrics, feature flags

**Write Scope**
- Backend app bootstrap files
- Infra/config files
- Migration framework
- Queue/scheduler foundation

**Depends On**
- C0 contract lock

**Blocks**
- A2, A3, A4, B1, B2, B3

**Definition of Done**
- Backend boots locally
- Migrations run cleanly
- API shell exists with request validation and typed error responses
- Background jobs can be scheduled
- Feature-flag evaluation works

**P1 Tickets**
- Add metrics and tracing hooks for API latency, queue throughput, and job failures
- Add shared secrets/config management integration for cloud deploys
- Add local development bootstrap scripts and seed hooks

**P2 Tickets**
- Add rate-limiting middleware for public endpoints
- Add circuit-breaker or retry utilities for external provider integrations and LLM calls

**Spawn Prompt**
```
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
- you are not alone in the codebase; do not revert others' work

Deliverable:
- runnable backend foundation
- list the exact files you changed
```

---

### 10.3 Agent A2: Identity / Consent / Privacy

**Type:** Worker

**Owns**
- Auth flows (Apple, Google, email)
- Linked identities
- Consent records
- Notification preference storage
- Account deletion/anonymization workflow

**Write Scope**
- Auth modules
- User/identity/consent models
- Deletion workflows
- Preference endpoints/storage

**Depends On**
- C0, preferably A1 foundation

**Blocks**
- C1 (iOS onboarding/auth), C2 (push/email delivery enablement), C4 (compliance tests)

**Definition of Done**
- One user can authenticate with supported methods
- Identities can link to one user
- Consent records persist
- Delete/anonymize flow works
- Channel-only notification preferences can be saved

**P1 Tickets**
- Add audit log entries for auth, consent changes, and deletion requests
- Add recovery and conflict-handling flows for duplicate email or provider-link collisions
- Add internal admin lookup for user identity resolution during support

**P2 Tickets**
- Add account-session revocation and device/session management
- Add notification preference change history for ops visibility

**Spawn Prompt**
```
You own identity, consent, and privacy for LetsGo v1. Implement Apple/Google/email auth support, linked identities, consent records, channel-only notification preferences, and account deletion with anonymization.

Write scope:
- auth modules
- user, identity, consent, notification-preference, and deletion/anonymization data paths

Constraints:
- follow locked contracts
- do not edit ranking, learning, inventory, or client UI code
- you are not alone in the codebase; do not revert others' work

Deliverable:
- working auth/privacy backend slice
- list the exact files you changed
```

---

### 10.4 Agent A3: Event Store / Persona Snapshot Backbone

**Type:** Worker

**Owns**
- PersonaEvent append-only persistence
- PersonaSnapshot persistence and rebuild
- Deterministic replay engine
- Plain-language persona projection base
- Provenance and reversibility support for chat and boost updates

**Write Scope**
- Event/snapshot models and storage
- Replay logic
- Projection layer

**Depends On**
- C0, preferably A1 foundation

**Blocks**
- B1, B2, B3, C3, C4

**Definition of Done**
- Persona state can be rebuilt deterministically from events
- Snapshot storage and replay produce identical results
- Plain-language projection remains consistent with underlying model

**P1 Tickets**
- Add snapshot rebuild command for one user
- Add snapshot rebuild job for many users or backfills
- Add event replay diff tooling to compare replayed vs stored snapshot

**P2 Tickets**
- Add snapshot compaction strategy if event streams grow large
- Add event retention and archival policy hooks for anonymized history

**Spawn Prompt**
```
You own the LetsGo persona state backbone. Implement PersonaEvent persistence, PersonaSnapshot persistence, deterministic replay from events to snapshot, and the base plain-language persona projection model.

Write scope:
- event store
- snapshot store
- replay/rebuild logic
- persona projection support

Constraints:
- do not implement recommendation ranking or active learning policy yet
- follow the shared schemas exactly
- you are not alone in the codebase; do not revert others' work

Deliverable:
- deterministic event-sourced persona backbone
- list the exact files you changed
```

---

### 10.5 Agent A4: Inventory / Provider Normalization

**Type:** Worker

**Owns**
- Provider adapter interface
- Events/dining/outdoors adapters
- Normalized inventory storage
- Nightly refresh pipeline
- Same-day availability validation
- Source-health telemetry for ops console

**Write Scope**
- Provider integration modules
- Normalization layer
- Inventory models/storage/jobs

**Depends On**
- C0, preferably A1 foundation

**Blocks**
- B1, C2, C3, C4

**Definition of Done**
- Normalized Seattle inventory exists for launch pillars
- Refresh and availability checks run
- Items can be ranked consistently across pillars

**P1 Tickets**
- Implement inventory dedupe rules across providers and categories
- Add nightlife-specific tagging as secondary dining inventory
- Add source-health metrics and freshness markers per adapter

**P2 Tickets**
- Add manual suppression list support for bad inventory items
- Add canonical neighborhood or area tagging inside Seattle for future ranking improvements

**Spawn Prompt**
```
You own LetsGo inventory ingestion and normalization. Implement the provider adapter framework, one adapter each for events, dining, and outdoors, normalized InventoryItem persistence, nightly refresh, and same-day availability validation.

Write scope:
- provider adapters
- normalization logic
- inventory storage and jobs

Constraints:
- do not implement ranking or push delivery
- keep nightlife as secondary dining metadata only
- you are not alone in the codebase; do not revert others' work

Deliverable:
- rankable normalized inventory pipeline
- list the exact files you changed
```

---

### 10.6 Agent P1: Platform Abstraction

**Type:** Worker

**Owns**
- DatabasePort, AuthPort, RuntimePort interface definitions
- Default adapter for current deployment target
- Platform factory (getDatabase/getAuth/getRuntime/setPlatform)
- Refactoring all services to use ports instead of direct SDK imports

**Write Scope**
- platform/ports.ts
- platform/adapters/\<provider\>.ts
- platform/factory.ts
- All data store files (import path changes only)
- All endpoint files with inline SDK usage (import path changes only)
- Test mock (becomes an adapter behind the factory)

**Depends On**
- C0 (port interface definitions), Wave 3 agents (stable service code to refactor)

**Blocks**
- No agent is blocked by P1; it runs in parallel with Wave 4

**Definition of Done**
- No service file imports a platform-specific SDK directly
- All services use getDatabase() from the factory
- All auth uses getAuth() from the factory
- All env access uses getRuntime() from the factory
- All existing tests pass without logic changes
- At least one adapter implementation exists

**Spawn Prompt**
```
Decouple all business logic from platform-specific SDK imports. Create DatabasePort, AuthPort, and RuntimePort interfaces. Implement a default adapter for the current deployment target. Refactor all services and endpoints to use the platform factory instead of direct SDK calls.

Write scope:
- platform/ports.ts, platform/adapters/<provider>.ts, platform/factory.ts
- refactor all data stores and endpoints to use factory

Constraints:
- do not change business logic or test assertions, only change import paths and initialization
- the test mock becomes another adapter implementation behind the same factory interface
- you are not alone in the codebase; do not revert others' work

Deliverable:
- platform-agnostic service layer with working adapter
- list the exact files you changed
```

---

### 10.7 Agent B1: Recommendation / Ranking Engine

**Type:** Worker

**Owns**
- Feed ranking and candidate retrieval
- Hard-filter application
- UCB exploration logic
- Diversity guardrails (4 dimensions)
- Travel/location-aware ranking
- Confidence label mapping
- Structured explanation facts

**Write Scope**
- Recommendation service
- Feed scoring logic
- Feed API assembly

**Depends On**
- C0, A3 (snapshot shape), A4 (inventory schema)

**Blocks**
- C1 (home feed UI), C2 (proactive candidate selection), B3 (explanation polishing)

**Definition of Done**
- `GET /feed` returns valid cards with scoring, exploration, diversity, and explanation facts
- Ranker produces deterministic outputs under fixed fixtures
- Feed respects exploration cap (max 2) and diversity constraints

**P1 Tickets**
- Implement travel-state handling so one persona ranks current-area inventory
- Implement fallback behavior when diversity rules conflict with sparse inventory
- Implement recommendation refresh trigger after immediate persona updates from learning answers

**P2 Tickets**
- Add support for ranking diagnostics payloads for ops inspection
- Add cohort-level ranking metrics for acceptance-rate analysis

**Spawn Prompt**
```
You own LetsGo recommendation ranking. Implement candidate retrieval, hard-filter application, feed scoring, UCB exploration, elastic feed sizing, strict diversity rules across pillar/time_shape/social_mode/price_band, confidence label mapping, and structured explanation facts used by the UI and AI layer.

Write scope:
- recommendation service
- feed ranker
- feed response assembly

Constraints:
- use the locked contracts
- do not implement persona update rules or push scheduling
- you are not alone in the codebase; do not revert others' work

Deliverable:
- working GET /feed path with deterministic ranking behavior
- list the exact files you changed
```

---

### 10.8 Agent B2: Persona Logic / Feedback / Learning Engine

**Type:** Worker

**Owns**
- Action semantics (I'm in / Maybe / Pass / Can't)
- Ambiguity-first persona updates and contradiction-aware decay
- Hard-filter promotion
- Active learning question selection, cadence, and budget
- Learning answer ingestion
- Attached follow-up eligibility

**Write Scope**
- Feedback service
- Persona update rules (replay engine handlers)
- Learning service
- Action and learning endpoints

**Depends On**
- C0, A3, preferably B1 contracts for immediate rerank hooks

**Blocks**
- C1 (action UI and follow-up flows), C2 (learning-push scheduling), C3 (learning logs)

**Definition of Done**
- Actions and learning answers correctly update persona state
- Cadence and TTL rules are enforced
- Session cap (max 2/session) is enforced
- Attached follow-ups returned only after Pass/Can't
- Hard filters and preference updates remain visible and reversible

**P1 Tickets**
- Implement sensitive-topic context gating rules for proactive learning
- Implement support for one allowed follow-up in in-app chat after a push-based learning answer
- Implement plain-language explanation of persona changes for UI acknowledgement

**P2 Tickets**
- Add experimentation hooks around learning cadence and selector weighting
- Add support for future topic-memory mode behind a flag, without enabling it in v1

**Spawn Prompt**
```
You own LetsGo persona behavior, feedback semantics, and active learning. Implement action handling for I'm in / Maybe / Pass / Can't, ambiguity-first negative logic, circumstance handling, contradiction-aware decay, hard-filter promotion, learning-question selection, shared learning budget with standalone/attached tracking, cadence updates, attached follow-up eligibility, TTL logic, session cap (max 2/session), comparative-question mapping (relative boosts only), sensitive-topic context gating, and learning-answer ingestion with immediate persona update.

Write scope:
- feedback and persona-update logic
- learning service
- actions endpoint behavior
- learning answer endpoint behavior

Constraints:
- do not change shared schemas without coordinator approval
- do not implement push transport or iOS UI
- you are not alone in the codebase; do not revert others' work

Deliverable:
- fully working persona/learning backend slice
- list the exact files you changed
```

---

### 10.9 Agent B3: AI Layer / Chat / Persona Boost / Explanation Polish

**Type:** Worker

**Owns**
- LLM gateway abstraction (single provider)
- Chat parsing and structured extraction
- Persona Boost inference extraction with provenance capture
- Explanation polishing from structured facts
- Hybrid question generation fallback

**Write Scope**
- AI service modules
- Prompt/validation layer
- Chat and boost orchestration

**Depends On**
- C0, A3, B1 (explanation facts contract), B2 (learning question contract)

**Blocks**
- C1 (chat UI), C3 (boost and learning audit)

**Definition of Done**
- AI outputs validate into typed structures and never write state directly
- Every LLM response is validated before use
- No hidden ranking-only signals are introduced
- Generated explanations and questions are grounded in system facts

**P1 Tickets**
- Add prompt versioning and prompt-level observability
- Add safety checks to reject unsupported hidden-signal or opaque-persona outputs
- Add LLM retry behavior and failure fallback to template-only outputs

**P2 Tickets**
- Add quality-evaluation harness for explanation style and learning-question quality
- Add offline prompt regression snapshots

**Spawn Prompt**
```
You own the bounded AI layer for LetsGo v1. Implement the single-provider LLM gateway, schema-validated chat extraction, Persona Boost inference extraction, explanation polishing from structured reason facts, and hybrid learning-question generation fallback.

Write scope:
- AI gateway
- prompt/validation modules
- chat and boost orchestration
- explanation/question generation support

Constraints:
- all outputs must validate into typed structures
- do not directly mutate persona state
- you are not alone in the codebase; do not revert others' work

Deliverable:
- safe typed AI layer integrated to backend contracts
- list the exact files you changed
```

---

### 10.10 Agent C1: iOS App / User Experience

**Type:** Worker

**Owns**
- SwiftUI app shell, navigation, onboarding
- Persona Boost UI (complete, skip, in-progress states)
- Home feed and card actions
- Attached follow-up learning UX
- Chat thread with unsolicited system prompts
- Persona editor (plain-language preferences and visible hard filters)
- Notification settings, deep links
- Travel/location and permission UX

**Write Scope**
- iOS app files only

**Depends On**
- C0, A2, B1, B2, B3

**Blocks**
- User-facing beta readiness

**Definition of Done**
- User can onboard, view feed, take actions, answer learning prompts, chat, and edit persona
- Learning prompts obey session caps and surface rules
- Persona changes are visible and editable in-app immediately

**P1 Tickets**
- Implement location permission flow and travel-aware UX hints
- Implement calendar-permission request UX if enabled by feature flag
- Implement immediate feed refresh after learning answers or persona edits
- Implement lightweight acknowledgement UI after persona-changing actions

**P2 Tickets**
- Add skeleton/loading states and offline/failure UX polish
- Add internal beta instrumentation hooks for UI-level funnel tracking

**Spawn Prompt**
```
You own the LetsGo iPhone app. Implement the SwiftUI app shell, onboarding flow, Persona Boost complete/skip flow, feed UI (3-8 cards), card actions, Pass/Can't reason flow, attached learning follow-ups, chat thread with unsolicited system prompts, plain-language persona editor, notification settings, and deep-link handling.

Write scope:
- iOS app files only

Constraints:
- do not edit backend business logic unless absolutely necessary for integration and coordinated
- follow the locked API contracts
- you are not alone in the codebase; do not revert others' work

Deliverable:
- end-user iOS surface integrated to staging/backend contracts
- list the exact files you changed
```

---

### 10.11 Agent C2: Proactive Delivery / Push / Email Scheduling

**Type:** Worker

**Owns**
- Proactive scheduler and interrupt scoring
- Shared push budget (recommendation outranks learning)
- Quiet hours (9pm-8am) and 6-hour cooldown
- APNs push delivery
- Weekly digest pipeline
- Post-activity confirmation scheduling
- Delivery telemetry for sends, opens, taps, and answer outcomes

**Write Scope**
- Proactive service
- Notification delivery modules
- Digest jobs

**Depends On**
- C0, A2, B1, B2

**Blocks**
- Beta launch quality, C3 (notification audit views)

**Definition of Done**
- Push and digest delivery logic respects all plan rules
- Recommendation pushes always outrank learning pushes
- Cooldown and quiet-hour logic are enforced correctly
- Digest and push payloads deep-link back to the right surfaces

**P1 Tickets**
- Implement resend/suppression behavior for failed push deliveries
- Implement in-app fallback trigger when learning push expires unanswered
- Implement digest suppression when inventory quality is too low

**P2 Tickets**
- Add send-time experimentation hooks
- Add channel-level operational dashboards and anomaly alerts

**Spawn Prompt**
```
You own LetsGo proactive delivery. Implement the proactive scheduler, interrupt-worthiness evaluation, shared push budget, recommendation-over-learning push priority, quiet hours (9pm-8am), 6-hour cooldown, APNs delivery integration, weekly digest assembly/sending (3-item target, min 2 qualifying), and post-activity confirmation prompts.

Write scope:
- proactive service
- push/email scheduling and delivery modules

Constraints:
- recommendation pushes always outrank learning pushes
- use one shared push budget
- you are not alone in the codebase; do not revert others' work

Deliverable:
- working proactive delivery pipeline
- list the exact files you changed
```

---

### 10.12 Agent C3: Internal Ops Console

**Type:** Worker

**Owns**
- Internal web console with operator auth
- Persona timeline and event replay
- Recommendation and learning audit views
- Notification logs
- Source-health dashboard
- Feature-flag management UI

**Write Scope**
- Internal web console files only

**Depends On**
- C0, A2, A3, A4, B1, B2, C2

**Blocks**
- Beta supportability and fast incident triage

**Definition of Done**
- Operator can explain why a recommendation or learning prompt happened
- Operator can trace persona changes to concrete events and inputs

**P1 Tickets**
- Implement hard-filter audit view with promotion provenance
- Implement boost inference review/audit visibility
- Implement support actions for temporarily suppressing broken sources or features

**P2 Tickets**
- Add cohort analytics for recommendation lift after learning prompts
- Add operator notes or incident tagging on problematic users/events

**Spawn Prompt**
```
You own the LetsGo internal ops console. Implement operator auth, user lookup, persona timeline, event inspection, replay-vs-snapshot comparison, recommendation audit, learning audit, notification logs, source-health dashboard, and feature-flag UI.

Write scope:
- internal ops console only

Constraints:
- do not change core backend rules except where coordinated for required audit fields
- you are not alone in the codebase; do not revert others' work

Deliverable:
- usable internal audit/debug console
- list the exact files you changed
```

---

### 10.13 Agent C4: QA / Simulation / Reliability

**Type:** Worker

**Owns**
- Deterministic simulation framework and fixtures
- Replay tests for all behavioral rules
- Rule-based regression suite
- End-to-end staging smoke tests

**Write Scope**
- Test files, fixtures, simulation harnesses only

**Depends On**
- C0 (should start once contracts are stable and expand as services land)

**Blocks**
- Beta launch signoff

**Definition of Done**
- Critical behavioral rules are covered by deterministic tests
- Regression failures clearly identify which contract or rule changed

**P1 Tickets**
- Build staging smoke tests across auth, feed, chat, actions, persona edit, and notification flows
- Build regression tests for snapshot replay correctness after schema changes
- Add failure injection tests for provider outages and LLM fallback paths

**P2 Tickets**
- Add long-run simulation tests for cadence drift and exploration behavior
- Add performance benchmarks for ranking and replay cost under growing event history

**Spawn Prompt**
```
You own LetsGo QA, simulation, and reliability harnesses. Build deterministic replay/simulation fixtures and tests covering action semantics, ambiguity-first negatives, learning cadence, shared learning budget, TTL behavior, cooldown rules, immediate reranking, hard-filter promotion, sensitive-topic gating, travel behavior, and deletion/anonymization.

Write scope:
- tests
- fixtures
- simulation harnesses

Constraints:
- do not refactor production code unless needed for testability and coordinated
- you are not alone in the codebase; do not revert others' work

Deliverable:
- reliable regression/simulation coverage for v1 rules
- list the exact files you changed
```

---

## 11. Test Plan

### 11.1 Required Test Categories

- Deterministic event-replay simulations for persona evolution (actions, learning answers, contradictions, decay)
- Unit tests for I'm in, Maybe, Pass, Can't semantics
- Ambiguity-first and circumstantial proof tests
- Attached follow-up eligibility (Pass/Can't only)
- Learning-selector priority (expected lift first, confidence second)
- Cadence acceleration/backoff tests
- Push-budget tests (recommendation outranks learning, shared caps, quiet hours)
- TTL tests (60-minute push expiry, in-app reappearance)
- Session-load tests (max 1 unsolicited in-app, max 2 total per session)
- Immediate re-ranking after learning answers
- Comparative-question relative boost (no false negatives)
- Sensitive-topic context gating
- Diversity under high-confidence inventory
- Travel/location ranking (live location, stable persona)
- Persona Boost visibility (no hidden ranking-only signals)
- Privacy (deletion anonymization, consent records, retention boundaries)
- Ops-console audit tests
- Staging smoke tests across auth, feed, chat, actions, persona edit, notification flows

### 11.2 Testing Architecture

| Layer | Tool | Description |
|-------|------|-------------|
| Unit + behavioral | Vitest with in-memory platform mock | All business logic, no external dependencies |
| C4 regression | Vitest fixture framework | Multi-step persona evolution scenarios |
| Live integration | scripts/live-test.mjs | 15+ tests across 7 journey groups against the deployed API |

---

## 12. Rollout Plan

- Invite-only Seattle beta with cohort gating
- Internal dogfood mode
- Staged activation of Persona Boost and active learning behind feature flags
- Kill switches for every major subsystem

---

## 13. Definition Of Done For V1

- A Seattle beta user can onboard, complete or skip Persona Boost, and receive an initial feed
- The user can act on feed cards with I'm in, Maybe, Pass, and Can't
- Pass and Can't can trigger reasons and attached learning follow-ups
- Standalone learning nudges can be sent by push, expire after 60 minutes, and later reappear in chat
- The persona updates immediately from actions, chat, boost inferences, and learning answers
- Recommendations, pushes, and digests respect exploration, diversity, quiet hours, and shared push budget rules
- Operators can audit why recommendations and learning prompts were sent
- Core adaptive behavior is covered by deterministic replay and simulation tests
- Backend is deployable on any Postgres-backed platform via the abstraction layer
