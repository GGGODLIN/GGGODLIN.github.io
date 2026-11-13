import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import astroConfig from "../astro.config.mjs";

const globalCss = readFileSync(
  new URL("../src/styles/global.css", import.meta.url),
  "utf8",
);

test("shiki uses dual light/dark CSS variables without hardcoded white inline background", () => {
  const shiki = astroConfig.markdown?.shikiConfig;
  assert.ok(shiki, "Expected markdown.shikiConfig to be configured");
  assert.equal(shiki.defaultColor, false);
  assert.deepEqual(shiki.themes, {
    light: "github-light",
    dark: "github-dark",
  });
  assert.equal("theme" in shiki && Boolean(shiki.theme), false);

  assert.match(globalCss, /\.astro-code[\s\S]*?color:\s*var\(--shiki-light\)/);
  assert.match(
    globalCss,
    /\[data-mode="dark"\]\s+\.astro-code[\s\S]*?color:\s*var\(--shiki-dark\)/,
  );
});
