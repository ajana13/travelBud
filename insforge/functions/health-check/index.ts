import { createClient } from "npm:@insforge/sdk";
import { createHandler } from "../_shared/handler.ts";
import { getConfig } from "../_shared/config.ts";

export default createHandler({
  methods: ["GET"],
  requireAuth: false,
  handle: async ({ corsHeaders }) => {
    const { baseUrl, anonKey } = getConfig();
    createClient({ baseUrl, anonKey });

    return new Response(
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  },
});
