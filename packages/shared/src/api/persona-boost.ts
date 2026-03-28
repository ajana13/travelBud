import { z } from "zod";
import { BoostInferenceSchema } from "../domain/boost-inference.js";

export const PersonaBoostStartRequestSchema = z.object({
  email: z.string().email(),
  consentGiven: z.boolean(),
});

export const PersonaBoostStartResponseSchema = z.object({
  boostId: z.string().uuid(),
  status: z.enum(["processing", "completed", "failed"]),
});

export const PersonaBoostStatusResponseSchema = z.object({
  status: z.enum(["not_started", "processing", "completed", "skipped"]),
  inferences: z.array(BoostInferenceSchema),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

export type PersonaBoostStartRequest = z.infer<
  typeof PersonaBoostStartRequestSchema
>;
export type PersonaBoostStartResponse = z.infer<
  typeof PersonaBoostStartResponseSchema
>;
export type PersonaBoostStatusResponse = z.infer<
  typeof PersonaBoostStatusResponseSchema
>;
