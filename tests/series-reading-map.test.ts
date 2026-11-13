import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  expectedSeries,
  resolveArticleSeries,
  type SeriesArticleSummary,
} from "../src/data/series-catalog.ts";

const blogPostLayout = readFileSync(
  new URL("../src/layouts/BlogPost.astro", import.meta.url),
  "utf8",
);

test("resolveArticleSeries orders members chronologically, ranks focused series first, and handles islands", () => {
  const sampleArticles: readonly SeriesArticleSummary[] = [
    {
      slug: "checker-layoff",
      title: "把 AI 檢查員裁掉",
      pubDate: new Date("2026-08-31T00:00:00.000Z"),
    },
    {
      slug: "exit-0-illusion",
      title: "Exit 0 的幻覺",
      pubDate: new Date("2026-05-24T00:00:00.000Z"),
    },
    {
      slug: "hook-watchdog",
      title: "Hook 監工",
      pubDate: new Date("2026-06-15T00:00:00.000Z"),
    },
    {
      slug: "local-llm-hook-judge",
      title: "本地模型判官",
      pubDate: new Date("2026-07-18T00:00:00.000Z"),
    },
  ];

  const customSeries = [
    {
      id: "S99",
      title: "較廣泛的十篇大系列",
      minimumCommonConcept: "大系列概念",
      members: [
        "checker-layoff",
        "exit-0-illusion",
        "hook-watchdog",
        "local-llm-hook-judge",
      ],
      validConnectors: ["hook"],
    },
    {
      id: "S08",
      title: "較聚焦的三篇小專題",
      minimumCommonConcept: "小專題概念",
      members: ["checker-layoff", "exit-0-illusion", "local-llm-hook-judge"],
      validConnectors: ["verify"],
    },
  ] as const;

  const resolved = resolveArticleSeries(
    "local-llm-hook-judge",
    sampleArticles,
    customSeries,
  );

  assert.deepEqual(
    resolved.map((s) => s.id),
    ["S08", "S99"],
  );
  assert.deepEqual(
    resolved[0].items.map((item) => item.slug),
    ["exit-0-illusion", "local-llm-hook-judge", "checker-layoff"],
  );
  assert.equal(resolved[0].currentIndex, 1);
  assert.equal(resolved[0].items[1].current, true);
  assert.equal(resolved[0].items[0].current, false);

  assert.deepEqual(
    resolveArticleSeries("matt-philosophy", sampleArticles, expectedSeries),
    [],
  );
});

test("BlogPost layout renders clickable tag filter links and series reading navigation", () => {
  assert.match(blogPostLayout, /href=\{`\/\?tag=\$\{encodeURIComponent\(tag\)\}`\}/);
  assert.match(blogPostLayout, /data-series-nav/);
});
