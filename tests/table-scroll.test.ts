import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const blogPostSource = readFileSync(
  new URL("../src/layouts/BlogPost.astro", import.meta.url),
  "utf8",
);
const globalCss = readFileSync(
  new URL("../src/styles/global.css", import.meta.url),
  "utf8",
);

test("article tables get a horizontal scroll wrapper and tabular numeric alignment without breaking 100% desktop table width", () => {
  assert.match(blogPostSource, /table-scroll/);
  assert.match(globalCss, /font-variant-numeric:\s*tabular-nums/);
  assert.doesNotMatch(globalCss, /table\s*\{[^}]*display:\s*block/);
});
