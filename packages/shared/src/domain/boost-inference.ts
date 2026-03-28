import { z } from "zod";

const InferredPreferenceSchema = z.object({
  category: z.string(),
  direction: z.enum(["positive", "negative"]),
  strength: z.number().min(0).max(1),
});

export const BoostInferenceSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  sourceType: z.string(),
  sourceDetail: z.string(),
  inferredPreference: InferredPreferenceSchema,
  confidence: z.number().min(0).max(1),
  visibilityState: z.enum(["pending", "visible", "hidden"]),
  acceptanceStatus: z.enum(["pending", "accepted", "rejected", "edited"]),
  plainLanguageLabel: z.string(),
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
});

export type BoostInference = z.infer<typeof BoostInferenceSchema>;
export type InferredPreference = z.infer<typeof InferredPreferenceSchema>;
