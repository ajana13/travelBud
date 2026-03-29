import { createHandler } from "../_shared/handler.ts";
import { notImplemented } from "../_shared/response.ts";

export default createHandler({
  methods: ["POST"],
  requireAuth: true,
  handle: async ({ corsHeaders }) => {
    // TODO: Implement action ingestion and persona delta generation (Agent B2)
    return notImplemented("POST /actions not yet implemented", corsHeaders);
  },
});
