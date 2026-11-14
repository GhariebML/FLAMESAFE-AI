const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("Orbital Research Experience tokens and scientific visual assets exist", () => {
  const designDoc = fs.readFileSync(
    path.join(__dirname, "../../docs/design-system/FLAMESAFE_ORBITAL_DESIGN.md"),
    "utf8"
  );
  assert.ok(designDoc.includes("#080A0F"), "Design doc must include Obsidian background #080A0F");
  assert.ok(designDoc.includes("#FF6B24"), "Design doc must include Primary Flame Orange #FF6B24");

  const storyDir = path.join(__dirname, "../public/images/story");
  for (const asset of [
    "earth-applications.png",
    "research-gaps.png",
    "scientific-measurements.png",
    "inv-bass.png",
    "inv-saffire.png",
    "inv-flex.png",
    "inv-same.png",
    "inv-acme.png",
  ]) {
    const fullPath = path.join(storyDir, asset);
    assert.ok(fs.existsSync(fullPath), `Missing visual asset: ${asset}`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 1024, `Visual asset ${asset} is unexpectedly empty`);
  }
});

test("AstroFlameCompanion implements welcome prompt, suggested queries, and real API call", () => {
  const companionSrc = fs.readFileSync(
    path.join(__dirname, "../components/assistant/AstroFlameCompanion.tsx"),
    "utf8"
  );
  assert.ok(
    companionSrc.includes("What would you like to discover about combustion in space?"),
    "Companion must include the welcome message"
  );
  assert.ok(
    companionSrc.includes("How do flames behave in microgravity?"),
    "Companion must include suggested scientific prompts"
  );
  assert.ok(
    companionSrc.includes("apiClient.queryAssistant"),
    "Companion must call the real backend assistant endpoint"
  );
});
