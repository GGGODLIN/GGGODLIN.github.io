import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveNavItemState } from "../src/data/nav-state.ts";

const navSource = readFileSync(
  new URL("../src/components/Nav.astro", import.meta.url),
  "utf8",
);

test("resolveNavItemState marks exact page matches with aria-current='page' and child posts as section-active", () => {
  assert.deepEqual(resolveNavItemState("/", "blog"), {
    active: true,
    ariaCurrent: "page",
  });
  assert.deepEqual(
    resolveNavItemState("/blog/review-materiality-gate/", "blog"),
    {
      active: true,
      ariaCurrent: undefined,
    },
  );
  assert.deepEqual(resolveNavItemState("/workshops/", "workshops"), {
    active: true,
    ariaCurrent: "page",
  });
  assert.deepEqual(resolveNavItemState("/demo/", "demo"), {
    active: true,
    ariaCurrent: "page",
  });
  assert.deepEqual(resolveNavItemState("/404", "blog"), {
    active: false,
    ariaCurrent: undefined,
  });
});

test("Nav component wires resolveNavItemState for aria-current and active styling", () => {
  assert.match(navSource, /resolveNavItemState/);
  assert.match(navSource, /aria-current=/);
  assert.match(navSource, /data-active=/);
});
