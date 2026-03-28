# API Contracts Reference

All endpoints use the standard response envelope:

```typescript
// Success
{ "data": T, "error": null }

// Error
{ "data": null, "error": { "code": string, "message": string, "details?": object } }
```

All endpoints require `Authorization: Bearer <token>` header.

---

## GET /feed

Returns the personalized recommendation feed.

**Edge Function:** `feed`

**Response:**
```json
{
  "data": {
    "cards": [
      {
        "id": "uuid",
        "itemId": "uuid",
        "score": 0.85,
        "confidenceLabel": "strong_match",
        "isExploration": false,
        "explanationFacts": [
          { "factType": "preference_match", "factKey": "music", "factValue": "jazz", "contributes": "positive" }
        ],
        "explanationText": "Based on your love of live jazz",
        "allowedActions": ["im_in", "maybe", "pass", "cant"],
        "eligibleFollowUp": null,
        "position": 1
      }
    ],
    "feedSize": 6,
    "explorationCount": 1,
    "generatedAt": "2026-03-28T10:00:00Z"
  },
  "error": null
}
```

**Rules:**
- Feed size: default 6, valid range 3-8
- Max 2 exploration cards per feed
- Strict diversity across pillar, time shape, social mode, price band

---

## POST /actions

Records a user action on a recommendation card.

**Edge Function:** `actions`

**Request:**
```json
{
  "recommendationId": "uuid",
  "actionType": "pass",
  "reasons": ["too_expensive"],
  "freeText": "Not my vibe"
}
```

**Response:**
```json
{
  "data": {
    "accepted": true,
    "personaUpdated": true,
    "eligibleFollowUp": null,
    "feedStale": true
  },
  "error": null
}
```

**Action Types:** `im_in`, `maybe`, `pass`, `cant`
- `reasons` and `freeText` allowed only for `pass` and `cant`
- `eligibleFollowUp` returned only after `pass` or `cant`

---

## POST /chat/messages

Send a chat message and receive AI-powered response with optional persona updates.

**Edge Function:** `chat-messages`

**Request:**
```json
{
  "message": "I love Thai food",
  "conversationId": null,
  "learningPromptResponseId": null
}
```

**Response:**
```json
{
  "data": {
    "reply": "Got it! I'll prioritize Thai restaurants.",
    "conversationId": "conv-001",
    "personaUpdatesApplied": [
      { "field": "cuisine_preference", "oldValue": "neutral", "newValue": "positive: Thai" }
    ],
    "feedStale": true
  },
  "error": null
}
```

---

## GET /persona

Returns the user's editable persona state in plain language.

**Edge Function:** `persona` (method: GET)

**Response:**
```json
{
  "data": {
    "projections": [
      { "id": "plp-001", "category": "music", "statement": "You love live jazz", "confidence": "strong", "editable": true }
    ],
    "hardFilters": [
      { "id": "hf-001", "label": "No shellfish", "active": true, "promotedFrom": "repeated_pass" }
    ],
    "boostState": { "completed": true, "skipped": false }
  },
  "error": null
}
```

---

## PATCH /persona

Edit persona preferences and hard filters.

**Edge Function:** `persona` (method: PATCH)

**Request:**
```json
{
  "edits": [
    { "projectionId": "plp-001", "newValue": "You enjoy live music" }
  ],
  "hardFilterToggles": [
    { "filterId": "hf-001", "active": false }
  ]
}
```

**Response:**
```json
{
  "data": {
    "updated": true,
    "projections": [],
    "feedStale": true
  },
  "error": null
}
```

---

## POST /persona-boost/start

Start the Persona Boost discovery process.

**Edge Function:** `persona-boost-start`

**Request:**
```json
{
  "email": "user@example.com",
  "consentGiven": true
}
```

**Response:**
```json
{
  "data": {
    "boostId": "uuid",
    "status": "processing"
  },
  "error": null
}
```

---

## GET /persona-boost/status

Check Persona Boost progress and results.

**Edge Function:** `persona-boost-status`

**Response:**
```json
{
  "data": {
    "status": "completed",
    "inferences": [],
    "startedAt": "2026-03-27T00:00:00Z",
    "completedAt": "2026-03-27T00:05:00Z"
  },
  "error": null
}
```

**Statuses:** `not_started`, `processing`, `completed`, `skipped`

---

## POST /notifications/preferences

Set channel-level notification preferences.

**Edge Function:** `notifications-preferences`

**Request:**
```json
{
  "push": true,
  "email": false
}
```

**Response:**
```json
{ "data": { "updated": true }, "error": null }
```

---

## GET /learning/prompt

Fetch an eligible unsolicited learning question for the current session.

**Edge Function:** `learning-prompt`

**Response:**
```json
{
  "data": {
    "prompt": {
      "id": "uuid",
      "topicFamily": "cuisine_preference",
      "questionText": "Which cuisine do you enjoy most for a casual dinner?",
      "expectedLift": 0.12,
      "confidenceGap": 0.45,
      "channelEligibility": ["in_app_chat"],
      "answerSchema": { "type": "single_select", "options": ["Thai", "Italian", "Japanese", "Mexican"] },
      "isComparative": false,
      "comparisonItems": null,
      "sourceType": "template",
      "sensitiveTopicFlag": false,
      "createdAt": "2026-03-28T00:00:00Z",
      "expiresAt": null
    },
    "sessionLearningCount": 0,
    "sessionCap": 2
  },
  "error": null
}
```

**Rules:**
- Returns `null` prompt when no question is eligible or session cap reached
- Max 1 unsolicited in-app prompt per session, max 2 total learning questions per session

---

## POST /learning/answer

Submit an answer to a learning question.

**Edge Function:** `learning-answer`

**Request:**
```json
{
  "questionId": "uuid",
  "answer": { "selected": "Thai" },
  "sourceSurface": "push",
  "linkedRecommendationId": null
}
```

**Response:**
```json
{
  "data": {
    "accepted": true,
    "personaUpdated": true,
    "feedStale": true,
    "followUpQuestion": null
  },
  "error": null
}
```

**Source surfaces:** `push`, `in_app_chat`, `attached_follow_up`

---

## DELETE /account

Delete user account with anonymization.

**Edge Function:** `account-delete`

**Response:**
```json
{
  "data": {
    "anonymized": true,
    "scheduledDeletionAt": "2026-04-28T00:00:00Z"
  },
  "error": null
}
```

Historical events are anonymized rather than fully purged.
