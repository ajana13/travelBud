export const ActionType = {
  ImIn: "im_in",
  Maybe: "maybe",
  Pass: "pass",
  Cant: "cant",
} as const;

export type ActionType = (typeof ActionType)[keyof typeof ActionType];

export const ACTION_TYPES = Object.values(ActionType);
