import { createHandler } from "../_shared/handler.ts";
import { jsonOk, jsonError } from "../_shared/response.ts";
import { getBoostStatus } from "../_shared/ai-service.ts";

export default createHandler({
  methods: ["GET"],
  requireAuth: true,
  handle: async ({ user, corsHeaders }) => {
    const userId = user!.id;
    try {
      const result = await getBoostStatus(userId);
      return jsonOk(result, corsHeaders);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Boost status failed";
      return jsonError("INTERNAL_ERROR", msg, corsHeaders, 500);
    }
  },
});
