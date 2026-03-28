export const Pillar = {
  Events: "events",
  Dining: "dining",
  Outdoors: "outdoors",
} as const;

export type Pillar = (typeof Pillar)[keyof typeof Pillar];

export const PILLARS = Object.values(Pillar);
