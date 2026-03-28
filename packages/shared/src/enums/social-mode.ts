export const SocialMode = {
  Solo: "solo",
  Duo: "duo",
  Group: "group",
  Any: "any",
} as const;

export type SocialMode = (typeof SocialMode)[keyof typeof SocialMode];

export const SOCIAL_MODES = Object.values(SocialMode);
