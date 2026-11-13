const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return "Not recorded";
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function formatMeasurement(value, unit) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Not recorded";
  }
  const formatted = formatNumber(value, 2);
  return unit ? `${formatted} ${unit}` : formatted;
}

function truncateText(text, maxChars = 120) {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "...";
}

test("formatNumber and formatMeasurement preserve null scientific states", () => {
  assert.strictEqual(formatNumber(1234.567, 2), "1,234.57");
  assert.strictEqual(formatNumber(null), "Not recorded");
  assert.strictEqual(formatNumber(undefined), "Not recorded");
  assert.strictEqual(formatMeasurement(2.45, "cm/s"), "2.45 cm/s");
  assert.strictEqual(formatMeasurement(null, "cm/s"), "Not recorded");
});

test("truncateText truncates longer strings with ellipsis", () => {
  const sample = "This is a long scientific excerpt from NASA microgravity research.";
  assert.strictEqual(truncateText(sample, 20), "This is a long scien...");
  assert.strictEqual(truncateText("Short text", 20), "Short text");
});

test("aerospace design tokens exist and match canonical palette", () => {
  const tsTokensPath = path.join(__dirname, "..", "lib", "design-system", "tokens.ts");
  const cssTokensPath = path.join(__dirname, "..", "styles", "design-tokens.css");

  const tsContent = fs.readFileSync(tsTokensPath, "utf8");
  const cssContent = fs.readFileSync(cssTokensPath, "utf8");

  for (const hex of ["#071525", "#0D2035", "#3B82F6", "#22D3EE", "#F59E0B", "#F97316"]) {
    assert.ok(tsContent.includes(hex), `Expected ${hex} in tokens.ts`);
    assert.ok(cssContent.toLowerCase().includes(hex.toLowerCase()), `Expected ${hex} in design-tokens.css`);
  }
});
