import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { extractCodeBlockText, formatCopyButtonState } from "../src/data/code-copy.ts";

const blogPostSource = readFileSync(
  new URL("../src/layouts/BlogPost.astro", import.meta.url),
  "utf8",
);

test("extractCodeBlockText trims trailing newline and formatCopyButtonState returns accessible labels", () => {
  assert.equal(
    extractCodeBlockText("npx astro check\nnpm test\n"),
    "npx astro check\nnpm test",
  );
  assert.equal(extractCodeBlockText(""), "");

  assert.deepEqual(formatCopyButtonState("idle"), {
    text: "複製",
    ariaLabel: "複製程式碼",
    copied: "false",
  });
  assert.deepEqual(formatCopyButtonState("copied"), {
    text: "已複製",
    ariaLabel: "已複製程式碼",
    copied: "true",
  });
});

test("BlogPost layout wires client-side progressive code copy buttons", () => {
  assert.match(blogPostSource, /code-copy-btn/);
  assert.match(blogPostSource, /extractCodeBlockText/);
});
