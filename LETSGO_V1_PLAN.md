# LetsGo V1 Plan With Active Learning

## Summary
LetsGo v1 is an invite-only Seattle beta for a single 21+ user, delivered as a native iPhone app with push notifications, a weekly email digest, and an in-app chat surface. The product vision remains broad local discovery, but launch quality is guaranteed for three pillars only: events, dining, and outdoors, with nightlife included as a secondary dining subcategory.

The production system is hybrid, not fully agentic in the runtime sense. Deterministic services own inventory, scoring, scheduling, state, and delivery. LLMs are used only for chat understanding, Persona Boost inference extraction, explanation polishing, and question generation inside a controlled framework. Persona state is event-sourced with a current snapshot, and every ranking-relevant inference must remain visible and editable in plain language.

A first-class Active Learning subsystem is part of v1. LetsGo does not only learn from taps and chat; it proactively asks short questions through push, attached follow-ups, and unsolicited in-app chat prompts. The goal is to continuously refine both taste preferences and interruption strategy with minimal friction.

## Product Behavior
- Launch market is Seattle only.
- Client is iPhone-first using native SwiftUI.
- Auth supports Apple, Google, and email.
- Feed is elastic with a default of 6 cards and a hard range of 3-8.
- Feed diversity is strict across pillar, time shape, social mode, and price band unless inventory is too sparse.
- Weekly digest sends only if at least 2 items qualify and targets 3 items.
- Push notifications are single-recommendation only.
- Push cadence uses one shared push budget across recommendation pushes and learning pushes.
- Recommendation pushes always outrank learning pushes.
- Quiet hours are system-default only: 9pm-8am local time.
- User-facing notification controls are channel-only: push on/off and email on/off.
- In-app booking is out of scope; all items deep-link out.
- Travel behavior keeps one stable home persona while ranking local inventory from current location when the user is clearly away.

## Recommendation And Feedback Model
- Core cross-channel actions are `I'm in`, `Maybe`, `Pass`, and `Can't`.
- `I'm in` is the strongest positive signal and may trigger a lightweight post-activity confirmation prompt after the relevant time window.
- `Maybe` is neutral. It creates resurfacing and reminder eligibility but does not directly change preference scores.
- `Pass` is a discounted negative and follows the ambiguity-first philosophy from the original spec.
- `Can't` is circumstantial by default and does not penalize persona preference scores.
- `Pass` and `Can't` may trigger a quick reason picker plus optional free text.
- Attached learning follow-ups are allowed only after `Pass` or `Can't`.
- Negative confidence decays toward neutral over time and decays faster when later behavior contradicts prior assumptions.
- Hard filters may auto-promote after repeated low-circumstance evidence or explicit user statements, but every active hard filter must appear in the plain-language persona editor.

## Persona Boost And Trust Model
- Persona Boost is opt-in and happens before the first real feed is shown.
- Persona Boost may use email-based discovery from public sources, but not create hidden ranking-only signals.
- Every accepted boost-derived inference must become visible and editable in the persona UI.
- Persona UI is plain-language only. Users see and edit preferences, constraints, and summaries, not raw scores or internal numeric confidence.
- Chat auto-applies most persona updates, but every applied change must be logged, visible, and reversible.
- Account deletion is in-product. Historical events are anonymized rather than fully purged, and anonymized cross-user data may be used only as weak priors and popularity/context signals.

## Active Learning System
- Add a first-class `Learning Service` to the architecture. It owns question selection, cadence scoring, channel choice, and learning-event generation. It does not write persona state directly.
- Learning unlocks only after onboarding is complete, Persona Boost is completed or skipped, and the user has produced 3-5 meaningful events such as actions, chat updates, or one post-activity confirmation.
- The learning selector ranks candidate questions by expected near-term recommendation lift first, then weak-confidence bias. Its value function includes both recommendation uncertainty and proactive-delivery uncertainty.
- Question selection is topic-stateless. The system does not remember “avoid this topic”; ignored questions only reduce overall learning cadence.
- Learning cadence starts moderately eager at about 3-4 learning prompts per week total and can continue increasing as long as users keep answering.
- Positive engagement for cadence increases means answered questions only. Opens, views, and taps without answers do not count.
- Ignored or dismissed learning questions lower overall learning cadence regardless of channel.
- All proactive learning shares one budget, including standalone nudges and attached follow-ups.
- Recommendation-attached follow-ups are not free. They count against the same learning-pressure budget as standalone nudges.
- Standalone learning uses push first when no stronger recommendation deserves that push slot.
- If a standalone push learning nudge is ignored, it expires after 60 minutes.
- An expired push learning opportunity may later reappear as an unsolicited in-app chat prompt if it is still valuable.
- Unsolicited in-app learning prompts appear as a system message in the chat thread, with a badge or hint drawing the user there. They do not appear as modals.
- At most one unsolicited in-app learning prompt may appear per app session.
- Total learning load is capped at 2 questions per app session.
- Attached follow-up questions appear only after the user responds to a recommendation with `Pass` or `Can't`.
- Attached follow-ups may ask the highest-value loosely related question, not necessarily one strictly tied to the just-acted-on card.
- Attached follow-ups may ask about content, timing, or logistics.
- Ignored attached follow-ups count against cadence exactly like ignored standalone nudges.
- Learning interactions may be single-question or use one follow-up only.
- If a push-based learning question needs that one follow-up, the follow-up may happen only in in-app chat.
- Questions should come from a hybrid template library plus LLM generation path. Templates cover common uncertainty patterns; LLMs may compose new questions when needed.
- Question formats are mixed: default to one-tap structured answers, but allow short free-text prompts when nuance is genuinely needed.
- Comparative questions are allowed occasionally. Comparative answers produce relative boosts only, not a forced positive/negative split.
- Sensitive topics are allowed, but direct proactive asks must be context-gated by prior behavior, prior chat, or other clear recommendation relevance.
- Learning answers update the persona immediately and trigger immediate re-ranking where practical.
- New explicit learning answers temporarily outrank older inferred signals.
- Learning-answer signals decay over time and decay faster when contradicted by later behavior.
- Attached follow-up answers and standalone learning answers are identical in weighting, precedence, and decay.
- The learning subsystem’s primary success metric is downstream recommendation lift, not answer rate.

## System Architecture And Interfaces
- Use a managed cloud deployment with hosted Postgres, object storage, job queue/cron, and app hosting.
- Use TypeScript/Node for backend services.
- Use Postgres as the system of record with append-only events plus current snapshots.
- Keep embeddings limited to selective retrieval/memory support; final ranking and persona state remain structured.
- Public API remains REST/JSON.
- Core services are:
- `Persona Service` as the only writer of `PersonaSnapshot`.
- `Recommendation Service` for feed ranking and proactive candidate ranking.
- `Feedback Service` for normalizing actions into typed events and delta proposals.
- `Chat Service` for conversational replies, refinement, and structured persona extraction.
- `Proactive Service` for channel choice, interrupt scoring, push/email scheduling, and delivery suppression.
- `Learning Service` for active-learning question selection, learning cadence, and learning-delivery planning.
- Internal core types are:
- `InventoryItem` with normalized pillar, tags, location, availability, price band, social mode, source metadata, and deep link.
- `PersonaEvent` as the append-only event envelope for actions, boost inferences, chat extractions, learning answers, confirmations, and system decisions.
- `PersonaSnapshot` as the current structured preference state, hard filters, cadence state, and plain-language projections.
- `BoostInference` with source provenance, confidence, visibility state, and acceptance status.
- `RecommendationCard` with explanation facts, confidence label, exploration tag, and allowed actions.
- `LearningQuestion` with topic family, expected lift, confidence gap, channel eligibility, structured answer schema, and optional comparison mode.
- `LearningAnswer` with answer payload, source surface, timestamp, and linked question metadata.
- `ProactiveDecision` with channel, reason type, interrupt score, suppression reason, and selected content ID.
- Public API additions and expectations:
- `GET /feed` returns 3-8 cards plus explanation text, confidence label, action schema, and any eligible attached follow-up contract.
- `POST /actions` accepts recommendation actions and optional quick reasons/free text.
- `POST /chat/messages` supports normal conversation plus unsolicited learning-prompt responses.
- `GET /persona` and `PATCH /persona` expose only plain-language editable state.
- `POST /persona-boost/start` and `GET /persona-boost/status` run boost lifecycle.
- `POST /notifications/preferences` stores channel toggles only.
- `GET /learning/prompt` may be used by the app to fetch any eligible unsolicited in-app learning message for the current session.
- `POST /learning/answer` records standalone or follow-up learning answers.
- `DELETE /account` triggers anonymization flow.

## Inventory, Ranking, And Operations
- Inventory refresh is nightly by default with same-day availability validation before proactive sends.
- Use one provider adapter per launch pillar first; do not build generalized multi-provider merge logic until adapters are stable.
- Ranking uses balanced exploration with 1-2 exploration cards in a normal 6-card feed and never more than 2 exploration cards in one feed or digest.
- Ops scope is audit-and-debug first, not curation-first.
- Internal ops console must support persona timelines, event replay inspection, recommendation explanation audit, notification logs, learning-question logs, source-health views, hard-filter audit, and feature flags/kill switches.
- Feature flags must independently gate Persona Boost, active learning, proactive pushes, calendar access, significant-location access, and nightlife recommendations.
- Rollout is invite-only Seattle beta with cohort gating, internal dogfood mode, and staged activation of Persona Boost and active learning.

## Test Plan
- Deterministic event-replay simulations for persona evolution, including learning answers, contradictory behavior, and decay.
- Unit tests for `I'm in`, `Maybe`, `Pass`, and `Can't` semantics across feed, push, and email.
- Tests proving `Pass` remains ambiguity-first and `Can't` remains circumstantial.
- Tests for attached follow-up eligibility after `Pass` and `Can't` only.
- Learning-selector tests covering expected-lift-first ranking, low-confidence secondary weighting, and stateless topic selection.
- Cadence tests covering eager start, answer-based acceleration, ignore-based backoff, and one shared learning budget.
- Push-budget tests proving recommendation pushes outrank learning pushes and respect shared caps and quiet hours.
- TTL tests proving standalone learning pushes expire at 60 minutes and may later reappear only as in-app prompts.
- Session-load tests proving at most one unsolicited in-app learning prompt and at most two total learning questions per session.
- Immediate-application tests proving learning answers re-rank feed/proactive candidates right away where practical.
- Comparative-question tests proving relative boost behavior without false hard negatives.
- Sensitive-topic tests proving direct asks require context gating.
- Diversity tests proving feed repetition controls hold under high-confidence inventory conditions.
- Travel/location tests proving live-location-first inventory works while one stable persona persists.
- Persona Boost tests proving every ranking-relevant inference stays visible/editable and never becomes a hidden ranking-only signal.
- Privacy tests for account deletion anonymization, auth unlinking, consent records, and retention boundaries.
- Ops-console tests for learning logs, event replay, explanation audit, and feature-flag kill switches.

## Assumptions And Defaults
- Consumer web is out of scope for v1; only the internal ops console is web.
- Android is out of scope.
- Group planning is out of scope.
- Export is out of scope even though delete/anonymize is in scope.
- The app remains persona-first; aggregate cross-user learning is weak prior information only.
- The learning system is a core product feature and has no separate user-facing toggle in v1.
- Brevity wins over explanation inside learning prompts themselves, but any resulting persona change must still remain visible/editable afterward.
- Active learning is a launch-critical subsystem and must ship behind its own kill switch.
