import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseTldrBlocks } from "../src/data/tldr.ts";

const blogPostSource = readFileSync(
  new URL("../src/layouts/BlogPost.astro", import.meta.url),
  "utf8",
);
const astroConfigSource = readFileSync(
  new URL("../astro.config.mjs", import.meta.url),
  "utf8",
);

test("parseTldrBlocks splits paragraphs and parses safe inline links, bold, and code", () => {
  assert.deepEqual(parseTldrBlocks(undefined), []);
  assert.deepEqual(parseTldrBlocks("   \n\n  "), []);

  const blocks = parseTldrBlocks(
    [
      "核心做法是把 **能力** 與 `漂移` 分開量，詳見 [repo-to-bench](https://github.com/GGGODLIN/repo-to-bench) 與 [Tier 表](/tier/)。",
      "",
      "不允許 [偽造連結](javascript:alert(1)) 與 [協定相對](//evil.example/x)。",
    ].join("\n"),
  );

  assert.equal(blocks.length, 2);
  assert.deepEqual(blocks[0], [
    { type: "text", value: "核心做法是把 " },
    { type: "strong", value: "能力" },
    { type: "text", value: " 與 " },
    { type: "code", value: "漂移" },
    { type: "text", value: " 分開量，詳見 " },
    {
      type: "link",
      label: "repo-to-bench",
      href: "https://github.com/GGGODLIN/repo-to-bench",
    },
    { type: "text", value: " 與 " },
    { type: "link", label: "Tier 表", href: "/tier/" },
    { type: "text", value: "。" },
  ]);
  assert.deepEqual(blocks[1], [
    { type: "text", value: "不允許 " },
    { type: "text", value: "偽造連結" },
    { type: "text", value: " 與 " },
    { type: "text", value: "協定相對" },
    { type: "text", value: "。" },
  ]);
});

test("BlogPost renders TL;DR beneath H1 using WCAG-safe label contrast and strips duplicate markdown H1", () => {
  const h1Index = blogPostSource.indexOf('<h1 class="post-title">{title}</h1>');
  const tldrIndex = blogPostSource.indexOf('class="article-tldr"');
  const slotIndex = blogPostSource.indexOf("<slot />");

  assert.ok(h1Index > -1, "BlogPost must render frontmatter title as H1");
  assert.ok(tldrIndex > h1Index, "TL;DR block must appear below H1");
  assert.ok(slotIndex > tldrIndex, "TL;DR block must appear before article body slot");

  const labelStyle = blogPostSource.match(/\.article-tldr-label\s*\{([^}]+)\}/);
  assert.ok(labelStyle, "Missing .article-tldr-label style block");
  assert.match(labelStyle[1], /color:\s*var\(--text-secondary\)/);
  assert.doesNotMatch(labelStyle[1], /color:\s*var\(--text-muted\)/);

  assert.match(astroConfigSource, /remarkStripLeadingH1/);
});
