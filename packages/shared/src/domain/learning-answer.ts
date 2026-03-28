import { z } from "zod";

const ActionTypeSchema = z.enum(["im_in", "maybe", "pass", "cant"]);
const SourceSurfaceSchema = z.enum([
  "push",
  "in_app_chat",
  "attached_follow_up",
]);

export const LearningAnswerSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  questionId: z.string().uuid(),
  answerPayload: z.record(z.unknown()),
  sourceSurface: SourceSurfaceSchema,
  linkedRecommendationId: z.string().uuid().nullable(),
  linkedActionType: ActionTypeSchema.nullable(),
  timestamp: z.string(),
});

export type LearningAnswer = z.infer<typeof LearningAnswerSchema>;
