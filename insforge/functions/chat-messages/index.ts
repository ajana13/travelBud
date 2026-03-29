import { createHandler } from "../_shared/handler.ts";
import { notImplemented } from "../_shared/response.ts";

export default createHandler({
  methods: ["POST"],
  requireAuth: true,
  handle: async ({ corsHeaders }) => {
    // TODO: Implement chat parsing and structured extraction (Agent B3)
    return notImplemented("POST /chat/messages not yet implemented", corsHeaders);
  },
});
