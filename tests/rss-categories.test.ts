import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rssSource = readFileSync(
  new URL("../src/pages/rss.xml.js", import.meta.url),
  "utf8",
);

test("RSS feed maps canonical tag labels onto item categories", () => {
  assert.match(rssSource, /canonicalTagRegistry\.getLabel/);
  assert.match(rssSource, /categories:\s*post\.data\.tags\.map/);
});
