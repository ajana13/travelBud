import { createClient } from "npm:@insforge/sdk";
import { z } from "npm:zod";
import { createHandler } from "../_shared/handler.ts";
import { jsonOk, jsonError } from "../_shared/response.ts";
import { validateBody } from "../_shared/validation.ts";

const NotificationPrefsSchema = z.object({
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  channels: z.object({
    learning: z.boolean(),
    recommendations: z.boolean(),
    system: z.boolean(),
  }),
});

export default createHandler({
  methods: ["POST"],
  requireAuth: true,
  handle: async ({ req, user, corsHeaders }) => {
    const body = await req.json().catch(() => null);
    const validation = validateBody(NotificationPrefsSchema, body);

    if (!validation.success) {
      return jsonError(
        "VALIDATION_ERROR",
        validation.errors.join("; "),
        corsHeaders,
        400
      );
    }

    const prefs = validation.data;
    const client = createClient({
      baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
      anonKey: Deno.env.get("ANON_KEY"),
    });
    const db = client.database;

    const row = {
      id: user!.id,
      user_id: user!.id,
      push_enabled: prefs.pushEnabled,
      email_enabled: prefs.emailEnabled,
      channels: prefs.channels,
      updated_at: new Date().toISOString(),
    };
    await db.from("notification_preferences").upsert([row]);

    return jsonOk(prefs, corsHeaders);
  },
});
