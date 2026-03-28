import { z } from "zod";

const ChannelSchema = z.enum([
  "push",
  "email",
  "in_app_chat",
  "attached_follow_up",
]);

// ─── Answer schema discriminated union ──────────────────────────────────────

const SingleSelectSchema = z.object({
  type: z.literal("single_select"),
  options: z.array(z.string()),
});

const MultiSelectSchema = z.object({
  type: z.literal("multi_select"),
  options: z.array(z.string()),
});

const FreeTextSchema = z.object({
  type: z.literal("free_text"),
  maxLength: z.number().int().positive(),
});

const ScaleSchema = z.object({
  type: z.literal("scale"),
  min: z.number(),
  max: z.number(),
  labels: z.object({
    low: z.string(),
    high: z.string(),
  }),
});

const StructuredAnswerSchemaSchema = z.discriminatedUnion("type", [
  SingleSelectSchema,
  MultiSelectSchema,
  FreeTextSchema,
  ScaleSchema,
]);

// ─── LearningQuestion ──────────────────────────────────────────────────────

export const LearningQuestionSchema = z.object({
  id: z.string().uuid(),
  topicFamily: z.string(),
  questionText: z.string(),
  expectedLift: z.number(),
  confidenceGap: z.number(),
  channelEligibility: z.array(ChannelSchema),
  answerSchema: StructuredAnswerSchemaSchema,
  isComparative: z.boolean(),
  comparisonItems: z
    .object({ a: z.string(), b: z.string() })
    .nullable(),
  sourceType: z.enum(["template", "llm_generated"]),
  sensitiveTopicFlag: z.boolean(),
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
});

export type LearningQuestion = z.infer<typeof LearningQuestionSchema>;
export type StructuredAnswerSchema = z.infer<
  typeof StructuredAnswerSchemaSchema
>;
