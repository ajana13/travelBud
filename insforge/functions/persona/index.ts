import { createHandler } from "../_shared/handler.ts";
import { jsonOk, jsonError } from "../_shared/response.ts";
import { validateBody } from "../_shared/validation.ts";
import { getPersonaView, applyPersonaEdits } from "../_shared/feedback-service.ts";
import { z } from "npm:zod";

const PersonaPatchRequestSchema = z.object({
  edits: z.array(
    z.object({ projectionId: z.string(), newValue: z.string() })
  ),
  hardFilterToggles: z.array(
    z.object({ filterId: z.string(), active: z.boolean() })
  ),
});

export default createHandler({
  methods: ["GET", "PATCH"],
  requireAuth: true,
  handle: async ({ req, user, corsHeaders }) => {
    const userId = user!.id;

    if (req.method === "GET") {
      const view = await getPersonaView(userId);
      return jsonOk(view, corsHeaders);
    }

    const body = await req.json().catch(() => null);
    const parsed = validateBody(PersonaPatchRequestSchema, body);
    if (!parsed.success) {
      return jsonError(
        "VALIDATION_ERROR",
        parsed.errors.join("; "),
        corsHeaders,
        400
      );
    }

    const result = await applyPersonaEdits(
      userId,
      parsed.data.edits,
      parsed.data.hardFilterToggles
    );

    return jsonOk(result, corsHeaders);
  },
});
