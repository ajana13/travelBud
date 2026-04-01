import { describe, it, expect, beforeEach } from "vitest";
import {
  generateChatReply,
  startPersonaBoost,
  getBoostStatus,
  polishExplanation,
  generateLearningQuestion,
} from "../../../../insforge/functions/_shared/ai-service.ts";
import { seedTable, getTableData, resetMock } from "../../mocks/insforge-sdk.ts";

beforeEach(() => resetMock());

describe("ai-service", () => {
  describe("generateChatReply()", () => {
    it("returns a reply with conversationId", async () => {
      const result = await generateChatReply("user-001", "Hello there", null);
      expect(result.reply).toBeTruthy();
      expect(typeof result.conversationId).toBe("string");
      expect(result.conversationId.length).toBeGreaterThan(0);
    });

    it("uses provided conversationId", async () => {
      const result = await generateChatReply("user-001", "Hello", "conv-123");
      expect(result.conversationId).toBe("conv-123");
    });

    it("extracts preferences from food-related messages", async () => {
      const result = await generateChatReply("user-001", "I love sushi", null);
      expect(result.personaUpdatesApplied.length).toBeGreaterThan(0);
      expect(result.feedStale).toBe(true);
      const sushiUpdate = result.personaUpdatesApplied.find((u) => u.field === "sushi");
      expect(sushiUpdate).toBeDefined();
    });

    it("returns no updates for generic messages", async () => {
      const result = await generateChatReply("user-001", "Hello world", null);
      expect(result.personaUpdatesApplied).toHaveLength(0);
      expect(result.feedStale).toBe(false);
    });

    it("stores chat_extraction events in persona_events", async () => {
      await generateChatReply("user-001", "I love hiking and music", null);
      const events = getTableData("persona_events");
      expect(events).toBeDefined();
      const chatEvents = events!.filter((e) => e.type === "chat_extraction");
      expect(chatEvents.length).toBeGreaterThanOrEqual(2);
    });

    it("returns food-related reply for food messages", async () => {
      const result = await generateChatReply("user-001", "I love eating sushi", null);
      expect(result.reply).toContain("food");
    });

    it("returns outdoor-related reply for outdoor messages", async () => {
      const result = await generateChatReply("user-001", "I enjoy hiking in nature", null);
      expect(result.reply).toContain("Outdoor");
    });
  });

  describe("startPersonaBoost()", () => {
    it("returns failed when consent not given", async () => {
      const result = await startPersonaBoost("user-001", "test@test.com", false);
      expect(result.status).toBe("failed");
    });

    it("returns completed with boostId when consent given", async () => {
      const result = await startPersonaBoost("user-001", "test@test.com", true);
      expect(result.status).toBe("completed");
      expect(result.boostId).toBeTruthy();
    });

    it("creates boost_inferences rows", async () => {
      await startPersonaBoost("user-001", "test@test.com", true);
      const inferences = getTableData("boost_inferences");
      expect(inferences).toBeDefined();
      expect(inferences!.length).toBe(3);
      expect(inferences![0].user_id).toBe("user-001");
    });

    it("updates persona snapshot boostState", async () => {
      await startPersonaBoost("user-001", "test@test.com", true);
      const snaps = getTableData("persona_snapshots");
      expect(snaps).toBeDefined();
      expect(snaps!.length).toBe(1);
      expect(snaps![0].boost_state.completed).toBe(true);
    });

    it("appends boost_inference events to persona_events", async () => {
      await startPersonaBoost("user-001", "test@test.com", true);
      const events = getTableData("persona_events");
      expect(events).toBeDefined();
      const boostEvents = events!.filter((e) => e.type === "boost_inference");
      expect(boostEvents.length).toBe(3);
    });

    it("returns completed for already-boosted user", async () => {
      seedTable("persona_snapshots", [{
        id: "user-001",
        user_id: "user-001",
        version: 1,
        preferences: { pillar: {}, tags: {} },
        hard_filters: [],
        cadence_state: { answeredCount: 0, ignoredCount: 0, currentRate: 1, lastUpdatedAt: "" },
        learning_budget: { usedThisPeriod: 0, periodStart: "", periodEnd: "" },
        boost_state: { completed: true, skipped: false, startedAt: "2026-01-01", completedAt: "2026-01-01" },
        travel_state: { isAway: false, currentLocation: null, homeLocation: { lat: 47.6, lng: -122.3 } },
        plain_language_projections: [],
        last_event_sequence: 0,
        rebuilt_at: "2026-01-01",
        updated_at: "2026-01-01",
      }]);
      const result = await startPersonaBoost("user-001", "test@test.com", true);
      expect(result.status).toBe("completed");
      const inferences = getTableData("boost_inferences");
      expect(inferences).toBeUndefined();
    });
  });

  describe("getBoostStatus()", () => {
    it("returns not_started for new user", async () => {
      const result = await getBoostStatus("user-001");
      expect(result.status).toBe("not_started");
      expect(result.inferences).toHaveLength(0);
      expect(result.startedAt).toBeNull();
    });

    it("returns completed with inferences after boost", async () => {
      await startPersonaBoost("user-001", "test@test.com", true);
      const result = await getBoostStatus("user-001");
      expect(result.status).toBe("completed");
      expect(result.inferences).toHaveLength(3);
      expect(result.startedAt).toBeTruthy();
      expect(result.completedAt).toBeTruthy();
    });

    it("returns skipped status when boost was skipped", async () => {
      seedTable("persona_snapshots", [{
        id: "user-001",
        user_id: "user-001",
        version: 1,
        preferences: { pillar: {}, tags: {} },
        hard_filters: [],
        cadence_state: { answeredCount: 0, ignoredCount: 0, currentRate: 1, lastUpdatedAt: "" },
        learning_budget: { usedThisPeriod: 0, periodStart: "", periodEnd: "" },
        boost_state: { completed: false, skipped: true, startedAt: null, completedAt: null },
        travel_state: { isAway: false, currentLocation: null, homeLocation: { lat: 47.6, lng: -122.3 } },
        plain_language_projections: [],
        last_event_sequence: 0,
        rebuilt_at: "2026-01-01",
        updated_at: "2026-01-01",
      }]);
      const result = await getBoostStatus("user-001");
      expect(result.status).toBe("skipped");
    });
  });

  describe("polishExplanation()", () => {
    it("returns exploration text when no positive or negative facts", () => {
      const text = polishExplanation([
        { factType: "location", factKey: "neighborhood", factValue: "Capitol Hill", contributes: "neutral" as const },
      ]);
      expect(text).toBe("Something new to explore in your area");
    });

    it("describes a single positive match", () => {
      const text = polishExplanation([
        { factType: "tag_match", factKey: "tag", factValue: "live-music", contributes: "positive" as const },
      ]);
      expect(text).toContain("live-music");
      expect(text).toContain("interest");
    });

    it("joins multiple positive reasons naturally", () => {
      const text = polishExplanation([
        { factType: "pillar_match", factKey: "pillar", factValue: "events", contributes: "positive" as const },
        { factType: "tag_match", factKey: "tag", factValue: "outdoor", contributes: "positive" as const },
      ]);
      expect(text).toContain("events");
      expect(text).toContain("outdoor");
    });

    it("includes location when neighborhood is specific", () => {
      const text = polishExplanation([
        { factType: "tag_match", factKey: "tag", factValue: "sushi", contributes: "positive" as const },
        { factType: "location", factKey: "neighborhood", factValue: "Ballard", contributes: "neutral" as const },
      ]);
      expect(text).toContain("Ballard");
    });
  });

  describe("generateLearningQuestion()", () => {
    it("generates a question with required fields", () => {
      const q = generateLearningQuestion(null);
      expect(q.id).toBeTruthy();
      expect(q.questionText).toBeTruthy();
      expect(q.sourceType).toBe("llm_generated");
      expect(q.channelEligibility.length).toBeGreaterThan(0);
    });

    it("generates a topic-specific question when given a topic", () => {
      const q = generateLearningQuestion("dining");
      expect(q.topicFamily).toBe("dining");
      expect(q.questionText.toLowerCase()).toContain("cuisine");
    });

    it("falls back to random topic for unknown topic", () => {
      const q = generateLearningQuestion("unknown_topic");
      expect(q.questionText).toBeTruthy();
      expect(q.topicFamily).toBeTruthy();
    });
  });
});
