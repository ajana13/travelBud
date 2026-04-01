import { createHandler } from "../_shared/handler.ts";
import { jsonOk, jsonError } from "../_shared/response.ts";
import { getDatabase } from "../_shared/platform/factory.ts";

const TABLES_TO_PURGE = [
  "persona_events",
  "persona_snapshots",
  "consent_records",
  "notification_preferences",
];

export default createHandler({
  methods: ["DELETE"],
  requireAuth: true,
  handle: async ({ user, corsHeaders }) => {
    const db = getDatabase();
    const userId = user!.id;

    for (const table of TABLES_TO_PURGE) {
      const { error } = await db.from(table).delete().eq("user_id", userId);
      if (error) {
        return jsonError("DELETE_FAILED", `Failed to delete from ${table}: ${error.message}`, corsHeaders, 500);
      }
    }

    return jsonOk({ deleted: true, userId }, corsHeaders);
  },
});
