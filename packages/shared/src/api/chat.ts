import { z } from "zod";

const PersonaUpdateSchema = z.object({
  field: z.string(),
  oldValue: z.string(),
  newValue: z.string(),
});

export const ChatMessageRequestSchema = z.object({
  message: z.string(),
  conversationId: z.string().nullable(),
  learningPromptResponseId: z.string().nullable(),
});

export const ChatMessageResponseSchema = z.object({
  reply: z.string(),
  conversationId: z.string(),
  personaUpdatesApplied: z.array(PersonaUpdateSchema),
  feedStale: z.boolean(),
});

export type ChatMessageRequest = z.infer<typeof ChatMessageRequestSchema>;
export type ChatMessageResponse = z.infer<typeof ChatMessageResponseSchema>;
