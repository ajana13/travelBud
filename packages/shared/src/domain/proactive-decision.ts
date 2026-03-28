import { z } from "zod";

const ChannelSchema = z.enum(["push", "email", "in_app_chat"]);
const ContentTypeSchema = z.enum([
  "recommendation",
  "learning",
  "confirmation",
  "digest",
]);
const SuppressionReasonSchema = z.enum([
  "quiet_hours",
  "cooldown",
  "budget_exhausted",
  "channel_disabled",
  "higher_priority_pending",
]);
const ResponseTypeSchema = z.enum([
  "opened",
  "tapped",
  "answered",
  "ignored",
  "expired",
]);

export const ProactiveDecisionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  channel: ChannelSchema,
  contentType: ContentTypeSchema,
  selectedContentId: z.string().uuid(),
  reasonType: z.string(),
  interruptScore: z.number(),
  delivered: z.boolean(),
  suppressionReason: SuppressionReasonSchema.nullable(),
  scheduledAt: z.string(),
  deliveredAt: z.string().nullable(),
  respondedAt: z.string().nullable(),
  responseType: ResponseTypeSchema.nullable(),
});

export type ProactiveDecision = z.infer<typeof ProactiveDecisionSchema>;
