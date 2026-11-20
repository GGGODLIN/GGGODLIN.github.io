import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const raw = readFileSync(new URL("../src/data/tier-table.json", import.meta.url), "utf8");
const data = JSON.parse(raw);

// 頁面照欄位 key 取格子，key 打錯或漏一欄時畫面只會默默空一格
test("every tier row has exactly one cell per column key", () => {
  for (const table of data.tables) {
    const keys = table.columns.map((column: { key: string }) => column.key).sort();
    for (const group of table.groups) {
      for (const row of group.rows) {
        assert.deepEqual(Object.keys(row.cells).sort(), keys, `${table.id} / ${row.model.name}`);
      }
    }
  }
});

// 題目與環境取自私有工作專案，公開資料檔不能帶回這些字
test("tier data stays free of private project identifiers", () => {
  for (const word of ["Calyx", "watchdogs", "hv-clone", "akocommerce", "網友", "Devin", "M4"]) {
    assert.equal(raw.includes(word), false, word);
  }
  assert.doesNotMatch(raw, /#\d{3,}/);
});

test("tier page guards narrow laptop scroll thresholds, mobile orphan cell, and print rules", () => {
  const page = readFileSync(new URL("../src/pages/tier.astro", import.meta.url), "utf8");
  assert.match(page, /@media \(max-width: 1320px\) and \(min-width: 769px\)/);
  assert.match(page, /\.roster--non-frontier\s*\{[^}]*min-width:\s*1180px;/);
  assert.match(page, /\.cols--non-frontier \.col-analysis\s*\{[^}]*grid-column:\s*1 \/ -1;/);
  assert.match(page, /@media print\s*\{[\s\S]*break-inside:\s*avoid;/);
});

test("tier page preserves valid ARIA table structure, rowheader cells, time tag, and avoids static tabindex traps", () => {
  const page = readFileSync(new URL("../src/pages/tier.astro", import.meta.url), "utf8");
  assert.match(page, /class=\{`rh-cols cols--\$\{table\.id\}`\}\s+role="none"/);
  assert.match(page, /class="tier-pillar"\s+aria-hidden="true"/);
  assert.match(page, /class="sr-tier-cell"\s+role="cell"/);
  assert.match(page, /class="cell-model"\s+role="rowheader"/);
  assert.doesNotMatch(page, /class=\{`model-row[^`]*`\}\s+role="row"\s+tabindex="0"/);
  assert.match(page, /<time datetime=\{data\.updated\}>\{data\.updated\}<\/time>/);
});

test("tier page offers collapsible quick reading guide and bidirectional Argon bridge anchors", () => {
  const page = readFileSync(new URL("../src/pages/tier.astro", import.meta.url), "utf8");
  assert.match(page, /<details class="reading-guide">/);
  assert.match(page, /href="#argon-non-frontier"/);
  assert.match(page, /href="#argon-frontier"/);
  assert.match(page, /\.model-row:target/);
});

test("tier page related methodology links resolve to existing published blog articles", () => {
  const page = readFileSync(new URL("../src/pages/tier.astro", import.meta.url), "utf8");
  const slugs = Array.from(
    page.matchAll(/\{\s*slug:\s*"([a-z0-9-]+)"/g),
    (match) => match[1],
  );
  assert.ok(slugs.length >= 4, "expected at least 4 related methodology articles");
  for (const slug of slugs) {
    const fileUrl = new URL(`../src/content/blog/${slug}.md`, import.meta.url);
    assert.equal(existsSync(fileUrl), true, `missing related blog article: ${slug}`);
  }
});
