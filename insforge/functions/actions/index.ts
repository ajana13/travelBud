import { createHandler } from "../_shared/handler.ts";
import { jsonOk, jsonError } from "../_shared/response.ts";
import { validateBody } from "../_shared/validation.ts";
import { processAction } from "../_shared/feedback-service.ts";
import { z } from "npm:zod";

const ActionRequestSchema = z.object({
  recommendationId: z.string(),
  actionType: z.enum(["im_in", "maybe", "pass", "cant"]),
  reasons: z.array(z.string()).nullable(),
  freeText: z.string().nullable(),
});

export default createHandler({
  methods: ["POST"],
  requireAuth: true,
  handle: async ({ req, user, corsHeaders }) => {
    const body = await req.json().catch(() => null);
    const parsed = validateBody(ActionRequestSchema, body);
    if (!parsed.success) {
      return jsonError(
        "VALIDATION_ERROR",
        parsed.errors.join("; "),
        corsHeaders,
        400
      );
    }

    const userId = user!.id;
    const result = await processAction(userId, parsed.data, []);

    return jsonOk(result, corsHeaders);
  },
});
