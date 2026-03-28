export const PriceBand = {
  Free: "free",
  Budget: "budget",
  Mid: "mid",
  Premium: "premium",
} as const;

export type PriceBand = (typeof PriceBand)[keyof typeof PriceBand];

export const PRICE_BANDS = Object.values(PriceBand);
