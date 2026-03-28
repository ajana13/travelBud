import { describe, it, expect } from "vitest";
import { z } from "zod";

// These imports will fail until implementations exist — TDD red phase
import {
  InventoryItemSchema,
  PersonaEventSchema,
  PersonaSnapshotSchema,
  BoostInferenceSchema,
  RecommendationCardSchema,
  LearningQuestionSchema,
  LearningAnswerSchema,
  ProactiveDecisionSchema,
} from "../src/domain/index.js";

// ─── InventoryItem ──────────────────────────────────────────────────────────

describe("InventoryItem", () => {
  const validItem = {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    sourceId: "evt-12345",
    sourceProvider: "eventbrite",
    pillar: "events",
    title: "Seattle Jazz Night",
    description: "Live jazz at The Crocodile",
    tags: ["music", "jazz", "live"],
    location: {
      lat: 47.6062,
      lng: -122.3321,
      address: "2505 1st Ave, Seattle, WA 98121",
      neighborhood: "Belltown",
    },
    availability: {
      start: "2026-04-01T19:00:00Z",
      end: "2026-04-01T23:00:00Z",
      recurring: false,
    },
    priceBand: "mid",
    socialMode: "group",
    timeShape: "evening",
    nightlife: false,
    deepLink: "https://eventbrite.com/e/12345",
    imageUrl: "https://img.example.com/jazz.jpg",
    sourceMeta: { originalCategory: "music" },
    lastRefreshedAt: "2026-03-28T00:00:00Z",
    availabilityVerifiedAt: null,
    active: true,
    createdAt: "2026-03-27T00:00:00Z",
    updatedAt: "2026-03-28T00:00:00Z",
  };

  it("accepts a valid inventory item", () => {
    const result = InventoryItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("rejects invalid pillar", () => {
    const result = InventoryItemSchema.safeParse({
      ...validItem,
      pillar: "sports",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid priceBand", () => {
    const result = InventoryItemSchema.safeParse({
      ...validItem,
      priceBand: "expensive",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const { title, ...incomplete } = validItem;
    const result = InventoryItemSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });
});

// ─── PersonaEvent ───────────────────────────────────────────────────────────

describe("PersonaEvent", () => {
  const validActionEvent = {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    userId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    type: "action",
    version: 1,
    payload: {
      type: "action",
      actionType: "im_in",
      itemId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      reasons: null,
      freeText: null,
    },
    source: { surface: "feed", sessionId: "sess-001" },
    timestamp: "2026-03-28T10:00:00Z",
    sequenceNumber: 1,
  };

  const validLearningAnswerEvent = {
    id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    userId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    type: "learning_answer",
    version: 1,
    payload: {
      type: "learning_answer",
      questionId: "e5f6a7b8-c9d0-1234-efab-345678901234",
      answer: { selected: "thai" },
      sourceSurface: "push",
      linkedRecommendationId: null,
    },
    source: { surface: "push", sessionId: null },
    timestamp: "2026-03-28T11:00:00Z",
    sequenceNumber: 2,
  };

  it("accepts a valid action event", () => {
    const result = PersonaEventSchema.safeParse(validActionEvent);
    expect(result.success).toBe(true);
  });

  it("accepts a valid learning_answer event", () => {
    const result = PersonaEventSchema.safeParse(validLearningAnswerEvent);
    expect(result.success).toBe(true);
  });

  it("rejects invalid event type", () => {
    const result = PersonaEventSchema.safeParse({
      ...validActionEvent,
      type: "invalid_type",
      payload: { ...validActionEvent.payload, type: "invalid_type" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid action type in payload", () => {
    const result = PersonaEventSchema.safeParse({
      ...validActionEvent,
      payload: { ...validActionEvent.payload, actionType: "love" },
    });
    expect(result.success).toBe(false);
  });
});

// ─── PersonaSnapshot ────────────────────────────────────────────────────────

describe("PersonaSnapshot", () => {
  const validSnapshot = {
    userId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    version: 3,
    preferences: {
      pillar: { events: 0.7, dining: 0.5, outdoors: 0.3 },
      tags: { jazz: 0.8, thai: 0.6, hiking: 0.4 },
    },
    hardFilters: [
      {
        id: "hf-001",
        category: "dietary",
        label: "No shellfish",
        active: true,
        promotedFrom: "repeated_pass",
        createdAt: "2026-03-28T00:00:00Z",
      },
    ],
    cadenceState: {
      answeredCount: 5,
      ignoredCount: 1,
      currentRate: 3.5,
      lastUpdatedAt: "2026-03-28T10:00:00Z",
    },
    learningBudget: {
      usedThisPeriod: 2,
      periodStart: "2026-03-25T00:00:00Z",
      periodEnd: "2026-04-01T00:00:00Z",
    },
    boostState: {
      completed: true,
      skipped: false,
      startedAt: "2026-03-27T00:00:00Z",
      completedAt: "2026-03-27T00:05:00Z",
    },
    travelState: {
      isAway: false,
      currentLocation: null,
      homeLocation: { lat: 47.6062, lng: -122.3321 },
    },
    plainLanguageProjections: [
      {
        id: "plp-001",
        category: "music",
        statement: "You love live jazz and indie music",
        confidence: "strong",
        editable: true,
      },
    ],
    lastEventSequence: 12,
    rebuiltAt: "2026-03-28T10:00:00Z",
    updatedAt: "2026-03-28T10:00:00Z",
  };

  it("accepts a valid persona snapshot", () => {
    const result = PersonaSnapshotSchema.safeParse(validSnapshot);
    expect(result.success).toBe(true);
  });

  it("rejects missing userId", () => {
    const { userId, ...incomplete } = validSnapshot;
    const result = PersonaSnapshotSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });
});

// ─── BoostInference ─────────────────────────────────────────────────────────

describe("BoostInference", () => {
  const validInference = {
    id: "f6a7b8c9-d0e1-2345-fab0-456789012345",
    userId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    sourceType: "email_discovery",
    sourceDetail: "Subscribed to Seattle Jazz Society newsletter",
    inferredPreference: {
      category: "music",
      direction: "positive",
      strength: 0.7,
    },
    confidence: 0.65,
    visibilityState: "visible",
    acceptanceStatus: "accepted",
    plainLanguageLabel: "Interested in jazz music",
    createdAt: "2026-03-27T00:00:00Z",
    resolvedAt: "2026-03-27T00:10:00Z",
  };

  it("accepts a valid boost inference", () => {
    const result = BoostInferenceSchema.safeParse(validInference);
    expect(result.success).toBe(true);
  });

  it("rejects invalid visibility state", () => {
    const result = BoostInferenceSchema.safeParse({
      ...validInference,
      visibilityState: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid acceptance status", () => {
    const result = BoostInferenceSchema.safeParse({
      ...validInference,
      acceptanceStatus: "maybe",
    });
    expect(result.success).toBe(false);
  });
});

// ─── RecommendationCard ─────────────────────────────────────────────────────

describe("RecommendationCard", () => {
  const validCard = {
    id: "a7b8c9d0-e1f2-3456-ab01-567890123456",
    itemId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    score: 0.85,
    confidenceLabel: "strong_match",
    isExploration: false,
    explanationFacts: [
      {
        factType: "preference_match",
        factKey: "music",
        factValue: "jazz",
        contributes: "positive",
      },
    ],
    explanationText: "Based on your love of live jazz",
    allowedActions: ["im_in", "maybe", "pass", "cant"],
    eligibleFollowUp: null,
    position: 1,
  };

  it("accepts a valid recommendation card", () => {
    const result = RecommendationCardSchema.safeParse(validCard);
    expect(result.success).toBe(true);
  });

  it("rejects invalid confidence label", () => {
    const result = RecommendationCardSchema.safeParse({
      ...validCard,
      confidenceLabel: "perfect",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid action types in allowedActions", () => {
    const result = RecommendationCardSchema.safeParse({
      ...validCard,
      allowedActions: ["im_in", "love"],
    });
    expect(result.success).toBe(false);
  });
});

// ─── LearningQuestion ──────────────────────────────────────────────────────

describe("LearningQuestion", () => {
  const validQuestion = {
    id: "e5f6a7b8-c9d0-1234-efab-345678901234",
    topicFamily: "cuisine_preference",
    questionText: "Which cuisine do you enjoy most for a casual dinner?",
    expectedLift: 0.12,
    confidenceGap: 0.45,
    channelEligibility: ["push", "in_app_chat"],
    answerSchema: {
      type: "single_select",
      options: ["Thai", "Italian", "Japanese", "Mexican"],
    },
    isComparative: false,
    comparisonItems: null,
    sourceType: "template",
    sensitiveTopicFlag: false,
    createdAt: "2026-03-28T00:00:00Z",
    expiresAt: null,
  };

  it("accepts a valid learning question", () => {
    const result = LearningQuestionSchema.safeParse(validQuestion);
    expect(result.success).toBe(true);
  });

  it("accepts a comparative question", () => {
    const comparative = {
      ...validQuestion,
      isComparative: true,
      comparisonItems: { a: "Thai", b: "Italian" },
      answerSchema: {
        type: "single_select",
        options: ["Prefer Thai", "Prefer Italian", "Like both equally"],
      },
    };
    const result = LearningQuestionSchema.safeParse(comparative);
    expect(result.success).toBe(true);
  });

  it("accepts free_text answer schema", () => {
    const freeText = {
      ...validQuestion,
      answerSchema: { type: "free_text", maxLength: 200 },
    };
    const result = LearningQuestionSchema.safeParse(freeText);
    expect(result.success).toBe(true);
  });

  it("accepts scale answer schema", () => {
    const scale = {
      ...validQuestion,
      answerSchema: {
        type: "scale",
        min: 1,
        max: 5,
        labels: { low: "Not interested", high: "Love it" },
      },
    };
    const result = LearningQuestionSchema.safeParse(scale);
    expect(result.success).toBe(true);
  });

  it("rejects invalid channel", () => {
    const result = LearningQuestionSchema.safeParse({
      ...validQuestion,
      channelEligibility: ["sms"],
    });
    expect(result.success).toBe(false);
  });
});

// ─── LearningAnswer ────────────────────────────────────────────────────────

describe("LearningAnswer", () => {
  const validAnswer = {
    id: "b8c9d0e1-f2a3-4567-b012-678901234567",
    userId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    questionId: "e5f6a7b8-c9d0-1234-efab-345678901234",
    answerPayload: { selected: "Thai" },
    sourceSurface: "push",
    linkedRecommendationId: null,
    linkedActionType: null,
    timestamp: "2026-03-28T12:00:00Z",
  };

  it("accepts a valid learning answer", () => {
    const result = LearningAnswerSchema.safeParse(validAnswer);
    expect(result.success).toBe(true);
  });

  it("accepts an attached follow-up answer", () => {
    const followUp = {
      ...validAnswer,
      sourceSurface: "attached_follow_up",
      linkedRecommendationId: "a7b8c9d0-e1f2-3456-ab01-567890123456",
      linkedActionType: "pass",
    };
    const result = LearningAnswerSchema.safeParse(followUp);
    expect(result.success).toBe(true);
  });

  it("rejects invalid source surface", () => {
    const result = LearningAnswerSchema.safeParse({
      ...validAnswer,
      sourceSurface: "sms",
    });
    expect(result.success).toBe(false);
  });
});

// ─── ProactiveDecision ──────────────────────────────────────────────────────

describe("ProactiveDecision", () => {
  const validDecision = {
    id: "c9d0e1f2-a3b4-5678-c012-789012345678",
    userId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    channel: "push",
    contentType: "recommendation",
    selectedContentId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    reasonType: "high_score",
    interruptScore: 0.88,
    delivered: true,
    suppressionReason: null,
    scheduledAt: "2026-03-28T12:00:00Z",
    deliveredAt: "2026-03-28T12:00:05Z",
    respondedAt: "2026-03-28T12:05:00Z",
    responseType: "tapped",
  };

  it("accepts a valid proactive decision", () => {
    const result = ProactiveDecisionSchema.safeParse(validDecision);
    expect(result.success).toBe(true);
  });

  it("accepts a suppressed decision", () => {
    const suppressed = {
      ...validDecision,
      delivered: false,
      suppressionReason: "quiet_hours",
      deliveredAt: null,
      respondedAt: null,
      responseType: null,
    };
    const result = ProactiveDecisionSchema.safeParse(suppressed);
    expect(result.success).toBe(true);
  });

  it("rejects invalid channel", () => {
    const result = ProactiveDecisionSchema.safeParse({
      ...validDecision,
      channel: "sms",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid content type", () => {
    const result = ProactiveDecisionSchema.safeParse({
      ...validDecision,
      contentType: "advertisement",
    });
    expect(result.success).toBe(false);
  });
});
