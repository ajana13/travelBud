import { z } from "zod";

const PillarSchema = z.enum(["events", "dining", "outdoors"]);
const PriceBandSchema = z.enum(["free", "budget", "mid", "premium"]);
const SocialModeSchema = z.enum(["solo", "duo", "group", "any"]);

const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
  neighborhood: z.string().nullable(),
});

const AvailabilitySchema = z.object({
  start: z.string(),
  end: z.string().nullable(),
  recurring: z.boolean(),
});

export const InventoryItemSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.string(),
  sourceProvider: z.string(),
  pillar: PillarSchema,
  title: z.string(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  location: LocationSchema,
  availability: AvailabilitySchema,
  priceBand: PriceBandSchema,
  socialMode: SocialModeSchema,
  timeShape: z.string(),
  nightlife: z.boolean(),
  deepLink: z.string().url(),
  imageUrl: z.string().nullable(),
  sourceMeta: z.record(z.unknown()),
  lastRefreshedAt: z.string(),
  availabilityVerifiedAt: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
