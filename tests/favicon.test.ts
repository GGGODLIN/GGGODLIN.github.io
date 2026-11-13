import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const pageTemplates = [
  "src/pages/index.astro",
  "src/layouts/BlogPost.astro",
  "src/pages/demo.astro",
  "src/pages/workshops.astro",
] as const;

test("all primary page templates link /favicon.svg and public/favicon.svg exists", () => {
  const faviconUrl = new URL("../public/favicon.svg", import.meta.url);
  assert.equal(existsSync(faviconUrl), true, "Expected public/favicon.svg to exist");
  const svg = readFileSync(faviconUrl, "utf8");
  assert.match(svg, /<svg\b/);

  for (const relPath of pageTemplates) {
    const source = readFileSync(new URL(`../${relPath}`, import.meta.url), "utf8");
    assert.match(
      source,
      /<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="\/favicon\.svg"\s*\/>/,
      relPath,
    );
  }
});
