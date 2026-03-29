# LetsGo

Invite-only Seattle beta for local discovery. Native iPhone app with push notifications, weekly email digest, and in-app chat.

## Project Structure

```
travelBud/
├── packages/shared/          # @letsgo/shared - Domain types, API contracts, enums
│   ├── src/domain/           # 8 domain types with Zod schemas
│   ├── src/api/              # Request/response contracts for all endpoints
│   ├── src/enums/            # Shared enumerations
│   └── __tests__/            # Type validation tests
├── insforge/functions/       # Edge functions (Deno Subhosting)
│   ├── _shared/              # Shared helpers (cors, auth, response, validation, handler, etc.)
│   │   └── inventory/        # Inventory pipeline, adapters, seed data
│   ├── feed/                 # GET /feed
│   ├── actions/              # POST /actions
│   ├── chat-messages/        # POST /chat/messages
│   ├── persona/              # GET + PATCH /persona
│   ├── persona-boost-start/  # POST /persona-boost/start
│   ├── persona-boost-status/ # GET /persona-boost/status
│   ├── notifications-preferences/ # POST /notifications/preferences (implemented)
│   ├── learning-prompt/      # GET /learning/prompt
│   ├── learning-answer/      # POST /learning/answer
│   ├── account-delete/       # DELETE /account (implemented)
│   └── inventory-seed/       # POST /inventory/seed (new)
├── sql/                      # Database migrations (001-011)
├── docs/                     # Architecture & contract documentation
│   ├── architecture.md
│   ├── service-boundaries.md
│   ├── api-contracts.md
│   ├── feature-flags.md
│   └── event-versioning.md
├── apps/                     # (future) iOS app & ops console
└── LETSGO_*.md               # Product planning documents
```

## Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Typecheck
cd packages/shared && npx tsc --noEmit
```

## Environment Variables

The test/debug scripts and edge functions require the following env vars:

| Variable | Description | Example |
|----------|-------------|---------|
| `INSFORGE_BASE_URL` | InsForge project base URL | `https://<appkey>.us-west.insforge.app` |
| `ANON_KEY` | InsForge anonymous/public API key | `ik_...` |
| `INSFORGE_FUNCTIONS_URL` | Edge functions base URL | `https://<appkey>.functions.insforge.app` |
| `TEST_PASS` | Password for test users (optional, defaults to `TestPass123!`) | `TestPass123!` |

### Running test scripts

```bash
export INSFORGE_BASE_URL=https://<appkey>.us-west.insforge.app
export ANON_KEY=ik_<your_key>
export INSFORGE_FUNCTIONS_URL=https://<appkey>.functions.insforge.app

# Full auth + endpoint live test (signs up user, verifies, tests all functions)
node scripts/live-test.mjs

# Auth debugging (tests getCurrentUser with different client configs)
node scripts/debug-auth.mjs

# Bundle edge functions for deployment
node scripts/bundle-functions.mjs
```

## Domain Types

All shared types live in `packages/shared/src/domain/` with both TypeScript interfaces and Zod runtime validators:

- `InventoryItem` - Normalized local discovery catalog entry
- `PersonaEvent` - Append-only event envelope (discriminated union)
- `PersonaSnapshot` - Current materialized persona state
- `BoostInference` - Persona Boost discovery inference
- `RecommendationCard` - Feed card with explanation and actions
- `LearningQuestion` - Active learning question with structured answer schema
- `LearningAnswer` - User response to a learning question
- `ProactiveDecision` - Outbound delivery decision log

## Services

| Service | Responsibility | Writes To |
|---------|---------------|-----------|
| Persona | Sole writer of persona state | `persona_snapshots`, `persona_events` |
| Recommendation | Feed ranking (read-only) | (none) |
| Feedback | Action normalization | (via Persona Service) |
| Chat | Conversational AI | (via Persona Service) |
| Learning | Question selection & cadence | `learning_questions`, `learning_answers` |
| Proactive | Delivery scheduling | `proactive_decisions` |

## Tech Stack

- **Backend**: TypeScript via InsForge Edge Functions (Deno)
- **Database**: InsForge Managed Postgres
- **Client**: Native iPhone (SwiftUI)
- **Validation**: Zod schemas for runtime type safety
- **Testing**: Vitest (196 tests across 34 files)
