import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_PINNED_MODELS,
  buildComparisonRows,
  togglePinnedModel,
  type CompareModelRecord,
} from "../src/data/tier-compare.ts";

test("togglePinnedModel enforces max 3 selection cap and removes on second click", () => {
  let pinned: string[] = [];
  pinned = togglePinnedModel(pinned, "m1");
  pinned = togglePinnedModel(pinned, "m2");
  pinned = togglePinnedModel(pinned, "m3");
  assert.deepEqual(pinned, ["m1", "m2", "m3"]);
  assert.equal(pinned.length, MAX_PINNED_MODELS);

  // Fourth model is ignored until one is unpinned
  pinned = togglePinnedModel(pinned, "m4");
  assert.deepEqual(pinned, ["m1", "m2", "m3"]);

  pinned = togglePinnedModel(pinned, "m2");
  assert.deepEqual(pinned, ["m1", "m3"]);
});

test("buildComparisonRows places shared realPr and summary first when comparing across tables", () => {
  const frontierModel: CompareModelRecord = {
    id: "frontier:opus",
    tableId: "frontier",
    tableHeading: "前沿模型",
    tierLabel: "S",
    name: "Claude Opus 5.5",
    metrics: [
      { key: "realPr", label: "自己做真實 PR", value: "3（4） 題" },
      { key: "mutation", label: "突變測試分數", value: "第一" },
      { key: "summary", label: "一句話", value: "品質最好" },
    ],
  };
  const nonFrontierModel: CompareModelRecord = {
    id: "non-frontier:mimo",
    tableId: "non-frontier",
    tableHeading: "非前沿模型",
    tierLabel: "T1",
    name: "MiMo V2.6 Flash",
    metrics: [
      { key: "daily", label: "日常任務", value: "43–50" },
      { key: "realPr", label: "自己做真實 PR", value: "5 題" },
      { key: "summary", label: "一句話", value: "免費裡通過數最多" },
    ],
  };

  const rows = buildComparisonRows([frontierModel, nonFrontierModel]);
  assert.equal(rows[0].key, "realPr");
  assert.equal(rows[0].shared, true);
  assert.equal(rows[1].key, "summary");
  assert.equal(rows[1].shared, true);

  const mutationRow = rows.find((row) => row.key === "mutation");
  assert.ok(mutationRow);
  assert.equal(mutationRow.shared, false);
  assert.equal(mutationRow.values[1].value, "—（不同考卷）");
});
