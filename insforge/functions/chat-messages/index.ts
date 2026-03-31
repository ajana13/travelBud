import { createHandler } from "../_shared/handler.ts";
import { jsonOk, jsonError } from "../_shared/response.ts";
import { validateBody } from "../_shared/validation.ts";
import { generateChatReply } from "../_shared/ai-service.ts";
import { z } from "npm:zod";

const ChatMessageRequestSchema = z.object({
  message: z.string(),
  conversationId: z.string().nullable(),
  learningPromptResponseId: z.string().nullable(),
});

export default createHandler({
  methods: ["POST"],
  requireAuth: true,
  handle: async ({ req, user, corsHeaders }) => {
    const body = await req.json().catch(() => null);
    const parsed = validateBody(ChatMessageRequestSchema, body);
    if (!parsed.success) {
      return jsonError("VALIDATION_ERROR", parsed.errors.join("; "), corsHeaders, 400);
    }
    const userId = user!.id;
    try {
      const result = await generateChatReply(userId, parsed.data.message, parsed.data.conversationId);
      return jsonOk(result, corsHeaders);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Chat failed";
      return jsonError("INTERNAL_ERROR", msg, corsHeaders, 500);
    }
  },
});
