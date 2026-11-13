const test = require("node:test");
const assert = require("node:assert");

function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return "N/A";
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function truncateText(text, maxChars = 120) {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "...";
}

test("formatNumber formats numbers correctly", () => {
  assert.strictEqual(formatNumber(1234.567, 2), "1,234.57");
  assert.strictEqual(formatNumber(null), "N/A");
  assert.strictEqual(formatNumber(undefined), "N/A");
});

test("truncateText truncates longer strings with ellipsis", () => {
  const sample = "This is a long scientific excerpt from NASA microgravity research.";
  assert.strictEqual(truncateText(sample, 20), "This is a long scien...");
  assert.strictEqual(truncateText("Short text", 20), "Short text");
});
