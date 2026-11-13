const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

function deriveAIStatusViewModel(status) {
  if (!status) {
    return {
      loading: true,
      badgeLabel: "Checking AI provider runtime status...",
      providerLabel: "",
      connectionLabel: "",
      hasError: false,
    };
  }

  const isLiveGemini =
    status.provider === "gemini" &&
    status.configured &&
    status.connected &&
    !status.is_mock_provider;
  const isUnconfigured = !status.configured;

  let badgeLabel = "Mock / Offline Mode";
  if (isLiveGemini) {
    badgeLabel = "Gemini Live Connected";
  } else if (isUnconfigured) {
    badgeLabel = "AI Key Not Configured";
  } else if (status.last_error) {
    badgeLabel = "Gemini Unavailable (Fallback Active)";
  }

  const providerLabel = `${status.provider.toUpperCase()} ${
    status.is_mock_provider ? "(MOCK)" : "(REAL)"
  }`;
  const connectionLabel = status.connected
    ? "Verified Live"
    : status.configured
    ? "Offline / Fallback"
    : "Not Configured";

  return {
    loading: false,
    badgeLabel,
    providerLabel,
    connectionLabel,
    generationModel: status.generation_model,
    embeddingModel: `${status.embedding_model} (${status.embedding_dimensions}d)`,
    hasError: Boolean(status.last_error),
    errorText: status.last_error || null,
  };
}

test("AI status display: Gemini connected state", () => {
  const vm = deriveAIStatusViewModel({
    provider: "gemini",
    configured: true,
    connected: true,
    generation_model: "gemini-3.8-flash",
    embedding_model: "gemini-embedding-2",
    embedding_dimensions: 768,
    is_mock_provider: false,
    last_successful_request_at: "2026-11-13T22:00:00Z",
    last_error: null,
  });

  assert.strictEqual(vm.badgeLabel, "Gemini Live Connected");
  assert.strictEqual(vm.providerLabel, "GEMINI (REAL)");
  assert.strictEqual(vm.connectionLabel, "Verified Live");
  assert.strictEqual(vm.generationModel, "gemini-3.8-flash");
  assert.strictEqual(vm.embeddingModel, "gemini-embedding-2 (768d)");
  assert.strictEqual(vm.hasError, false);
});

test("AI status display: Mock mode state", () => {
  const vm = deriveAIStatusViewModel({
    provider: "mock",
    configured: true,
    connected: false,
    generation_model: "deterministic-grounded-synthesizer-v1",
    embedding_model: "deterministic-sha256-v1",
    embedding_dimensions: 768,
    is_mock_provider: true,
    last_successful_request_at: null,
    last_error: null,
  });

  assert.strictEqual(vm.badgeLabel, "Mock / Offline Mode");
  assert.strictEqual(vm.providerLabel, "MOCK (MOCK)");
  assert.strictEqual(vm.connectionLabel, "Offline / Fallback");
});

test("AI status display: Not configured state", () => {
  const vm = deriveAIStatusViewModel({
    provider: "gemini",
    configured: false,
    connected: false,
    generation_model: "gemini-3.8-flash",
    embedding_model: "gemini-embedding-2",
    embedding_dimensions: 768,
    is_mock_provider: true,
    last_successful_request_at: null,
    last_error: "GEMINI_API_KEY is not configured in backend/.env.",
  });

  assert.strictEqual(vm.badgeLabel, "AI Key Not Configured");
  assert.strictEqual(vm.connectionLabel, "Not Configured");
  assert.strictEqual(vm.hasError, true);
  assert.ok(vm.errorText.includes("GEMINI_API_KEY is not configured"));
});

test("AI status display: Error display and Research Workspace integration", () => {
  const vm = deriveAIStatusViewModel({
    provider: "gemini",
    configured: true,
    connected: false,
    generation_model: "gemini-3.8-flash",
    embedding_model: "gemini-embedding-2",
    embedding_dimensions: 768,
    is_mock_provider: true,
    last_successful_request_at: null,
    last_error: "Gemini API rate limit or quota exceeded",
  });

  assert.strictEqual(vm.badgeLabel, "Gemini Unavailable (Fallback Active)");
  assert.strictEqual(vm.hasError, true);
  assert.ok(vm.errorText.includes("rate limit"));

  const cardPath = path.join(
    __dirname,
    "..",
    "components",
    "research",
    "AIRuntimeStatusCard.tsx"
  );
  const researchPagePath = path.join(__dirname, "..", "app", "research", "page.tsx");
  const cardSource = fs.readFileSync(cardPath, "utf8");
  const pageSource = fs.readFileSync(researchPagePath, "utf8");

  assert.ok(cardSource.includes("Gemini Live Connected"));
  assert.ok(cardSource.includes("AI Key Not Configured"));
  assert.ok(cardSource.includes("Gemini Unavailable (Fallback Active)"));
  assert.ok(pageSource.includes("AIRuntimeStatusCard"));
  assert.ok(pageSource.includes("getAIStatus"));
});
