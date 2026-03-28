# Service Boundaries

## Write Ownership Rules

Each service has exclusive write access to specific tables. No service may write to another service's owned tables directly. Cross-service state changes flow through typed delta proposals.

| Service | Owned Tables (Write) | Read Access |
|---------|---------------------|-------------|
| **Persona Service** | `persona_snapshots`, `persona_events` | All tables |
| **Recommendation Service** | (none - read only) | `persona_snapshots`, `inventory_items` |
| **Feedback Service** | (writes via Persona Service) | `persona_events`, `inventory_items` |
| **Chat Service** | (future: conversations table) | `persona_snapshots` |
| **Learning Service** | `learning_questions`, `learning_answers` | `persona_snapshots`, `persona_events` |
| **Proactive Service** | `proactive_decisions` | `persona_snapshots`, `notification_preferences`, `learning_questions`, `inventory_items` |
| **Inventory Service** | `inventory_items` | (none) |
| **Identity Service** | `notification_preferences`, `consent_records` | `auth.users` |

## Persona Service

The **sole writer** of `persona_snapshots`. All persona state changes - from actions, chat extractions, learning answers, boost inferences, and user edits - must flow through Persona Service as delta proposals.

**Responsibilities:**
- Accept delta proposals from Feedback, Chat, Learning, and Boost services
- Apply deltas atomically, increment snapshot version
- Append `PersonaEvent` for every state change
- Generate plain-language projections
- Support deterministic replay from event stream

## Recommendation Service

**Read-only** consumer of persona and inventory state. Produces ranked feeds and proactive candidate lists.

**Responsibilities:**
- Candidate retrieval from active inventory
- Hard-filter application
- Feed scoring with UCB exploration
- Elastic feed sizing (default 6, range 3-8)
- Diversity enforcement (pillar, time shape, social mode, price band)
- Confidence label mapping (New, Learning, Strong match)
- Explanation fact generation
- Travel-aware ranking (live location, stable persona)

## Feedback Service

Normalizes user actions into typed events and computes preference delta proposals.

**Responsibilities:**
- Validate and ingest actions (I'm in, Maybe, Pass, Can't)
- Apply action semantics (ambiguity-first for Pass, circumstantial for Can't)
- Compute preference deltas (does NOT write directly)
- Determine attached follow-up eligibility (Pass/Can't only)
- Route deltas to Persona Service

## Chat Service

Handles conversational interactions with LLM-powered understanding.

**Responsibilities:**
- Conversation state management
- LLM-powered response generation
- Structured preference extraction from chat
- Route extraction proposals to Persona Service
- Handle unsolicited learning prompt responses routed through chat

## Learning Service

Owns the active learning subsystem.

**Responsibilities:**
- Question selection (expected near-term lift first, confidence gap second)
- Shared learning budget management
- Cadence state tracking (answer-based acceleration, ignore-based backoff)
- Session-level caps (1 unsolicited in-app, 2 total)
- TTL handling for standalone push nudges (60-minute expiry)
- Comparative question mapping (relative boosts only)
- Coordinate with Proactive Service for delivery channel decisions

## Proactive Service

Owns all outbound delivery decisions.

**Responsibilities:**
- Interrupt-worthiness evaluation
- Shared push budget (recommendation pushes always outrank learning pushes)
- Quiet hours enforcement (9pm-8am local)
- 6-hour push cooldown
- APNs push delivery
- Weekly digest generation (3-item target, min 2 qualifying)
- Post-activity confirmation scheduling
- Delivery telemetry (sends, opens, taps, answers)
