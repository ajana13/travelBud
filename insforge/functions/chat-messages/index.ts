import { createClient } from "npm:@insforge/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ data: null, error: { code: "METHOD_NOT_ALLOWED", message: "Use POST" } }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const authHeader = req.headers.get("Authorization");
  const userToken = authHeader ? authHeader.replace("Bearer ", "") : null;

  if (!userToken) {
    return new Response(
      JSON.stringify({ data: null, error: { code: "UNAUTHORIZED", message: "Missing Authorization header" } }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const client = createClient({
    baseUrl: Deno.env.get("INSFORGE_BASE_URL"),
    edgeFunctionToken: userToken,
  });

  const { data: userData } = await client.auth.getCurrentUser();
  if (!userData?.user?.id) {
    return new Response(
      JSON.stringify({ data: null, error: { code: "UNAUTHORIZED", message: "Authentication required" } }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // TODO: Implement chat parsing and structured extraction (Agent B3)
  return new Response(
    JSON.stringify({ data: null, error: { code: "NOT_IMPLEMENTED", message: "POST /chat/messages not yet implemented" } }),
    { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
