import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const files = [
  {
    name: "src/pages/index.astro",
    selector: /\.post-meta\s*\{([^}]+)\}/,
  },
  {
    name: "src/layouts/BlogPost.astro",
    selector: /\.post-meta\s*\{([^}]+)\}/,
  },
  {
    name: "src/pages/demo.astro",
    selector: /\.demo-kind\s*\{([^}]+)\}/,
  },
] as const;

test("metadata labels use --text-secondary so small mono text meets WCAG AA contrast", () => {
  for (const { name, selector } of files) {
    const source = readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
    const match = source.match(selector);
    assert.ok(match, `Missing metadata style block in ${name}`);
    assert.match(match[1], /color:\s*var\(--text-secondary\)/, name);
    assert.doesNotMatch(match[1], /color:\s*var\(--text-muted\)/, name);
  }
});
