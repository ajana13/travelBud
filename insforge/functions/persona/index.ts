import { createHandler } from "../_shared/handler.ts";
import { notImplemented } from "../_shared/response.ts";

export default createHandler({
  methods: ["GET", "PATCH"],
  requireAuth: true,
  handle: async ({ req, corsHeaders }) => {
    if (req.method === "GET") {
      // TODO: Implement persona read (Agent B2)
      return notImplemented("GET /persona not yet implemented", corsHeaders);
    }

    // PATCH
    // TODO: Implement persona edit (Agent B2)
    return notImplemented("PATCH /persona not yet implemented", corsHeaders);
  },
});
