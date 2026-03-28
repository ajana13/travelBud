import { describe, it, expect } from "vitest";
import { z } from "zod";

import {
  ApiResponseSchema,
  ApiErrorSchema,
  FeedResponseSchema,
  ActionRequestSchema,
  ActionResponseSchema,
  ChatMessageRequestSchema,
  ChatMessageResponseSchema,
  PersonaResponseSchema,
  PersonaPatchRequestSchema,
  PersonaPatchResponseSchema,
  PersonaBoostStartRequestSchema,
  PersonaBoostStartResponseSchema,
  PersonaBoostStatusResponseSchema,
  NotificationPreferencesRequestSchema,
  NotificationPreferencesResponseSchema,
  LearningPromptResponseSchema,
  LearningAnswerRequestSchema,
  LearningAnswerResponseSchema,
  AccountDeleteResponseSchema,
} from "../src/api/index.js";

// ─── Common ─────────────────────────────────────────────────────────────────

describe("ApiResponse envelope", () => {
  it("accepts a success response", () => {
    const schema = ApiResponseSchema(z.object({ name: z.string() }));
    const result = schema.safeParse({ data: { name: "test" }, error: null });
    expect(result.success).toBe(true);
  });

  it("accepts an error response", () => {
    const schema = ApiResponseSchema(z.object({ name: z.string() }));
    const result = schema.safeParse({
      data: null,
      error: { code: "NOT_FOUND", message: "Not found" },
    });
    expect(result.success).toBe(true);
  });
});

describe("ApiError", () => {
  it("accepts a valid error", () => {
    const result = ApiErrorSchema.safeParse({
      code: "VALIDATION_ERROR",
      message: "Invalid input",
      details: { field: "email" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts error without details", () => {
    const result = ApiErrorSchema.safeParse({
      code: "INTERNAL",
      message: "Something went wrong",
    });
    expect(result.success).toBe(true);
  });
});

// ─── Feed ───────────────────────────────────────────────────────────────────

describe("GET /feed", () => {
  it("accepts a valid feed response", () => {
    const result = FeedResponseSchema.safeParse({
      cards: [],
      feedSize: 0,
      explorationCount: 0,
      generatedAt: "2026-03-28T10:00:00Z",
    });
    expect(result.success).toBe(true);
  });
});

// ─── Actions ────────────────────────────────────────────────────────────────

describe("POST /actions", () => {
  it("accepts a valid action request", () => {
    const result = ActionRequestSchema.safeParse({
      recommendationId: "a7b8c9d0-e1f2-3456-ab01-567890123456",
      actionType: "im_in",
      reasons: null,
      freeText: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts pass action with reasons", () => {
    const result = ActionRequestSchema.safeParse({
      recommendationId: "a7b8c9d0-e1f2-3456-ab01-567890123456",
      actionType: "pass",
      reasons: ["too_expensive", "too_far"],
      freeText: "Not my vibe",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid action type", () => {
    const result = ActionRequestSchema.safeParse({
      recommendationId: "a7b8c9d0-e1f2-3456-ab01-567890123456",
      actionType: "love",
      reasons: null,
      freeText: null,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid action response", () => {
    const result = ActionResponseSchema.safeParse({
      accepted: true,
      personaUpdated: true,
      eligibleFollowUp: null,
      feedStale: true,
    });
    expect(result.success).toBe(true);
  });
});

// ─── Chat ───────────────────────────────────────────────────────────────────

describe("POST /chat/messages", () => {
  it("accepts a valid chat request", () => {
    const result = ChatMessageRequestSchema.safeParse({
      message: "I love Thai food",
      conversationId: null,
      learningPromptResponseId: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid chat response", () => {
    const result = ChatMessageResponseSchema.safeParse({
      reply: "Got it! I'll prioritize Thai restaurants.",
      conversationId: "conv-001",
      personaUpdatesApplied: [
        {
          field: "cuisine_preference",
          oldValue: "neutral",
          newValue: "positive: Thai",
        },
      ],
      feedStale: true,
    });
    expect(result.success).toBe(true);
  });
});

// ─── Persona ────────────────────────────────────────────────────────────────

describe("GET/PATCH /persona", () => {
  it("accepts a valid persona response", () => {
    const result = PersonaResponseSchema.safeParse({
      projections: [
        {
          id: "plp-001",
          category: "music",
          statement: "You love live jazz",
          confidence: "strong",
          editable: true,
        },
      ],
      hardFilters: [
        {
          id: "hf-001",
          label: "No shellfish",
          active: true,
          promotedFrom: "repeated_pass",
        },
      ],
      boostState: { completed: true, skipped: false },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid persona patch request", () => {
    const result = PersonaPatchRequestSchema.safeParse({
      edits: [{ projectionId: "plp-001", newValue: "You enjoy live music" }],
      hardFilterToggles: [{ filterId: "hf-001", active: false }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid persona patch response", () => {
    const result = PersonaPatchResponseSchema.safeParse({
      updated: true,
      projections: [],
      feedStale: true,
    });
    expect(result.success).toBe(true);
  });
});

// ─── Persona Boost ──────────────────────────────────────────────────────────

describe("Persona Boost", () => {
  it("accepts a valid boost start request", () => {
    const result = PersonaBoostStartRequestSchema.safeParse({
      email: "user@example.com",
      consentGiven: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid boost start response", () => {
    const result = PersonaBoostStartResponseSchema.safeParse({
      boostId: "f6a7b8c9-d0e1-2345-fab0-456789012345",
      status: "processing",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid boost status response", () => {
    const result = PersonaBoostStatusResponseSchema.safeParse({
      status: "completed",
      inferences: [],
      startedAt: "2026-03-27T00:00:00Z",
      completedAt: "2026-03-27T00:05:00Z",
    });
    expect(result.success).toBe(true);
  });
});

// ─── Notifications ──────────────────────────────────────────────────────────

describe("POST /notifications/preferences", () => {
  it("accepts a valid notification preferences request", () => {
    const result = NotificationPreferencesRequestSchema.safeParse({
      push: true,
      email: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid response", () => {
    const result = NotificationPreferencesResponseSchema.safeParse({
      updated: true,
    });
    expect(result.success).toBe(true);
  });
});

// ─── Learning ───────────────────────────────────────────────────────────────

describe("Learning endpoints", () => {
  it("accepts a valid learning prompt response with question", () => {
    const result = LearningPromptResponseSchema.safeParse({
      prompt: {
        id: "e5f6a7b8-c9d0-1234-efab-345678901234",
        topicFamily: "cuisine",
        questionText: "What cuisine do you prefer?",
        expectedLift: 0.12,
        confidenceGap: 0.45,
        channelEligibility: ["in_app_chat"],
        answerSchema: {
          type: "single_select",
          options: ["Thai", "Italian"],
        },
        isComparative: false,
        comparisonItems: null,
        sourceType: "template",
        sensitiveTopicFlag: false,
        createdAt: "2026-03-28T00:00:00Z",
        expiresAt: null,
      },
      sessionLearningCount: 0,
      sessionCap: 2,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a null prompt when no question eligible", () => {
    const result = LearningPromptResponseSchema.safeParse({
      prompt: null,
      sessionLearningCount: 2,
      sessionCap: 2,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid learning answer request", () => {
    const result = LearningAnswerRequestSchema.safeParse({
      questionId: "e5f6a7b8-c9d0-1234-efab-345678901234",
      answer: { selected: "Thai" },
      sourceSurface: "push",
      linkedRecommendationId: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid learning answer response", () => {
    const result = LearningAnswerResponseSchema.safeParse({
      accepted: true,
      personaUpdated: true,
      feedStale: true,
      followUpQuestion: null,
    });
    expect(result.success).toBe(true);
  });
});

// ─── Account Deletion ───────────────────────────────────────────────────────

describe("DELETE /account", () => {
  it("accepts a valid account delete response", () => {
    const result = AccountDeleteResponseSchema.safeParse({
      anonymized: true,
      scheduledDeletionAt: "2026-04-28T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });
});
