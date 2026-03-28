# PersonaLens — Product Spec

> A hyper-personalized local recommendation app powered by a living model of who you are.

---

## Overview

Most recommendation apps are either too broad (Yelp showing you everything nearby) or too
narrow (pure behavior matching with no room for nuance). PersonaLens sits in a different
space: it combines behavioral learning, natural language nuance, and real-time contextual
awareness into a single living model of the user — and it shows its reasoning, so users
can trust and correct it rather than wonder why something was recommended.

The result is an app that feels less like a search engine and more like a friend who knows
you well enough to say: "You should go do this tomorrow. Trust me."

---

## Core Value Proposition

PersonaLens surfaces **4 recommendations at a time** — no more, no less:

- **Do it soon** — 2 things to do today or tomorrow
- **Plan for the weekend** — 2 things to do this weekend

The constraint is intentional. It creates urgency without overwhelm, and forces the system
to be confident rather than exhaustive.

---

## User Experience

### Signing up

Onboarding is a conversation, not a form. Four to five high-signal questions replace the
traditional preference survey:

- "What did you do last weekend?"
- "Are you more of a morning person or a night owl?"
- "Do you prefer solo adventures or going out with people?"
- "What's something you've always wanted to try but haven't yet?"

At the end of onboarding, users are offered **Persona Boost** — an optional feature that
searches for publicly available information linked to their email to accelerate the initial
persona. The screen names specific platforms (e.g. Instagram, Meetup, Goodreads) rather
than speaking abstractly about "publicly available data," because specificity feels more
honest. Users can review and edit anything the app infers. The app works just as well
without it — it simply learns a little more slowly.

---

### The home feed

Each recommendation card includes:

- The recommendation itself
- A plain-language reason it was suggested
  ("Based on your preference for solo outdoor activities and the clear weather tomorrow…")
- A **confidence indicator** — honest about uncertainty early on, more assured over time
- Five action buttons: **Like**, **Save**, **Follow** (acted on it), **Reject**,
  **Couldn't make it**

The last option — *Couldn't make it* — is a small but important distinction. It tells the
app that circumstances got in the way, not preference. Without it, a scheduling conflict
looks identical to a rejection, which degrades the persona over time.

Recommendations pull from real-time data sources including event platforms, outdoor
activity databases, restaurant and venue APIs, and local guides. They account for live
factors like weather, operating hours, event schedules, and distance from the user's
current location.

---

### Chat

A persistent chat interface lets users add nuance that behavioral signals alone can't
capture. These conversations feed directly into the persona. For example:

> "I don't usually like waking up early, but I'm okay with it once in a while if it's
> something really special — like a sunrise hike on Mount Rainier."

The Chat Agent interprets this as a **conditional preference**, not a simple toggle.

To lower the barrier to these conversations, the app occasionally surfaces lightweight
prompts after interactions:

> "You've rejected a few evening group events lately — more of a solo weeknight person?"

This invites users into a conversation rather than waiting for them to initiate one,
which is important because chat engagement tends to skew toward a small subset of
reflective users without it.

The chat interface also supports direct questions: "Why did you recommend this?" or
"Show me something more adventurous."

---

## Agent Architecture

PersonaLens is powered by four specialized AI agents. All four share a single source of
truth: a structured, living **Persona Document** per user. The Persona Agent is the only
agent that can write to it — all others read from it.

---

### 1. Persona Agent

**Role:** Owns and maintains the Persona Document.

**Triggered by:** Account creation, onboarding completion, behavioral signals, chat
messages, periodic re-evaluation.

**Inputs:**
- Onboarding answers
- Persona Boost results (if enabled)
- Delta signals from the Feedback Agent
- Nuance updates from the Chat Agent
- Time (newer signals weighted more heavily to prevent persona drift)

**Outputs:** An updated Persona Document with structured attribute scores, confidence
values, and freeform nuance notes.

Each attribute carries a **confidence score** that starts low and rises as signals
accumulate. This score surfaces in the UI so users understand why early recommendations
feel less precise.

The Persona Agent also manages an **exploration budget**: even high-confidence personas
are occasionally exposed to a lower-scoring category, giving the persona room to grow
rather than calcifying around its strongest signals.

---

### 2. Recommendations Agent

**Role:** Generates the 2+2 recommendation cards.

**Triggered by:** Daily scheduled run, app open event.

**Inputs:**
- Current Persona Document
- User GPS location and time of day
- Live data: weather, event APIs, venue databases, activity platforms
- Diversity constraints

**Outputs:** Four recommendation cards with titles, descriptions, plain-language
reasoning, confidence indicators, and source attribution.

The agent applies **diversity guardrails** to ensure recommendations span different
categories proportional to the user's persona — with a deliberate exploration/exploitation
balance. A high outdoor score doesn't mean cultural recommendations disappear; they appear
less frequently, weighted by the exploration_budget parameter.

---

### 3. Feedback Agent

**Role:** Translates card interactions into structured persona signals.

**Triggered by:** Any user interaction with a recommendation card.

**Inputs:** Interaction type + full card context (category, time of day, weather,
solo/social framing, distance)

**Outputs:** A structured delta signal sent to the Persona Agent.

| Interaction     | Persona update? | Interpretation                              |
|-----------------|-----------------|---------------------------------------------|
| Like            | Yes             | Positive preference signal                  |
| Save            | Yes (weak +)    | Interested — timing was wrong               |
| Follow          | Yes (strong +)  | Acted on it                                 |
| Reject          | Yes             | Negative signal — as informative as Follow  |
| Couldn't make it| No              | Circumstantial — not a preference signal    |

Rejections are treated as equally informative as positive signals. A reject on a crowded
festival teaches the app just as much as a follow on a quiet nature walk.

---

### 4. Chat Agent

**Role:** Interprets natural language into structured persona updates.

**Triggered by:** User sending a chat message.

**Inputs:** Conversation history + current Persona Document

**Outputs:** A conversational reply + structured nuance updates sent to the Persona Agent
(conditional preferences, exceptions, clarifications)

The Chat Agent also generates **proactive nudges** — short prompts surfaced after
behavioral patterns emerge — to invite users into a conversation rather than waiting for
them to initiate one.

---

## Persona Document

The Persona Document is a continuously updated JSON object — the single source of truth
for all four agents.

```json
{
  "user_id": "abc123",
  "last_updated": "2026-03-27T09:00:00Z",
  "attributes": {
    "activity_preferences": {
      "outdoor":       { "score": 0.85, "confidence": 0.9 },
      "food_dining":   { "score": 0.60, "confidence": 0.5 },
      "cultural_arts": { "score": 0.40, "confidence": 0.3 }
    },
    "social_preference": {
      "value": "solo_or_small_group",
      "confidence": 0.8
    },
    "time_of_day": {
      "morning": { "score": 0.30, "confidence": 0.6 },
      "evening":  { "score": 0.75, "confidence": 0.7 }
    },
    "budget_sensitivity": {
      "value": "moderate",
      "confidence": 0.5
    },
    "location_range_km": 25,
    "exploration_budget": 0.15
  },
  "nuance_notes": [
    "Open to early mornings only for highly rated, rare experiences (e.g. sunrise hike)",
    "Prefers quieter venues on weeknights",
    "Has expressed interest in trying pottery but hasn't acted on it yet"
  ],
  "signal_history_summary": {
    "total": 38,
    "positive": 24,
    "rejections": 12,
    "couldnt_make_it": 2
  },
  "persona_boost_enabled": true
}
```

### Key design decisions

**Single writer.** Only the Persona Agent can write to the document. This prevents
conflicting updates and makes persona drift traceable.

**Confidence scoring.** Every attribute has a confidence score alongside its value.
Low-confidence attributes surface a muted confidence indicator on cards, setting honest
expectations early.

**Exploration budget.** A tunable parameter (default 0.15) ensures the system occasionally
surfaces lower-scoring categories. Prevents the app from becoming a mirror that only
reflects what it already knows about you.

**Nuance notes.** Freeform strings derived from chat — not reducible to a numeric score.
These capture conditional preferences, exceptions, and intentions that structured
attributes can't express.

**Recency weighting.** Newer signals are weighted more heavily than older ones to prevent
persona drift as the user's interests evolve.

---

## Privacy & Trust

- **Persona Boost is always opt-in**, with a platform-specific explanation before consent.
- Users can **view their full Persona Document** at any time, written in plain language
  (not raw JSON).
- Users can **edit or delete any attribute** manually.
- Persona Boost lookup data is **not stored raw** — only the inferences derived from it
  are retained.
- All behavioral data is subject to the same **visibility and deletion rights**.
- Designed for **GDPR and CCPA compliance** from day one, including the right to export
  and fully delete all personal data.

---

## What Makes PersonaLens Different

| Dimension            | Typical apps          | PersonaLens                          |
|----------------------|-----------------------|--------------------------------------|
| Recommendation scope | Broad list            | 4 curated, time-specific cards       |
| Learning mechanism   | Click behavior only   | Behavior + natural language nuance   |
| Transparency         | Black box             | Plain-language reasoning on every card |
| Uncertainty handling | Hidden                | Confidence indicator, visible to user |
| Negative signals     | Often ignored         | Rejections treated as first-class data |
| Persona growth       | Calcifies over time   | Exploration budget prevents lock-in  |
| Privacy              | Opaque                | Full visibility, edit, and delete    |

