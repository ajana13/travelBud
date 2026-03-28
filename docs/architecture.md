# LetsGo V1 Architecture

## System Overview

LetsGo is a hybrid deterministic + bounded-LLM local discovery system. Deterministic services own inventory, scoring, scheduling, state, and delivery. LLMs are used only for chat understanding, Persona Boost inference extraction, explanation polishing, and question generation inside a controlled framework.

```
                          ┌──────────────────────┐
                          │   iOS App (SwiftUI)   │
                          └──────────┬───────────┘
                                     │ REST/JSON
                          ┌──────────▼───────────┐
                          │  InsForge Edge Funcs  │
                          │  (Deno Subhosting)    │
                          ├──────────────────────┤
                          │ feed                  │
                          │ actions               │
                          │ chat-messages          │
                          │ persona               │
                          │ persona-boost-start    │
                          │ persona-boost-status   │
                          │ notifications-prefs    │
                          │ learning-prompt        │
                          │ learning-answer        │
                          │ account-delete         │
                          └──────────┬───────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
    ┌─────────▼──────┐   ┌──────────▼──────┐   ┌──────────▼──────┐
    │ Persona Service │   │  Recommendation │   │  Learning       │
    │ (state owner)   │   │  Service        │   │  Service        │
    └─────────┬──────┘   └──────────┬──────┘   └──────────┬──────┘
              │                      │                      │
    ┌─────────▼──────┐   ┌──────────▼──────┐   ┌──────────▼──────┐
    │ Feedback       │   │  Proactive      │   │  Chat           │
    │ Service        │   │  Service        │   │  Service        │
    └─────────┬──────┘   └──────────┬──────┘   └──────────┬──────┘
              │                      │                      │
              └──────────────────────┼──────────────────────┘
                                     │
                          ┌──────────▼───────────┐
                          │  InsForge Postgres    │
                          │  (shared database)    │
                          └──────────────────────┘
```

## Critical-Path Sequences

### Feed Generation
1. Client calls `GET /feed`
2. Recommendation Service reads PersonaSnapshot + active InventoryItems
3. Applies hard filters -> scores candidates -> exploration budget -> diversity pass
4. Generates explanation facts per card
5. Returns 3-8 RecommendationCards with confidence labels

### Learning Prompt Generation
1. Learning Service scores candidate questions by expected lift
2. Checks cadence state and learning budget
3. Checks session caps (max 1 unsolicited in-app, max 2 total/session)
4. Selected question goes to Proactive Service for channel decision
5. Proactive Service checks push budget, quiet hours, cooldown
6. Delivers via push or surfaces as in-app chat system message

### Push Delivery
1. Proactive Service evaluates interrupt worthiness
2. Checks shared push budget (recommendation pushes outrank learning pushes)
3. Enforces quiet hours (9pm-8am) and 6-hour cooldown
4. Sends single-recommendation payload via APNs
5. Logs ProactiveDecision with delivery telemetry

## Technology Stack
- **Backend**: TypeScript/Node via InsForge Edge Functions (Deno Subhosting)
- **Database**: InsForge Managed Postgres
- **Client**: Native iPhone (SwiftUI)
- **AI**: Single LLM provider with schema-validated outputs
- **Ops Console**: Internal web app
