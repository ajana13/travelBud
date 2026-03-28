import { z } from "zod";
import { LearningQuestionSchema } from "../domain/learning-question.js";

export const LearningPromptResponseSchema = z.object({
  prompt: LearningQuestionSchema.nullable(),
  sessionLearningCount: z.number().int().nonnegative(),
  sessionCap: z.number().int().positive(),
});

export const LearningAnswerRequestSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.record(z.unknown()),
  sourceSurface: z.enum(["push", "in_app_chat", "attached_follow_up"]),
  linkedRecommendationId: z.string().uuid().nullable(),
});

export const LearningAnswerResponseSchema = z.object({
  accepted: z.boolean(),
  personaUpdated: z.boolean(),
  feedStale: z.boolean(),
  followUpQuestion: LearningQuestionSchema.nullable(),
});

export type LearningPromptResponse = z.infer<
  typeof LearningPromptResponseSchema
>;
export type LearningAnswerRequest = z.infer<typeof LearningAnswerRequestSchema>;
export type LearningAnswerResponse = z.infer<
  typeof LearningAnswerResponseSchema
>;
