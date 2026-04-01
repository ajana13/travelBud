import { createHandler } from "../_shared/handler.ts";
import { jsonOk, jsonError } from "../_shared/response.ts";
import { validateBody } from "../_shared/validation.ts";
import { ingestAnswer } from "../_shared/learning-service.ts";
import { z } from "npm:zod";

const LearningAnswerRequestSchema = z.object({
  questionId: z.string(),
  answer: z.record(z.string(), z.unknown()),
  sourceSurface: z.enum(["push", "in_app_chat", "attached_follow_up"]),
  linkedRecommendationId: z.string().nullable(),
});

export default createHandler({
  methods: ["POST"],
  requireAuth: true,
  handle: async ({ req, user, corsHeaders }) => {
    const body = await req.json().catch(() => null);
    const parsed = validateBody(LearningAnswerRequestSchema, body);
    if (!parsed.success) {
      return jsonError("VALIDATION_ERROR", parsed.errors.join("; "), corsHeaders, 400);
    }
    const userId = user!.id;
    try {
      const result = await ingestAnswer(userId, parsed.data);
      return jsonOk(result, corsHeaders);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Learning answer failed";
      return jsonError("INTERNAL_ERROR", msg, corsHeaders, 500);
    }
  },
});
