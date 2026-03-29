import { createHandler } from "../_shared/handler.ts";
import { jsonOk } from "../_shared/response.ts";
import { getSeattleSeedItems } from "../_shared/inventory/seed-data.ts";
import { upsertInventoryItems } from "../_shared/inventory/inventory-pipeline.ts";

export default createHandler({
  methods: ["POST"],
  requireAuth: false,
  handle: async ({ corsHeaders }) => {
    const items = getSeattleSeedItems();
    const rows = items.map((item) => ({ ...item }));
    const { upserted, error } = await upsertInventoryItems(rows);

    if (error) {
      return new Response(
        JSON.stringify({ data: null, error: { code: "SEED_FAILED", message: error.message } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return jsonOk({ seeded: upserted }, corsHeaders);
  },
});
