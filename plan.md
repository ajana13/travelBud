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

The *Couldn't make it* option is a small but important distinction. It tells the app that
circumstances got in the way, not preference — so no persona update is triggered. Without
it, a scheduling conflict looks identical to a rejection and degrades the persona.

After a rejection, the app surfaces one optional follow-up — not a survey, just a single
tap:

> "Any reason? (Just helps us learn faster)"
> `Not in the mood` · `Weather / logistics` · `Already had plans` · `Just not my thing`

This is always dismissible. But when users engage with it, it directly routes the
rejection into the right update path — a "just not my thing" tap triggers a full preference
update; a "weather / logistics" tap zeroes out the circumstance discount entirely and
leaves the persona unchanged.

Exploration cards — recommendations from categories the system hasn't tried with you yet —
carry a subtle **"Something new"** tag. This sets honest expectations and makes the
follow-up interaction feel more meaningful, because the user understands the system is
intentionally venturing into unknown territory.

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
prompts after interaction patterns emerge:

> "You've rejected a few evening group events lately — more of a solo weeknight person?"

The chat interface also supports direct questions: "Why did you recommend this?" or
"Show me something more adventurous."

---

## Scoring Model

### The fundamental principle

A rejection is a hypothesis, not a verdict. When a user rejects "dinner at an expensive
sushi restaurant on a rainy Tuesday," there are at least five competing explanations:

1. They don't like sushi
2. They don't like expensive restaurants
3. They weren't in the mood for dinner out
4. The weather made going out unappealing
5. They already had plans or felt unwell

A naive system treats this as "user dislikes sushi + expensive places" and downgrades
both. PersonaLens treats it as **ambiguous** and holds the hypothesis open until more
evidence accumulates.

---

### Three score states — not two

Every category and sub-attribute exists in one of three states:

| State      | Meaning                          | Representation                      |
|------------|----------------------------------|-------------------------------------|
| Unexplored | Never recommended, no signal     | score: 0.5, confidence: 0.0         |
| Uncertain  | Some signal, low confidence      | score near 0.5, confidence: 0.1–0.4 |
| Known      | Enough signal to be reliable     | score anywhere 0–1, confidence: 0.5+ |

**Zero does not mean "not interested." Zero means no data.**

All categories are initialized at `{ score: 0.5, confidence: 0.0 }` — an optimistic
prior, not a penalty. A paint-and-sip night the user has never been recommended starts
at 0.5, not 0. A hotpot place rejected with clear preference signal sits at 0.2 with
confidence 0.5. The paint-and-sip is genuinely more likely to be recommended next —
because the system knows less about it, and that uncertainty is an opportunity.

---

### Two scoring layers

**Layer 1 — Hard filters (pre-scoring elimination)**

Constraints that remove candidates from the pool entirely before scoring begins. These
are not preferences — they are rules. Examples:

- Dietary restrictions ("I don't eat red meat")
- Hard distance limits
- Price ceiling if explicitly stated

Hard filters are graduated into by the Persona Agent when either: the user explicitly
states a constraint in chat, or the same attribute is rejected 3+ times with low
circumstance scores (i.e. the rejections were clearly preference-based, not situational).
A single hotpot rejection does not create a red meat filter. Three red-meat rejections
in varied conditions — or one explicit "I don't eat red meat" in chat — does.

**Layer 2 — Soft scores (preference ranking)**

Everything that passes the hard filters is ranked using attribute scores and confidence
values. This is where the 0–1 scale lives.

---

### Signal isolation on rejections

When a rejection arrives, the Feedback Agent computes a **circumstance score** — a 0–1
estimate of how likely the rejection was situational rather than preference-driven.

Factors that raise the circumstance score (making the penalty smaller):

- Rain or extreme weather at time of rejection
- Recommendation was for evening; rejection tapped in the morning
- User has prior positive history with this category
- Multiple rejections across unrelated categories on the same day

The circumstance score discounts the entire penalty, and the remaining penalty is split
across relevant dimensions — cuisine, price tier, setting, time of day — rather than
applied to the whole category:
```
circumstance_score = 0.7   // rain + prior positive sushi history

applied_penalty = base_penalty × (1 - circumstance_score)
// → small update distributed across: cuisine, price tier, setting, time
```

One rainy-night rejection of an expensive sushi place produces a tiny, distributed,
low-confidence update — not a verdict on either sushi or expensive restaurants.

---

### Confidence decay for mood rejections

For rejections with no obvious circumstantial cause but no strong prior evidence of
dislike either, the Persona Agent applies a small negative update with **time-decaying
confidence**. The penalty fades back toward neutral over 2–3 weeks unless further
evidence accumulates. If the user accepts a similar recommendation later, the decay
accelerates. If they reject again, the signal strengthens and confidence rises.

Three unexplained rejections of the same category in different conditions converge into
a genuine low score. One unexplained rejection fades on its own.

---

### Sub-attribute isolation

Rejections update at the most specific level possible — not the whole category:

- Rejecting hotpot → penalty on `hotpot` sub-attribute + `red_meat` dietary signal;
  `food_dining` as a whole is barely touched
- Rejecting an expensive restaurant → penalty on `expensive_dining` price tier; moderate
  restaurants remain unaffected
- Rejecting a group activity on a weekday → penalty on `weekday_group` temporal pattern;
  group activities on weekends remain unaffected

The parent category score is a weighted aggregate of its sub-attributes — it moves slowly,
only when a consistent pattern emerges across multiple sub-attributes.

---

## The Exploration Model

### The cold-start and exploration-exploitation problem

Categories that have been recommended and rejected accumulate signal. Categories that
have never been recommended have no signal. If unexplored categories default to a score
of zero, they never surface — and the system converges on a shrinking, stale pool.

PersonaLens solves this by treating **low confidence as the primary signal for
exploration**, not low score. The question is never "what does the user like most?" It
is "what do we know least about, and what does the user likely like most among the
things we do know?"

---

### Upper Confidence Bound (UCB) ranking

When generating recommendations, the Recommendations Agent scores each candidate using
an optimistic estimate rather than just the raw score:
```
UCB_score = current_score + exploration_factor × sqrt(1 / confidence)
```

When confidence is 0 (never explored), the second term dominates — the category always
gets tried eventually. As confidence grows, the term shrinks and the category competes
on its actual score. The `exploration_factor` is a tunable constant controlling overall
adventurousness.

This guarantees every category gets sampled over time. A paint-and-sip night with
`{ score: 0.5, confidence: 0.0 }` will surface before a rejected category with
`{ score: 0.3, confidence: 0.5 }` — because the system is more uncertain about it and
needs the data point.

---

### Exploration budget allocation

The `exploration_budget` parameter (default 0.15) reserves roughly one card per day for
an exploration recommendation. Exploration candidates are ranked by **confidence
ascending** — the least-known categories get slots first:
```
// Ranked by confidence ASC:
paint_sip:  { score: 0.5, confidence: 0.0 }  → top priority
pottery:    { score: 0.5, confidence: 0.0 }  → second
jazz_bars:  { score: 0.5, confidence: 0.1 }  → third
hotpot:     { score: 0.3, confidence: 0.4 }  → lower priority for exploration
```

Exploration cards are tagged "Something new" in the UI so users understand the system
is intentionally trying something it hasn't tested with them yet.

---

## Agent Architecture

PersonaLens is powered by four specialized AI agents. All four share a single source of
truth: the **Persona Document** per user. The Persona Agent is the only agent that can
write to it — all others read from it.

---

### 1. Persona Agent

**Role:** Owns and maintains the Persona Document.

**Triggered by:** Account creation, onboarding completion, behavioral signals, chat
messages, periodic re-evaluation.

**Inputs:**
- Onboarding answers
- Persona Boost results (if enabled)
- Delta signals from the Feedback Agent (with circumstance scores attached)
- Nuance updates from the Chat Agent
- Time (newer signals weighted more heavily to prevent persona drift)

**Outputs:** An updated Persona Document including:
- Sub-attribute scores updated at the most specific level possible
- Confidence values adjusted per signal strength and circumstance discount
- Hard filters graduated from repeated low-circumstance rejections or explicit chat input
- Nuance notes for conditional preferences
- Decay flags on mood-based penalties

---

### 2. Recommendations Agent

**Role:** Generates the 2+2 recommendation cards.

**Triggered by:** Daily scheduled run, app open event.

**Inputs:**
- Current Persona Document (scores, confidence, hard filters, nuance notes,
  exploration_budget, exploration_factor)
- User GPS location and time of day
- Live data: weather, event APIs, venue databases, activity platforms

**Generation process:**
1. Apply hard filters to eliminate ineligible candidates
2. Apply context filters (no outdoor recommendations in heavy rain — this is a context
   rule, not a preference question)
3. Score remaining candidates using UCB formula
4. Apply diversity guardrails to ensure category spread
5. Reserve exploration_budget slots for lowest-confidence categories, tagged "Something new"
6. Generate plain-language reasoning per card

---

### 3. Feedback Agent

**Role:** Translates card interactions into structured, context-enriched delta signals.

**Triggered by:** Any user interaction with a recommendation card.

**Inputs:** Interaction type + full card context (category, sub-attributes, time of day,
weather, social framing, distance, prior history with this category)

**Processing:**
1. Compute circumstance score from contextual factors
2. If rejection: surface optional one-tap clarification to user
3. Distribute penalty across relevant dimensions, discounted by circumstance score
4. Flag as mood-decay candidate if circumstance is ambiguous
5. Flag red_meat_signal (or equivalent) if dietary constraint pattern is emerging

**Outputs:** Structured delta signal to the Persona Agent including dimension-level
deltas, circumstance score, user clarification if provided, and any graduated
filter candidates.

| Interaction       | Persona update?  | Notes                                              |
|-------------------|------------------|----------------------------------------------------|
| Like              | Yes              | Positive signal distributed across dimensions      |
| Save              | Yes (weak +)     | Interested — timing was wrong                      |
| Follow            | Yes (strong +)   | Acted on it — strongest positive signal            |
| Reject            | Yes (discounted) | Penalty scaled by circumstance score               |
| Couldn't make it  | No               | Circumstantial — zero persona update               |

---

### 4. Chat Agent

**Role:** Interprets natural language into structured persona updates.

**Triggered by:** User sending a chat message.

**Inputs:** Conversation history + current Persona Document

**Outputs:** Conversational reply + structured updates to the Persona Agent:
- Conditional preferences and nuance notes
- Hard filter candidates (e.g. "I don't eat red meat" → flag for filter graduation)
- Explicit preference confirmations or reversals

Also generates **proactive nudges** surfaced after behavioral patterns emerge, to invite
users into a conversation rather than waiting for them to initiate one.

---

## Persona Document
```json
{
  "user_id": "abc123",
  "last_updated": "2026-03-27T09:00:00Z",

  "hard_filters": {
    "dietary": ["red_meat"],
    "distance_max_km": 25
  },

  "attributes": {
    "activity_preferences": {
      "outdoor":     { "score": 0.85, "confidence": 0.9 },
      "food_dining": {
        "score": 0.6,
        "confidence": 0.5,
        "sub_attributes": {
          "sushi":     { "score": 0.72, "confidence": 0.6 },
          "hotpot":    { "score": 0.2,  "confidence": 0.5 },
          "paint_sip": { "score": 0.5,  "confidence": 0.0 },
          "pottery":   { "score": 0.5,  "confidence": 0.0 },
          "jazz_bars": { "score": 0.5,  "confidence": 0.0 }
        },
        "rejection_history": [
          {
            "timestamp": "2026-03-20T19:00:00Z",
            "sub_attribute": "hotpot",
            "circumstance_score": 0.2,
            "weather": "clear",
            "user_clarification": "just_not_my_thing",
            "applied_penalty": 0.18,
            "red_meat_signal": true
          },
          {
            "timestamp": "2026-03-22T20:00:00Z",
            "sub_attribute": "sushi",
            "circumstance_score": 0.7,
            "weather": "rain",
            "user_clarification": null,
            "applied_penalty": 0.04,
            "decay_flag": true
          }
        ]
      },
      "cultural_arts": { "score": 0.4, "confidence": 0.3 }
    },
    "social_preference":    { "value": "solo_or_small_group", "confidence": 0.8 },
    "time_of_day": {
      "morning": { "score": 0.30, "confidence": 0.6 },
      "evening":  { "score": 0.75, "confidence": 0.7 }
    },
    "budget_sensitivity":   { "value": "moderate", "confidence": 0.5 },
    "location_range_km": 25,
    "exploration_budget": 0.15,
    "exploration_factor": 0.3
  },

  "nuance_notes": [
    "Open to early mornings only for highly rated, rare experiences (e.g. sunrise hike)",
    "Prefers quieter venues on weeknights",
    "Has expressed interest in trying pottery but hasn't acted on it yet",
    "Does not eat red meat — flagged for hard filter graduation"
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

---

## Privacy & Trust

- **Persona Boost is always opt-in**, with a platform-specific explanation before consent.
- Users can **view their full Persona Document** at any time, written in plain language
  (not raw JSON).
- Users can **edit or delete any attribute** manually — including hard filters and
  sub-attribute scores.
- Persona Boost lookup data is **not stored raw** — only the inferences derived from it
  are retained.
- All behavioral data is subject to the same **visibility and deletion rights**.
- Designed for **GDPR and CCPA compliance** from day one, including the right to export
  and fully delete all personal data.

---

## What Makes PersonaLens Different

| Dimension             | Typical apps                  | PersonaLens                                               |
|-----------------------|-------------------------------|-----------------------------------------------------------|
| Recommendation scope  | Broad list                    | 4 curated, time-specific cards                            |
| Learning mechanism    | Click behavior only           | Behavior + natural language nuance                        |
| Rejection handling    | Flat penalty on category      | Signal isolated per dimension, discounted by circumstance |
| Unexplored categories | Score 0, never surfaced       | Prior 0.5, explored via UCB ranking                       |
| Hard constraints      | Treated as soft scores        | Graduated into a separate pre-scoring filter layer        |
| Transparency          | Black box                     | Plain-language reasoning on every card                    |
| Uncertainty handling  | Hidden                        | Confidence indicator visible to user                      |
| Persona growth        | Calcifies over time           | Exploration budget + UCB prevents lock-in                 |
| Privacy               | Opaque                        | Full visibility, edit, and delete                         |