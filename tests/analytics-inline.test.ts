import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const analyticsSource = readFileSync(
  new URL("../src/components/Analytics.astro", import.meta.url),
  "utf8",
);

test("Analytics script explicitly declares is:inline to avoid astro(4000) diagnostic hint", () => {
  assert.match(analyticsSource, /<script\s+is:inline\b/);
});
