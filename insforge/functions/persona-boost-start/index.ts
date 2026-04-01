import { createHandler } from "../_shared/handler.ts";
import { jsonOk, jsonError } from "../_shared/response.ts";
import { validateBody } from "../_shared/validation.ts";
import { startPersonaBoost } from "../_shared/ai-service.ts";
import { z } from "npm:zod";

const PersonaBoostStartRequestSchema = z.object({
  email: z.string().email(),
  consentGiven: z.boolean(),
});

export default createHandler({
  methods: ["POST"],
  requireAuth: true,
  handle: async ({ req, user, corsHeaders }) => {
    const body = await req.json().catch(() => null);
    const parsed = validateBody(PersonaBoostStartRequestSchema, body);
    if (!parsed.success) {
      return jsonError("VALIDATION_ERROR", parsed.errors.join("; "), corsHeaders, 400);
    }
    const userId = user!.id;
    try {
      const result = await startPersonaBoost(userId, parsed.data.email, parsed.data.consentGiven);
      return jsonOk(result, corsHeaders);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Boost start failed";
      return jsonError("INTERNAL_ERROR", msg, corsHeaders, 500);
    }
  },
});
