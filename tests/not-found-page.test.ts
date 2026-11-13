import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("custom 404 page template exists with site navigation, theme support, and latest posts fallback", () => {
  const pageUrl = new URL("../src/pages/404.astro", import.meta.url);
  assert.equal(existsSync(pageUrl), true, "Expected src/pages/404.astro to exist");
  const source = readFileSync(pageUrl, "utf8");
  assert.match(source, /<main\s+class="container"/);
  assert.match(source, /<ThemeBoot\s*\/>/);
  assert.match(source, /<ThemeSwitcher\s*\/>/);
  assert.match(source, /getCollection\("blog"\)/);
  assert.match(source, /href="\/favicon\.svg"/);
});
