import { z } from "zod";

const PlainLanguageProjectionViewSchema = z.object({
  id: z.string(),
  category: z.string(),
  statement: z.string(),
  confidence: z.string(),
  editable: z.boolean(),
});

const HardFilterViewSchema = z.object({
  id: z.string(),
  label: z.string(),
  active: z.boolean(),
  promotedFrom: z.string().nullable(),
});

const BoostStateViewSchema = z.object({
  completed: z.boolean(),
  skipped: z.boolean(),
});

export const PersonaResponseSchema = z.object({
  projections: z.array(PlainLanguageProjectionViewSchema),
  hardFilters: z.array(HardFilterViewSchema),
  boostState: BoostStateViewSchema,
});

export const PersonaPatchRequestSchema = z.object({
  edits: z.array(
    z.object({
      projectionId: z.string(),
      newValue: z.string(),
    })
  ),
  hardFilterToggles: z.array(
    z.object({
      filterId: z.string(),
      active: z.boolean(),
    })
  ),
});

export const PersonaPatchResponseSchema = z.object({
  updated: z.boolean(),
  projections: z.array(PlainLanguageProjectionViewSchema),
  feedStale: z.boolean(),
});

export type PersonaResponse = z.infer<typeof PersonaResponseSchema>;
export type PersonaPatchRequest = z.infer<typeof PersonaPatchRequestSchema>;
export type PersonaPatchResponse = z.infer<typeof PersonaPatchResponseSchema>;
