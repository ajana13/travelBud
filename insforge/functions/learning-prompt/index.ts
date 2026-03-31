import { createHandler } from "../_shared/handler.ts";
import { jsonOk, jsonError } from "../_shared/response.ts";
import { selectNextQuestion } from "../_shared/learning-service.ts";

export default createHandler({
  methods: ["GET"],
  requireAuth: true,
  handle: async ({ user, corsHeaders }) => {
    const userId = user!.id;
    try {
      const result = await selectNextQuestion(userId);
      return jsonOk(result, corsHeaders);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Learning prompt failed";
      return jsonError("INTERNAL_ERROR", msg, corsHeaders, 500);
    }
  },
});
