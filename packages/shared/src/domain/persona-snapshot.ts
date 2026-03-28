import { z } from "zod";

const PreferenceMapSchema = z.object({
  pillar: z.record(z.number()),
  tags: z.record(z.number()),
});

const HardFilterSchema = z.object({
  id: z.string(),
  category: z.string(),
  label: z.string(),
  active: z.boolean(),
  promotedFrom: z.string().nullable(),
  createdAt: z.string(),
});

const CadenceStateSchema = z.object({
  answeredCount: z.number().int().nonnegative(),
  ignoredCount: z.number().int().nonnegative(),
  currentRate: z.number().nonnegative(),
  lastUpdatedAt: z.string(),
});

const LearningBudgetStateSchema = z.object({
  usedThisPeriod: z.number().int().nonnegative(),
  periodStart: z.string(),
  periodEnd: z.string(),
});

const BoostStateSchema = z.object({
  completed: z.boolean(),
  skipped: z.boolean(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

const GeoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const TravelStateSchema = z.object({
  isAway: z.boolean(),
  currentLocation: GeoPointSchema.nullable(),
  homeLocation: GeoPointSchema,
});

const PlainLanguageProjectionSchema = z.object({
  id: z.string(),
  category: z.string(),
  statement: z.string(),
  confidence: z.string(),
  editable: z.boolean(),
});

export const PersonaSnapshotSchema = z.object({
  userId: z.string().uuid(),
  version: z.number().int().positive(),
  preferences: PreferenceMapSchema,
  hardFilters: z.array(HardFilterSchema),
  cadenceState: CadenceStateSchema,
  learningBudget: LearningBudgetStateSchema,
  boostState: BoostStateSchema,
  travelState: TravelStateSchema,
  plainLanguageProjections: z.array(PlainLanguageProjectionSchema),
  lastEventSequence: z.number().int().nonnegative(),
  rebuiltAt: z.string(),
  updatedAt: z.string(),
});

export type PersonaSnapshot = z.infer<typeof PersonaSnapshotSchema>;
export type PreferenceMap = z.infer<typeof PreferenceMapSchema>;
export type HardFilter = z.infer<typeof HardFilterSchema>;
export type CadenceState = z.infer<typeof CadenceStateSchema>;
export type LearningBudgetState = z.infer<typeof LearningBudgetStateSchema>;
export type BoostState = z.infer<typeof BoostStateSchema>;
export type TravelState = z.infer<typeof TravelStateSchema>;
export type PlainLanguageProjection = z.infer<
  typeof PlainLanguageProjectionSchema
>;
