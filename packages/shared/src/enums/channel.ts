export const Channel = {
  Push: "push",
  Email: "email",
  InAppChat: "in_app_chat",
  AttachedFollowUp: "attached_follow_up",
} as const;

export type Channel = (typeof Channel)[keyof typeof Channel];

export const CHANNELS = Object.values(Channel);
