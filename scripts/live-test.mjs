import { createClient } from "@insforge/sdk";

var BASE_URL = process.env.INSFORGE_BASE_URL;
var ANON_KEY = process.env.ANON_KEY;
var FUNCTIONS_URL = process.env.INSFORGE_FUNCTIONS_URL;
var TEST_EMAIL = "letsgo-test-" + Date.now() + "@example.com";
var TEST_PASS = process.env.TEST_PASS || "TestPass123!";

if (!BASE_URL || !ANON_KEY || !FUNCTIONS_URL) {
  console.error("Missing env vars. Set INSFORGE_BASE_URL, ANON_KEY, INSFORGE_FUNCTIONS_URL");
  process.exit(1);
}

var client = createClient({ baseUrl: BASE_URL, anonKey: ANON_KEY });

async function run() {
  // Step 1: Sign up
  console.log("1. Signing up:", TEST_EMAIL);
  var signUpResult = await client.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASS,
    name: "LetsGo Test User"
  });
  if (signUpResult.error) {
    console.log("   Sign up error:", signUpResult.error.message);
    return;
  }
  console.log("   Sign up OK, requireVerification:", signUpResult.data?.requireEmailVerification);

  // Step 2: Bypass email verification via direct DB update
  console.log("2. Bypassing email verification via DB...");
  var { execSync } = await import("child_process");
  try {
    execSync('npx @insforge/cli db query "UPDATE auth.users SET email_verified = true WHERE email = \'' + TEST_EMAIL + '\'"', { stdio: "pipe" });
    console.log("   Verified in DB");
  } catch (e) {
    console.log("   DB verify error:", e.message);
    return;
  }

  // Step 3: Sign in
  console.log("3. Signing in...");
  var signInResult = await client.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASS
  });
  if (signInResult.error) {
    console.log("   Sign in error:", signInResult.error.message);
    return;
  }
  var token = signInResult.data.accessToken;
  var userId = signInResult.data.user.id;
  console.log("   Signed in! User ID:", userId);
  console.log("   Token:", token.substring(0, 30) + "...");

  // Step 4: Test each auth-required function
  var tests = [
    { name: "health-check", method: "GET", auth: false },
    { name: "feed", method: "GET" },
    { name: "persona", method: "GET" },
    { name: "persona-boost-status", method: "GET" },
    { name: "persona-boost-start", method: "POST", body: { email: TEST_EMAIL, consentGiven: true } },
    { name: "actions", method: "POST", body: {
      recommendationId: "00000000-0000-0000-0000-000000000001",
      actionType: "im_in",
      reasons: null,
      freeText: null
    }},
    { name: "chat-messages", method: "POST", body: {
      message: "I love sushi and hiking",
      conversationId: null,
      learningPromptResponseId: null
    }},
    { name: "learning-prompt", method: "GET" },
    { name: "learning-answer", method: "POST", body: {
      questionId: "00000000-0000-0000-0000-000000000001",
      answer: { selected: "sushi" },
      sourceSurface: "in_app_chat",
      linkedRecommendationId: null
    }},
    { name: "notifications-preferences", method: "POST", body: { pushEnabled: true, emailEnabled: false } },
    { name: "account-delete", method: "DELETE" },
  ];

  console.log("\n4. Testing functions:\n");
  for (var t of tests) {
    try {
      var url = FUNCTIONS_URL + "/" + t.name;
      var headers = { "Content-Type": "application/json" };
      if (t.auth !== false) {
        headers["Authorization"] = "Bearer " + token;
      }
      var fetchOpts = { method: t.method, headers: headers };
      if (t.body && t.method !== "GET") {
        fetchOpts.body = JSON.stringify(t.body);
      }
      var res = await fetch(url, fetchOpts);
      var text = await res.text();
      var status = res.status;
      var shortBody = text.length > 150 ? text.substring(0, 150) + "..." : text;
      var icon = status >= 200 && status < 300 ? "OK" : status >= 400 && status < 500 ? "WARN" : "ERR";
      console.log("   [" + icon + "] " + t.name + " " + t.method + " => " + status + " " + shortBody);
    } catch (e) {
      console.log("   [ERR] " + t.name + " " + t.method + " => " + e.message);
    }
  }

  console.log("\nDone.");
}

run().catch(function(e) { console.error("Fatal:", e); process.exit(1); });
