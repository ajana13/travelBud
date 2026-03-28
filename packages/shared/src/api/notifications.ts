import { z } from "zod";

export const NotificationPreferencesRequestSchema = z.object({
  push: z.boolean(),
  email: z.boolean(),
});

export const NotificationPreferencesResponseSchema = z.object({
  updated: z.boolean(),
});

export type NotificationPreferencesRequest = z.infer<
  typeof NotificationPreferencesRequestSchema
>;
export type NotificationPreferencesResponse = z.infer<
  typeof NotificationPreferencesResponseSchema
>;
