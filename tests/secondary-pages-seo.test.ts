import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const secondaryPages = [
  "src/pages/demo.astro",
  "src/pages/workshops.astro",
] as const;

test("demo and workshops pages include canonical, Open Graph, RSS discovery, and CollectionPage JSON-LD", () => {
  for (const relPath of secondaryPages) {
    const source = readFileSync(new URL(`../${relPath}`, import.meta.url), "utf8");
    assert.match(source, /<link\s+rel="canonical"\s+href=\{canonicalURL\}\s*\/>/, relPath);
    assert.match(source, /<meta\s+property="og:title"/, relPath);
    assert.match(source, /<meta\s+property="og:description"/, relPath);
    assert.match(source, /<meta\s+property="og:url"\s+content=\{canonicalURL\}\s*\/>/, relPath);
    assert.match(source, /<meta\s+name="twitter:card"/, relPath);
    assert.match(source, /type="application\/rss\+xml"/, relPath);
    assert.match(source, /"@type":\s*"CollectionPage"/, relPath);
  }
});
