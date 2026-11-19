import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
