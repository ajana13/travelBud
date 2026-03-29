import { createHandler } from "../_shared/handler.ts";
import { notImplemented } from "../_shared/response.ts";

export default createHandler({
  methods: ["GET"],
  requireAuth: true,
  handle: async ({ corsHeaders }) => {
    // TODO: Implement learning prompt selection (Agent B2)
    return notImplemented("GET /learning/prompt not yet implemented", corsHeaders);
  },
});
