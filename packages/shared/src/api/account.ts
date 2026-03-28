import { z } from "zod";

export const AccountDeleteResponseSchema = z.object({
  anonymized: z.boolean(),
  scheduledDeletionAt: z.string(),
});

export type AccountDeleteResponse = z.infer<typeof AccountDeleteResponseSchema>;
