# LetsGo iOS - Implementation Scope Tracker

## Current Pass: Core Feed Experience (v0.1)

### DONE (In This Pass)

| Screen | Status | Notes |
|--------|--------|-------|
| Home Feed | Done | 3-8 elastic cards, confidence badges, explanation text, tags, 4 action buttons |
| Card Detail / Deep-link | Done | Full card view, "Why we picked this", tags, actions, venue deep-link |
| Pass Reason Picker | Done | 6 reasons + optional free-text, privacy framing |
| Can't Reason Picker | Done | 6 circumstantial reasons + optional free-text |
| Attached Follow-up Learning | Done | 4 structured answers, session cap (max 2), skip option |
| Push Notification Preview | Done | Lock screen mockup, recommendation push (blue) + learning push (purple, 60-min TTL) |
| Post-Activity Confirmation | Done | "Did you go?" 3 sentiment options, skippable |
| Weekly Digest Preview | Done | Email-style, 3 curated picks, CTA deep-links |

### Infrastructure Built

| Component | Status | Notes |
|-----------|--------|-------|
| Xcode project scaffold | Done | iOS 17+, SwiftUI, SPM |
| Data models + enums | Done | RecommendationCard, LearningQuestion, FeedAction, etc. |
| APIClientProtocol | Done | Protocol-based, mock-swappable |
| MockAPIClient + MockData | Done | Seattle-themed realistic fixtures |
| LiveAPIClient stub | Done | Placeholder for real backend |
| SessionTracker | Done | Per-session learning cap (max 2) |
| AppState | Done | Global state, DI via environment |
| Navigation (Route + AppRouter) | Done | Typed NavigationStack routing |
| Tab bar | Done | Feed / Notifications / Digest |
| Unit tests | Done | Models, ViewModels, Services, API client |

---

## NOT DONE (Deferred to Future Passes)

### P0 - Blocks Launch

| Screen / Feature | Priority | Dependency | Notes |
|------------------|----------|------------|-------|
| Welcome / Splash Screen | P0 | None | Branded gradient splash with "Get Started" / "Sign In" CTAs |
| Sign In (Apple / Google / Email) | P0 | Backend auth endpoints | 3 auth methods, session restore, token management |
| Onboarding Walkthrough | P0 | After auth | 3-step swipeable intro to events/dining/outdoors pillars |
| Persona Boost UI | P0 | Backend boost endpoints | Accept/Edit/Reject inferences, progress bar, skip option |
| Chat Thread UI | P0 | Backend chat endpoints | iMessage-style, system messages for learning prompts, persona extraction |
| Persona Editor | P0 | Backend persona endpoints | Plain-language preferences, source provenance, hard filter toggles, summary |
| Settings / Notification Preferences | P0 | Backend preferences endpoint | Push/email toggles, linked accounts, location, privacy, delete account |
| Real APNs Push Integration | P0 | Backend proactive service | Actual push notification handling, not just preview mockup |
| Deep-link Handling (from push/email) | P0 | Push integration | Restore app state from notification tap |
| Session Restore / Auth State | P0 | Auth backend | Persist login, restore on app launch |

### P1 - Important for Beta Quality

| Feature | Priority | Notes |
|---------|----------|-------|
| Location Permission Flow | P1 | Permission request UX, travel-aware hints |
| Calendar Permission UX | P1 | Feature-flagged, optional |
| Immediate Feed Refresh | P1 | Refresh feed after learning answers or persona edits |
| Persona Change Acknowledgement | P1 | Lightweight toast showing what changed in plain language |
| Post-Activity via Real Push | P1 | Currently mock; needs actual push trigger after event time |
| Unsolicited Chat Learning Prompts | P1 | In-app chat system messages (max 1 per session) |
| Chat-Based Persona Updates | P1 | Auto-apply + log + reversible persona changes from chat |

### P2 - Polish

| Feature | Priority | Notes |
|---------|----------|-------|
| Skeleton / Loading States | P2 | Shimmer placeholders for feed, detail, chat |
| Offline / Error UX | P2 | Graceful degradation, retry mechanisms |
| Beta Instrumentation | P2 | UI-level funnel tracking for internal beta |
| Animation / Transition Polish | P2 | Card transitions, action feedback, learning prompt entrance |
| Accessibility | P2 | VoiceOver labels, Dynamic Type, contrast compliance |

### Backend Dependencies (Not iOS Work, But Blocks Full Integration)

| Backend Service | Required For | Status |
|-----------------|-------------|--------|
| Auth Service (Apple/Google/Email) | Sign In screen | Not started |
| GET /feed endpoint | Real feed data | Not started |
| POST /actions endpoint | Real action submission | Not started |
| POST /chat/messages endpoint | Chat thread | Not started |
| GET/PATCH /persona endpoints | Persona editor | Not started |
| POST /persona-boost/start + GET /status | Persona Boost UI | Not started |
| GET /learning/prompt + POST /learning/answer | Real learning prompts | Not started |
| POST /notifications/preferences | Settings toggles | Not started |
| DELETE /account | Account deletion | Not started |
| APNs Push Pipeline | Real push notifications | Not started |
| Weekly Digest Email Pipeline | Real digest sends | Not started |

---

## Picking Up Deferred Work

When ready to implement deferred screens:

1. **Auth + Onboarding** (next logical pass): Welcome, Sign In, Onboarding, Persona Boost - requires backend auth service
2. **Chat + Persona** (third pass): Chat Thread, Persona Editor, Settings - requires backend chat/persona services
3. **Real Push + Deep-links** (integration pass): Replace preview mockups with actual APNs, deep-link routing
4. **Polish** (final pass): Loading states, offline UX, accessibility, animations
