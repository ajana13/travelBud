import { z } from "zod";
import { LearningQuestionSchema } from "../domain/learning-question.js";

const ActionTypeSchema = z.enum(["im_in", "maybe", "pass", "cant"]);

export const ActionRequestSchema = z.object({
  recommendationId: z.string().uuid(),
  actionType: ActionTypeSchema,
  reasons: z.array(z.string()).nullable(),
  freeText: z.string().nullable(),
});

export const ActionResponseSchema = z.object({
  accepted: z.boolean(),
  personaUpdated: z.boolean(),
  eligibleFollowUp: LearningQuestionSchema.nullable(),
  feedStale: z.boolean(),
});

export type ActionRequest = z.infer<typeof ActionRequestSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
