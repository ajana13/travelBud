import { createHandler } from "../_shared/handler.ts";
import { getRuntime } from "../_shared/platform/factory.ts";

export default createHandler({
  methods: ["GET"],
  requireAuth: false,
  handle: async ({ corsHeaders }) => {
    const runtime = getRuntime();
    const baseUrl = runtime.getEnv("INSFORGE_BASE_URL") || runtime.getEnv("DATABASE_URL") || "configured";

    return new Response(
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  },
});
