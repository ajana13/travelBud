# LetsGo — Product Spec

> A hyper-personalized local recommendation app powered by a living model of who you are.
> The app finds things for you. You just show up.

---

## Overview

Most recommendation apps are pull-based: you open them when you want something to do,
browse a list, and decide. LetsGo works the other way. It watches for the right
moment — a weather window, a time-sensitive event, a gap in your usual routine — and
brings the recommendation to you. You don't need to think about what to do. The app
thinks for you, and asks only that you say yes or no.

The experience combines behavioral learning, natural language nuance, real-time contextual
awareness, and proactive delivery into a single living model of the user — one that gets
smarter the more you engage with it, and that reaches out rather than waiting to be
consulted.

---

## Core Value Proposition

LetsGo surfaces **4 recommendations at a time** in the home feed — 2 for today or
tomorrow, 2 for the weekend. But more importantly, it pushes the right recommendation at
the right moment without requiring you to open the app. The goal is zero friction between
"there's something you'd enjoy" and "you're doing it."

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
than speaking abstractly about "publicly available data." Users can review and edit
anything the app infers. The app works just as well without it.

Users also set their **notification preferences** during onboarding — not a settings
dump, but a single question: "How would you like us to reach you when we find something
good?" with three options: push notifications, weekly email digest, or both. This can
be changed at any time.

---

### The home feed

Each recommendation card includes:

- The recommendation itself
- A plain-language reason it was suggested
- A **confidence indicator** — honest about uncertainty early on, more assured over time
- Five action buttons: **Like**, **Save**, **Follow** (acted on it), **Reject**,
  **Couldn't make it**

After a rejection, the app surfaces one optional follow-up tap:

> "Any reason? (Just helps us learn faster)"
> `Not in the mood` · `Weather / logistics` · `Already had plans` · `Just not my thing`

Exploration cards — recommendations from categories the system hasn't tried with you yet
— carry a subtle **"Something new"** tag so users understand the system is intentionally
venturing into unknown territory.

---

### Proactive notifications

The app pushes recommendations without requiring the user to open it. Each push is
specific, timely, and includes one-tap actions so the user never needs to open the app
to respond.

**Example push notification:**

> 🌤 Perfect hiking weather tomorrow morning
> "Rattlesnake Ledge — 4 miles, opens at sunrise. 23 min from you."
> [Save for later]  [I'm in]  [Not now]

**Example weekly email digest:**

> Subject: Three things we think you'd actually do this weekend
>
> Based on what we know about you, here's what caught our eye:
>
> 1. [Outdoor thing] — because [reason tied to persona]
> 2. [Something new — pottery class] — you mentioned wanting to try something creative
> 3. [Event] — time-sensitive, only a few spots left
>
> [Save]  [I'm in]  [Skip]  on each item — no app open required.

Notification frequency is **earned, not fixed**. The system starts conservative and
pushes more often as the user demonstrates the recommendations are landing well. If the
user dismisses more, the system backs off automatically — no settings required.

---

### Chat

A persistent chat interface lets users add nuance that behavioral signals alone can't
capture:

> "I don't usually like waking up early, but I'm okay with it once in a while if it's
> something really special — like a sunrise hike on Mount Rainier."

The Chat Agent interprets this as a **conditional preference** and updates the persona
accordingly. It also generates proactive nudges after behavioral patterns emerge:

> "You've rejected a few evening group events lately — more of a solo weeknight person?"

The chat interface supports direct questions: "Why did you recommend this?" or "Show me
something more adventurous."

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
both. LetsGo treats it as **ambiguous** and holds the hypothesis open until more
evidence accumulates.

---

### Three score states — not two

Every category and sub-attribute exists in one of three states:

| State      | Meaning                          | Representation                       |
|------------|----------------------------------|--------------------------------------|
| Unexplored | Never recommended, no signal     | score: 0.5, confidence: 0.0          |
| Uncertain  | Some signal, low confidence      | score near 0.5, confidence: 0.1–0.4  |
| Known      | Enough signal to be reliable     | score anywhere 0–1, confidence: 0.5+ |

**Zero does not mean "not interested." Zero means no data.**

All categories initialize at `{ score: 0.5, confidence: 0.0 }`. A paint-and-sip night
never recommended starts at 0.5. A hotpot place rejected with clear preference signal
sits at 0.2 with confidence 0.5. The paint-and-sip is genuinely more likely to be
surfaced next — because the system knows less about it.

---

### Two scoring layers

**Layer 1 — Hard filters (pre-scoring elimination)**

Constraints that remove candidates entirely before scoring. Graduated into by the Persona
Agent when: the user explicitly states a constraint in chat, or the same attribute is
rejected 3+ times with low circumstance scores.

**Layer 2 — Soft scores (preference ranking)**

Everything passing the hard filters is ranked using attribute scores and confidence
values via the UCB formula (see Exploration Model).

---

### Signal isolation on rejections

The Feedback Agent computes a **circumstance score** for each rejection — a 0–1 estimate
of how likely the rejection was situational. Factors that raise it: rain, time mismatch,
prior positive history with this category, multiple cross-category rejections in one day.

The circumstance score discounts the penalty, and the remaining penalty is split across
relevant dimensions rather than applied to the whole category:
```
circumstance_score = 0.7   // rain + prior positive sushi history
applied_penalty = base_penalty × (1 - circumstance_score)
// → small update split across: cuisine, price tier, setting, time
```

---

### Confidence decay for mood rejections

Ambiguous rejections get a small negative update with time-decaying confidence — fading
to neutral over 2–3 weeks unless further evidence accumulates. Three unexplained
rejections in varied conditions converge into a genuine low score. One fades on its own.

---

### Sub-attribute isolation

Rejections update at the most specific level possible:

- Rejecting hotpot → penalty on `hotpot` + `red_meat` dietary signal; `food_dining`
  barely touched
- Rejecting an expensive restaurant → penalty on `expensive_dining` tier only
- Rejecting a group activity on a weekday → penalty on `weekday_group` pattern only

Parent category scores are weighted aggregates — they move slowly, only when a pattern
emerges across multiple sub-attributes.

---

## The Exploration Model

### The cold-start and exploration-exploitation problem

Categories that have been recommended accumulate signal. Categories never recommended
have none. If unexplored categories default to zero, they never surface — and the system
converges on a shrinking, stale pool.

LetsGo treats **low confidence as the primary signal for exploration**, not low score.

---

### Upper Confidence Bound (UCB) ranking
```
UCB_score = current_score + exploration_factor × sqrt(1 / confidence)
```

When confidence is 0, the second term dominates — the category always gets tried
eventually. As confidence grows, the category competes on its actual score.

---

### Exploration budget allocation

The `exploration_budget` parameter (default 0.15) reserves roughly one card per day for
the lowest-confidence category. Exploration cards are tagged **"Something new"** in the
UI. The Proactive Agent can also use exploration slots in push notifications — framed
as "We think you might like this, even though it's new for you."

---

## Agent Architecture

Five specialized agents share a single source of truth: the **Persona Document** per
user. The Persona Agent is the only agent that can write to it.

---

### 1. Persona Agent

**Role:** Owns and maintains the Persona Document.

**Triggered by:** Account creation, onboarding, behavioral signals, chat messages,
Proactive Agent interaction results, periodic re-evaluation.

**Outputs:** Updated Persona Document with sub-attribute scores, confidence values, hard
filters, nuance notes, decay flags, and engagement cadence data used by the Proactive
Agent.

---

### 2. Recommendations Agent

**Role:** Generates the 2+2 recommendation cards for the home feed.

**Triggered by:** Daily scheduled run, app open event.

**Generation process:**
1. Apply hard filters
2. Apply context filters (no outdoor recommendations in heavy rain)
3. Score remaining candidates via UCB
4. Apply diversity guardrails
5. Reserve exploration_budget slots for lowest-confidence categories
6. Generate plain-language reasoning per card

---

### 3. Feedback Agent

**Role:** Translates card and notification interactions into structured delta signals.

**Triggered by:** Any user interaction — in-app card, push notification, or email digest.

**Outputs:** Structured delta signal to the Persona Agent including dimension-level
deltas, circumstance score, user clarification if provided, decay flag, and any
graduated filter candidates. Also updates engagement cadence data for the Proactive Agent.

| Interaction       | Persona update?  | Notes                                              |
|-------------------|------------------|----------------------------------------------------|
| Like              | Yes              | Positive signal distributed across dimensions      |
| Save              | Yes (weak +)     | Interested — timing was wrong                      |
| Follow / I'm in   | Yes (strong +)   | Strongest positive signal                          |
| Reject / Not now  | Yes (discounted) | Penalty scaled by circumstance score               |
| Couldn't make it  | No               | Circumstantial — zero persona update               |

---

### 4. Chat Agent

**Role:** Interprets natural language into structured persona updates.

**Outputs:** Conversational reply + structured updates to the Persona Agent including
conditional preferences, nuance notes, hard filter candidates, and explicit preference
confirmations or reversals. Also generates proactive nudges.

---

### 5. Proactive Agent

**Role:** Decides when to reach out to the user, with what, and through which channel.
Runs continuously in the background. Never generates recommendations itself — it requests
them from the Recommendations Agent when a trigger fires.

**Trigger types (ranked by signal strength):**

| Trigger type       | Example                                                     | Channel          |
|--------------------|-------------------------------------------------------------|------------------|
| Opportunity-based  | Time-sensitive event matching persona, limited spots left   | Push notification |
| Context-based      | Weather window opens that fits a high-scoring activity      | Push notification |
| Gap-based          | User hasn't done their usual Sunday outdoor activity        | Push notification |
| Exploration nudge  | User hasn't tried a new category in 2+ weeks                | In-app badge     |
| Weekly digest      | 2+ surfaceable recommendations accumulated                  | Email            |
| Time-based         | Friday afternoon, weekend coming                            | Email / badge    |

**Interrupt worthiness scoring:**

Before pushing anything, the Proactive Agent scores whether this moment clears the bar
for interrupting the user:
```
interrupt_score = (
  persona_match_strength   // how well rec fits the persona
  × time_sensitivity       // higher for events happening soon
  × channel_appropriateness // no push notifications at 11pm
  × engagement_health      // backs off if recent pushes were dismissed
)
```

Only recommendations clearing a minimum interrupt_score threshold are sent. The
threshold rises automatically if the user dismisses pushes; it falls as they engage.

**Cadence rules:**
- Push notifications: at most 1 per day; never between 9pm–8am
- Email digest: at most once per week; only if 2+ items clear the threshold
- In-app badges: no limit — user sees these only when they choose to open the app

**Earned frequency:** The system starts conservative (one push every 2–3 days) and earns
the right to push more often as the user's engagement rate rises. Self-regulating —
no manual frequency settings required, though users can override at any time.

---

## Persona Document
```json
{
  "user_id": "abc123",
  "last_updated": "2026-03-27T09:00:00Z",

  "notification_preferences": {
    "push_enabled": true,
    "email_enabled": true,
    "quiet_hours": { "start": "21:00", "end": "08:00" }
  },

  "hard_filters": {
    "dietary": ["red_meat"],
    "distance_max_km": 25
  },

  "engagement_cadence": {
    "avg_days_between_opens": 2.4,
    "push_engagement_rate": 0.6,
    "email_engagement_rate": 0.4,
    "last_proactive_push": "2026-03-26T10:00:00Z",
    "current_interrupt_threshold": 0.65
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
    "social_preference":  { "value": "solo_or_small_group", "confidence": 0.8 },
    "time_of_day": {
      "morning": { "score": 0.30, "confidence": 0.6 },
      "evening":  { "score": 0.75, "confidence": 0.7 }
    },
    "budget_sensitivity": { "value": "moderate", "confidence": 0.5 },
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
- **Notification preferences** are set during onboarding and editable at any time —
  including a full opt-out from proactive features while keeping the app functional.
- Users can **view their full Persona Document** at any time in plain language.
- Users can **edit or delete any attribute** manually.
- Persona Boost lookup data is **not stored raw** — only inferences are retained.
- Designed for **GDPR and CCPA compliance** from day one.

---

## What Makes LetsGo Different

| Dimension              | Typical apps                  | LetsGo                                                    |
|------------------------|-------------------------------|-----------------------------------------------------------|
| Delivery model         | Pull (user opens app)         | Push + pull — app reaches out at the right moment         |
| Notification quality   | Scheduled blasts              | Trigger-based, interrupt-worthy, self-regulating cadence  |
| In-notification actions| "Open app to see more"        | One-tap Save / I'm in / Not now without opening the app   |
| Recommendation scope   | Broad list                    | 4 curated cards + timely proactive pushes                 |
| Learning mechanism     | Click behavior only           | Behavior + natural language + notification engagement      |
| Rejection handling     | Flat penalty on category      | Signal isolated per dimension, discounted by circumstance |
| Unexplored categories  | Score 0, never surfaced       | Prior 0.5, explored via UCB ranking                       |
| Hard constraints       | Treated as soft scores        | Graduated into a separate pre-scoring filter layer        |
| Transparency           | Black box                     | Plain-language reasoning on every card and notification   |
| Persona growth         | Calcifies over time           | Exploration budget + UCB prevents lock-in                 |
| Privacy                | Opaque                        | Full visibility, edit, and delete                         |