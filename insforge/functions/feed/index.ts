import { createHandler } from "../_shared/handler.ts";
import { jsonOk, jsonError } from "../_shared/response.ts";
import {
  getSnapshot,
  createDefaultSnapshot,
} from "../_shared/persona-snapshot-store.ts";
import { generateFeed } from "../_shared/recommendation-service.ts";

export default createHandler({
  methods: ["GET"],
  requireAuth: true,
  handle: async ({ user, corsHeaders }) => {
    const userId = user!.id;

    const snapshot = (await getSnapshot(userId))
      ?? createDefaultSnapshot(userId);

    try {
      const feed = await generateFeed(snapshot);
      return jsonOk(feed, corsHeaders);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Feed generation failed";
      return jsonError("INTERNAL_ERROR", msg, corsHeaders, 500);
    }
  },
});
