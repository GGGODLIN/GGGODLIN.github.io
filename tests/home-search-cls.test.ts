import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const indexSource = readFileSync(
  new URL("../src/pages/index.astro", import.meta.url),
  "utf8",
);

test("hidden search trigger reserves non-shrinking layout box via visibility:hidden and flex-shrink:0 to prevent mobile CLS", () => {
  const baseRule = indexSource.match(/\.search-trigger\s*\{([^}]+)\}/);
  assert.ok(baseRule, "Expected .search-trigger rule");
  assert.match(baseRule[1], /flex-shrink:\s*0/);

  const hiddenRule = indexSource.match(/\.search-trigger\[hidden\]\s*\{([^}]+)\}/);
  assert.ok(hiddenRule, "Expected dedicated .search-trigger[hidden] rule");
  assert.match(hiddenRule[1], /visibility:\s*hidden/);
  assert.doesNotMatch(hiddenRule[1], /display:\s*none/);
  assert.doesNotMatch(
    indexSource,
    /\.search-trigger\[hidden\]\s*,\s*\.article-discovery\[hidden\]\s*\{\s*display:\s*none/,
  );
});
