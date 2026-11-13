import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const demoSource = readFileSync(
  new URL("../src/pages/demo.astro", import.meta.url),
  "utf8",
);

test("demo cards declare accurate intrinsic dimensions and lazy-load below-the-fold covers", () => {
  assert.match(demoSource, /loading=\{index === 0 \? "eager" : "lazy"\}/);
  assert.match(demoSource, /fetchpriority=\{index === 0 \? "high" : undefined\}/);
  assert.match(demoSource, /decoding="async"/);
  assert.match(
    demoSource,
    /image:\s*"\/play\/hv-modern\/public\/assets\/twilight-arena\.png"[\s\S]*?width:\s*1672[\s\S]*?height:\s*941/,
  );
  assert.match(
    demoSource,
    /image:\s*"\/images\/demos\/moving-castle\.png"[\s\S]*?width:\s*1280[\s\S]*?height:\s*800/,
  );
});
