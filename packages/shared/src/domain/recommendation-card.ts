import { z } from "zod";
import { LearningQuestionSchema } from "./learning-question.js";

const ActionTypeSchema = z.enum(["im_in", "maybe", "pass", "cant"]);
const ConfidenceLabelSchema = z.enum(["new", "learning", "strong_match"]);

const ExplanationFactSchema = z.object({
  factType: z.string(),
  factKey: z.string(),
  factValue: z.string(),
  contributes: z.enum(["positive", "negative", "neutral"]),
});

const FollowUpContractSchema = z.object({
  questionId: z.string().uuid(),
  question: LearningQuestionSchema,
});

export const RecommendationCardSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
  score: z.number(),
  confidenceLabel: ConfidenceLabelSchema,
  isExploration: z.boolean(),
  explanationFacts: z.array(ExplanationFactSchema),
  explanationText: z.string(),
  allowedActions: z.array(ActionTypeSchema),
  eligibleFollowUp: FollowUpContractSchema.nullable(),
  position: z.number().int().nonnegative(),
});

export type RecommendationCard = z.infer<typeof RecommendationCardSchema>;
export type ExplanationFact = z.infer<typeof ExplanationFactSchema>;
export type FollowUpContract = z.infer<typeof FollowUpContractSchema>;
