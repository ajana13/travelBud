import { z } from "zod";
import { RecommendationCardSchema } from "../domain/recommendation-card.js";

export const FeedResponseSchema = z.object({
  cards: z.array(RecommendationCardSchema),
  feedSize: z.number().int().nonnegative(),
  explorationCount: z.number().int().nonnegative(),
  generatedAt: z.string(),
});

export type FeedResponse = z.infer<typeof FeedResponseSchema>;
