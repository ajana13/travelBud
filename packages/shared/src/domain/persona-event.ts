import { z } from "zod";

const ActionTypeSchema = z.enum(["im_in", "maybe", "pass", "cant"]);

const EventSourceSchema = z.object({
  surface: z.string(),
  sessionId: z.string().nullable(),
});

// ─── Payload discriminated union ────────────────────────────────────────────

const ActionPayloadSchema = z.object({
  type: z.literal("action"),
  actionType: ActionTypeSchema,
  itemId: z.string().uuid(),
  reasons: z.array(z.string()).nullable(),
  freeText: z.string().nullable(),
});

const BoostInferencePayloadSchema = z.object({
  type: z.literal("boost_inference"),
  inferenceId: z.string().uuid(),
  category: z.string(),
  direction: z.enum(["positive", "negative"]),
  strength: z.number(),
  accepted: z.boolean(),
});

const ChatExtractionPayloadSchema = z.object({
  type: z.literal("chat_extraction"),
  conversationId: z.string(),
  field: z.string(),
  oldValue: z.string().nullable(),
  newValue: z.string(),
});

const LearningAnswerPayloadSchema = z.object({
  type: z.literal("learning_answer"),
  questionId: z.string().uuid(),
  answer: z.record(z.unknown()),
  sourceSurface: z.enum(["push", "in_app_chat", "attached_follow_up"]),
  linkedRecommendationId: z.string().uuid().nullable(),
});

const ConfirmationPayloadSchema = z.object({
  type: z.literal("confirmation"),
  itemId: z.string().uuid(),
  confirmed: z.boolean(),
  feedback: z.string().nullable(),
});

const SystemDecisionPayloadSchema = z.object({
  type: z.literal("system_decision"),
  decisionType: z.string(),
  reason: z.string(),
  affectedField: z.string(),
  previousValue: z.unknown().nullable(),
  newValue: z.unknown(),
});

const PersonaEditPayloadSchema = z.object({
  type: z.literal("persona_edit"),
  projectionId: z.string(),
  oldValue: z.string(),
  newValue: z.string(),
});

const PersonaEventPayloadSchema = z.discriminatedUnion("type", [
  ActionPayloadSchema,
  BoostInferencePayloadSchema,
  ChatExtractionPayloadSchema,
  LearningAnswerPayloadSchema,
  ConfirmationPayloadSchema,
  SystemDecisionPayloadSchema,
  PersonaEditPayloadSchema,
]);

// ─── PersonaEvent ───────────────────────────────────────────────────────────

export const PersonaEventSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum([
    "action",
    "boost_inference",
    "chat_extraction",
    "learning_answer",
    "confirmation",
    "system_decision",
    "persona_edit",
  ]),
  version: z.number().int().positive(),
  payload: PersonaEventPayloadSchema,
  source: EventSourceSchema,
  timestamp: z.string(),
  sequenceNumber: z.number().int().nonnegative(),
});

export type PersonaEvent = z.infer<typeof PersonaEventSchema>;
export type PersonaEventPayload = z.infer<typeof PersonaEventPayloadSchema>;
export type PersonaEventType = PersonaEvent["type"];
