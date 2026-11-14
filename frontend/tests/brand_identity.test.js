const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("official FlameSafe AI brand assets exist and are non-empty", () => {
  const brandRoot = path.join(__dirname, "..", "public", "brand");
  const requiredAssets = [
    path.join(brandRoot, "flamesafe-logo.png"),
    path.join(brandRoot, "brand-assets", "flamesafe-logo-full.png"),
    path.join(brandRoot, "brand-assets", "flamesafe-emblem.png"),
    path.join(brandRoot, "favicon", "favicon.ico"),
    path.join(brandRoot, "favicon", "icon.png"),
    path.join(brandRoot, "favicon", "icon-32.png"),
    path.join(brandRoot, "favicon", "icon-16.png"),
    path.join(brandRoot, "favicon", "apple-touch-icon.png"),
  ];

  for (const filePath of requiredAssets) {
    assert.ok(fs.existsSync(filePath), `Missing official brand asset: ${filePath}`);
    const stat = fs.statSync(filePath);
    assert.ok(stat.size > 200, `Brand asset appears unexpectedly small: ${filePath}`);
  }
});

test("official FlameSafe AI palette tokens exist in tokens.ts and design-tokens.css", () => {
  const tsTokens = fs.readFileSync(
    path.join(__dirname, "..", "lib", "design-system", "tokens.ts"),
    "utf8"
  );
  const cssTokens = fs.readFileSync(
    path.join(__dirname, "..", "styles", "design-tokens.css"),
    "utf8"
  );

  const officialBrandHexes = [
    "#001030",
    "#001840",
    "#0050C0",
    "#006EDB",
    "#00A0F0",
    "#62C9F5",
    "#F08000",
    "#F04000",
    "#FFC247",
    "#F5F8FC",
    "#EDF5FC",
    "#E3EAF3",
    "#10233F",
    "#64748B",
    "#15966B",
    "#D99520",
    "#D64545",
  ];

  for (const hex of officialBrandHexes) {
    assert.ok(tsTokens.includes(hex), `Expected ${hex} in tokens.ts`);
    assert.ok(
      cssTokens.toLowerCase().includes(hex.toLowerCase()),
      `Expected ${hex} in design-tokens.css`
    );
  }
});

test("BrandLogo references the official white-background logo PNG without Lucide replacement", () => {
  const brandLogoPath = path.join(__dirname, "..", "components", "brand", "BrandLogo.tsx");
  const content = fs.readFileSync(brandLogoPath, "utf8");
  assert.ok(content.includes("/brand/flamesafe-logo.png"));
  assert.ok(content.includes("/brand/brand-assets/flamesafe-emblem.png"));
  assert.ok(!content.includes("lucide-react"), "BrandLogo must not substitute a Lucide icon");
});
