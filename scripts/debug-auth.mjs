import { createClient } from "@insforge/sdk";

var BASE_URL = process.env.INSFORGE_BASE_URL;
var ANON_KEY = process.env.ANON_KEY;
var FUNCTIONS_URL = process.env.INSFORGE_FUNCTIONS_URL;
var TEST_EMAIL = "letsgo-debug-" + Date.now() + "@example.com";
var TEST_PASS = process.env.TEST_PASS || "TestPass123!";

if (!BASE_URL || !ANON_KEY || !FUNCTIONS_URL) {
  console.error("Missing env vars. Set INSFORGE_BASE_URL, ANON_KEY, INSFORGE_FUNCTIONS_URL");
  process.exit(1);
}

async function run() {
  // Sign up
  var client = createClient({ baseUrl: BASE_URL, anonKey: ANON_KEY });
  console.log("1. Sign up:", TEST_EMAIL);
  var r = await client.auth.signUp({ email: TEST_EMAIL, password: TEST_PASS, name: "Debug User" });
  if (r.error) { console.log("   Error:", r.error); return; }
  console.log("   OK");

  // Verify via DB
  var { execSync } = await import("child_process");
  execSync('npx @insforge/cli db query "UPDATE auth.users SET email_verified = true WHERE email = \'' + TEST_EMAIL + '\'"', { stdio: "pipe" });
  console.log("2. Verified in DB");

  // Sign in
  var r2 = await client.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASS });
  if (r2.error) { console.log("   Sign in error:", r2.error); return; }
  var token = r2.data.accessToken;
  console.log("3. Signed in, token:", token.substring(0, 40) + "...");

  // Test getCurrentUser with edgeFunctionToken
  console.log("\n4. Testing getCurrentUser with edgeFunctionToken...");
  var edgeClient = createClient({ baseUrl: BASE_URL, edgeFunctionToken: token });
  var r3 = await edgeClient.auth.getCurrentUser();
  console.log("   Result:", JSON.stringify(r3, null, 2));

  // Test getCurrentUser with anonKey (session-based)
  console.log("\n5. Testing getCurrentUser with anonKey (after signIn)...");
  var r4 = await client.auth.getCurrentUser();
  console.log("   Result:", JSON.stringify(r4, null, 2));

  // Test direct fetch with token
  console.log("\n6. Testing direct fetch to health-check with token...");
  var resp = await fetch(FUNCTIONS_URL + "/health-check", {
    method: "GET",
    headers: { "Authorization": "Bearer " + token }
  });
  console.log("   Status:", resp.status);
  console.log("   Body:", await resp.text());

  // Test direct fetch to feed
  console.log("\n7. Testing direct fetch to feed with token...");
  var resp2 = await fetch(FUNCTIONS_URL + "/feed", {
    method: "GET",
    headers: { "Authorization": "Bearer " + token }
  });
  console.log("   Status:", resp2.status);
  console.log("   Body:", await resp2.text());
}

run().catch(function(e) { console.error("Fatal:", e); });
