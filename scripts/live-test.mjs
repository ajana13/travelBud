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

// ─── Assertion helpers ──────────────────────────────────────────────────────

var passed = 0;
var failed = 0;
var errors = [];

function assert(condition, message) {
  if (!condition) throw new Error("Assertion failed: " + message);
}

function assertStatus(res, expected, label) {
  if (res.status !== expected) {
    throw new Error(label + ": expected status " + expected + ", got " + res.status);
  }
}

function assertShape(obj, requiredKeys, label) {
  for (var key of requiredKeys) {
    if (!(key in obj)) {
      throw new Error(label + ": missing required key '" + key + "' in " + JSON.stringify(obj).substring(0, 200));
    }
  }
}

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log("  [PASS] " + name);
  } catch (e) {
    failed++;
    errors.push({ name: name, error: e.message });
    console.log("  [FAIL] " + name + " — " + e.message);
  }
}

// ─── HTTP helpers ───────────────────────────────────────────────────────────

async function callFn(slug, method, token, body) {
  var url = FUNCTIONS_URL + "/" + slug;
  var headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;
  var opts = { method: method, headers: headers };
  if (body && method !== "GET") opts.body = JSON.stringify(body);
  var res = await fetch(url, opts);
  var text = await res.text();
  var data = null;
  try { data = JSON.parse(text); } catch (_) { data = text; }
  return { status: res.status, body: data, raw: text };
}

// ─── Main ───────────────────────────────────────────────────────────────────

var client = createClient({ baseUrl: BASE_URL, anonKey: ANON_KEY });

async function run() {
  var token = null;
  var userId = null;

  // ── Setup: create and authenticate test user ──────────────────────────────

  console.log("\n=== Setup: Auth ===\n");
  console.log("  Email: " + TEST_EMAIL);

  var signUpResult = await client.auth.signUp({ email: TEST_EMAIL, password: TEST_PASS, name: "LetsGo Test User" });
  if (signUpResult.error) {
    console.error("  Sign up failed: " + signUpResult.error.message);
    process.exit(1);
  }

  var { execSync } = await import("child_process");
  try {
    execSync('npx @insforge/cli db query "UPDATE auth.users SET email_verified = true WHERE email = \'' + TEST_EMAIL + '\'"', { stdio: "pipe" });
  } catch (e) {
    console.error("  DB verify failed: " + e.message);
    process.exit(1);
  }

  var signInResult = await client.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASS });
  if (signInResult.error) {
    console.error("  Sign in failed: " + signInResult.error.message);
    process.exit(1);
  }
  token = signInResult.data.accessToken;
  userId = signInResult.data.user.id;
  console.log("  Signed in as " + userId + "\n");

  try {
    // ── Group 1: Auth + Health ────────────────────────────────────────────────

    console.log("=== Group 1: Auth + Health ===\n");

    await test("health-check returns { status: 'ok' }", async function () {
      var r = await callFn("health-check", "GET", null, null);
      assertStatus(r, 200, "health-check");
      assert(r.body.status === "ok", "expected status 'ok', got " + r.body.status);
    });

    await test("unauthenticated /feed returns 401", async function () {
      var r = await callFn("feed", "GET", null, null);
      assertStatus(r, 401, "feed unauth");
      assertShape(r.body, ["error"], "feed unauth body");
      assert(r.body.error.code === "UNAUTHORIZED", "expected UNAUTHORIZED, got " + r.body.error.code);
    });

    // ── Group 2: Persona Boost Journey ────────────────────────────────────────

    console.log("\n=== Group 2: Persona Boost Journey ===\n");

    await test("persona-boost-status is 'not_started' for new user", async function () {
      var r = await callFn("persona-boost-status", "GET", token, null);
      assertStatus(r, 200, "boost-status initial");
      assert(r.body.data.status === "not_started", "expected not_started, got " + r.body.data.status);
    });

    await test("persona-boost-start with consent returns 'completed'", async function () {
      var r = await callFn("persona-boost-start", "POST", token, { email: TEST_EMAIL, consentGiven: true });
      assertStatus(r, 200, "boost-start");
      assertShape(r.body.data, ["boostId", "status"], "boost-start data");
      assert(r.body.data.status === "completed", "expected completed, got " + r.body.data.status);
      assert(r.body.data.boostId.length > 0, "expected non-empty boostId");
    });

    await test("persona-boost-status after boost returns valid response", async function () {
      var r = await callFn("persona-boost-status", "GET", token, null);
      assertStatus(r, 200, "boost-status after");
      assertShape(r.body.data, ["status", "inferences", "startedAt", "completedAt"], "boost-status data");
      assert(Array.isArray(r.body.data.inferences), "expected inferences array");
    });

    // ── Group 3: Feed + Actions Journey ───────────────────────────────────────

    console.log("\n=== Group 3: Feed + Actions Journey ===\n");

    await test("GET /feed returns valid feed structure", async function () {
      var r = await callFn("feed", "GET", token, null);
      assertStatus(r, 200, "feed");
      assertShape(r.body.data, ["cards", "feedSize", "explorationCount", "generatedAt"], "feed data");
      assert(Array.isArray(r.body.data.cards), "cards should be array");
      assert(typeof r.body.data.feedSize === "number", "feedSize should be number");
    });

    await test("each feed card has required fields", async function () {
      var r = await callFn("feed", "GET", token, null);
      var cards = r.body.data.cards;
      for (var card of cards) {
        assertShape(card, ["id", "itemId", "score", "confidenceLabel", "explanationFacts", "allowedActions"], "feed card");
        assert(typeof card.score === "number", "card.score should be number");
        assert(["new", "learning", "strong_match"].includes(card.confidenceLabel), "invalid confidenceLabel: " + card.confidenceLabel);
        assert(Array.isArray(card.explanationFacts), "explanationFacts should be array");
        assert(Array.isArray(card.allowedActions), "allowedActions should be array");
      }
    });

    await test("POST /actions with im_in returns accepted + personaUpdated", async function () {
      var r = await callFn("actions", "POST", token, {
        recommendationId: "00000000-0000-0000-0000-000000000001",
        actionType: "im_in",
        reasons: null,
        freeText: null,
      });
      assertStatus(r, 200, "actions im_in");
      assert(r.body.data.accepted === true, "expected accepted true");
    });

    await test("POST /actions with pass returns accepted + eligibleFollowUp field", async function () {
      var r = await callFn("actions", "POST", token, {
        recommendationId: "00000000-0000-0000-0000-000000000002",
        actionType: "pass",
        reasons: ["not interested"],
        freeText: null,
      });
      assertStatus(r, 200, "actions pass");
      assert(r.body.data.accepted === true, "expected accepted true");
      assert("eligibleFollowUp" in r.body.data, "expected eligibleFollowUp field");
    });

    // ── Group 4: Chat + Persona State Journey ─────────────────────────────────

    console.log("\n=== Group 4: Chat + Persona State Journey ===\n");

    await test("POST /chat-messages returns reply with persona updates", async function () {
      var r = await callFn("chat-messages", "POST", token, {
        message: "I love sushi and hiking",
        conversationId: null,
        learningPromptResponseId: null,
      });
      assertStatus(r, 200, "chat");
      assertShape(r.body.data, ["reply", "conversationId", "personaUpdatesApplied", "feedStale"], "chat data");
      assert(typeof r.body.data.reply === "string", "reply should be string");
      assert(r.body.data.reply.length > 0, "reply should be non-empty");
      assert(Array.isArray(r.body.data.personaUpdatesApplied), "personaUpdatesApplied should be array");
    });

    await test("GET /persona after chat shows persona view structure", async function () {
      var r = await callFn("persona", "GET", token, null);
      assertStatus(r, 200, "persona after chat");
      assertShape(r.body.data, ["projections", "hardFilters", "boostState"], "persona data");
      assert(Array.isArray(r.body.data.projections), "projections should be array");
      assert(Array.isArray(r.body.data.hardFilters), "hardFilters should be array");
      assertShape(r.body.data.boostState, ["completed", "skipped"], "boostState");
    });

    // ── Group 5: Learning Journey ─────────────────────────────────────────────

    console.log("\n=== Group 5: Learning Journey ===\n");

    await test("GET /learning-prompt returns prompt with required fields", async function () {
      var r = await callFn("learning-prompt", "GET", token, null);
      assertStatus(r, 200, "learning-prompt");
      assertShape(r.body.data, ["prompt", "sessionLearningCount", "sessionCap"], "learning-prompt data");
      if (r.body.data.prompt) {
        assertShape(r.body.data.prompt, ["questionText", "topicFamily", "channelEligibility"], "prompt object");
      }
    });

    await test("POST /learning-answer returns accepted response", async function () {
      var r = await callFn("learning-answer", "POST", token, {
        questionId: "00000000-0000-0000-0000-000000000001",
        answer: { selected: "sushi" },
        sourceSurface: "in_app_chat",
        linkedRecommendationId: null,
      });
      assertStatus(r, 200, "learning-answer");
      assert(r.body.data.accepted === true, "expected accepted true");
      assert("personaUpdated" in r.body.data, "expected personaUpdated field");
      assert("feedStale" in r.body.data, "expected feedStale field");
    });

    // ── Group 6: Notification Preferences ─────────────────────────────────────

    console.log("\n=== Group 6: Notification Preferences ===\n");

    await test("POST /notifications-preferences saves and returns prefs", async function () {
      var prefs = { pushEnabled: true, emailEnabled: false, channels: { learning: true, recommendations: true, system: true } };
      var r = await callFn("notifications-preferences", "POST", token, prefs);
      assertStatus(r, 200, "notification-prefs");
      assert(r.body.data.pushEnabled === true, "expected pushEnabled true");
      assert(r.body.data.emailEnabled === false, "expected emailEnabled false");
      assertShape(r.body.data.channels, ["learning", "recommendations", "system"], "channels");
    });

    // ── Group 7: Account Cleanup ──────────────────────────────────────────────

    console.log("\n=== Group 7: Account Cleanup ===\n");

    await test("DELETE /account-delete returns deleted confirmation", async function () {
      var r = await callFn("account-delete", "DELETE", token, null);
      assertStatus(r, 200, "account-delete");
      assert(r.body.data.deleted === true, "expected deleted true");
      assert(r.body.data.userId === userId, "expected userId " + userId + ", got " + r.body.data.userId);
    });

  } catch (e) {
    console.error("\n  Unexpected error: " + e.message);
    failed++;
    errors.push({ name: "unexpected", error: e.message });

    // Best-effort cleanup
    try {
      await callFn("account-delete", "DELETE", token, null);
    } catch (_) {}
  }

  // ── Summary ─────────────────────────────────────────────────────────────────

  console.log("\n" + "=".repeat(50));
  console.log("  Results: " + passed + " passed, " + failed + " failed");

  if (errors.length > 0) {
    console.log("\n  Failures:");
    for (var err of errors) {
      console.log("    - " + err.name + ": " + err.error);
    }
  }

  console.log("=".repeat(50) + "\n");
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(function (e) { console.error("Fatal:", e); process.exit(1); });
