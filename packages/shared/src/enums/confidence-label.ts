export const ConfidenceLabel = {
  New: "new",
  Learning: "learning",
  StrongMatch: "strong_match",
} as const;

export type ConfidenceLabel =
  (typeof ConfidenceLabel)[keyof typeof ConfidenceLabel];

export const CONFIDENCE_LABELS = Object.values(ConfidenceLabel);
