export const FeatureFlag = {
  PersonaBoost: "persona_boost",
  ActiveLearning: "active_learning",
  ProactivePushes: "proactive_pushes",
  CalendarAccess: "calendar_access",
  SignificantLocationAccess: "significant_location_access",
  NightlifeRecommendations: "nightlife_recommendations",
} as const;

export type FeatureFlag = (typeof FeatureFlag)[keyof typeof FeatureFlag];

export const FEATURE_FLAGS = Object.values(FeatureFlag);

export const FEATURE_FLAG_DEFAULTS: Record<FeatureFlag, boolean> = {
  [FeatureFlag.PersonaBoost]: false,
  [FeatureFlag.ActiveLearning]: false,
  [FeatureFlag.ProactivePushes]: false,
  [FeatureFlag.CalendarAccess]: false,
  [FeatureFlag.SignificantLocationAccess]: false,
  [FeatureFlag.NightlifeRecommendations]: false,
};
