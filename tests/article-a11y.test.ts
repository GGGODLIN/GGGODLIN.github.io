import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const blogPostSource = readFileSync(
  new URL("../src/layouts/BlogPost.astro", import.meta.url),
  "utf8",
);

test("BlogPost layout wraps article in a main landmark and underlines inline prose links", () => {
  assert.match(blogPostSource, /<main>\s*<article\s+class="container article-body">/);
  assert.match(blogPostSource, /text-decoration:\s*underline/);
});
