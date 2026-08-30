import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalTagRegistry,
  createTagRegistry,
} from "../src/data/tag-registry.ts";
import { readBlogCorpus } from "./support/blog-corpus.ts";

const blogCorpus = readBlogCorpus(
  new URL("../src/content/blog", import.meta.url),
);

const validTag = {
  id: "example",
  label: "Example",
  aliases: ["legacy-example"],
  dimension: "subject",
  meaning: "A reusable example subject.",
  boundary: "Not every article with an example.",
} as const;

const expectedConnectorEntries = [
  {
    id: "report-vs-reality",
    label: "report vs reality",
    aliases: [],
    dimension: "subject",
    meaning: "AI、工具或流程回報的成功、沉默或來源宣稱，與外部可觀察結果之間的落差。",
    boundary: "完成宣告核對用 verify，外部事實來源用 fact-check；本 tag 只標示跨場景的回報層與現實落差。",
  },
  {
    id: "review-governance",
    label: "review governance",
    aliases: [],
    dimension: "subject",
    meaning: "review 的視角配置、證據複查、觸發時機、影響面與人類拍板。",
    boundary: "code diff 用 code-review，spec 用 spec-review；只談單一審查工件不自動加入。",
  },
  {
    id: "scope-control",
    label: "scope control",
    aliases: [],
    dimension: "subject",
    meaning: "用原始驗收、最小修正、範圍交還與停止條件，防止 review 或推演膨脹成新需求。",
    boundary: "一般 GPT 行為用 gpt；沒有範圍交還或停止線的 review 不算。",
  },
  {
    id: "trial-review",
    label: "trial review",
    aliases: [],
    dimension: "subject",
    meaning: "工具或機制在觀察期結束後，依真實觸發、命中、成本與故障紀錄決定保留、移除、收窄或延長。",
    boundary: "引入前比較用 tool-evaluation，實際採用歷程用 tool-adoption；workflow 只描述編排，沒有到期裁決不算。",
  },
] as const;

test("registry rejects unknown IDs and invalid definitions", () => {
  assert.throws(
    () => canonicalTagRegistry.validateCanonicalId("unknown-tag"),
    /Unknown canonical tag "unknown-tag".*reuse an existing ID or obtain top-level user approval before registering a new tag/i,
  );
  assert.throws(
    () => canonicalTagRegistry.validateCanonicalId("MCP"),
    /Unknown canonical tag "MCP"/,
  );

  assert.throws(
    () => createTagRegistry([validTag, { ...validTag }]),
    /Duplicate tag ID "example"/,
  );

  assert.throws(
    () =>
      createTagRegistry([
        validTag,
        {
          ...validTag,
          id: "other",
          aliases: ["legacy-example"],
        },
      ]),
    /Alias "legacy-example" resolves to both "example" and "other"/,
  );

  const { boundary: _boundary, ...missingBoundary } = validTag;
  assert.throws(
    () => createTagRegistry([missingBoundary]),
    /Tag "example" is missing required field "boundary"/,
  );
});

test("registry resolves aliases and returns display labels", () => {
  const registry = createTagRegistry([validTag]);

  assert.equal(registry.resolveId("legacy-example"), "example");
  assert.equal(registry.getLabel("example"), "Example");
  assert.equal(canonicalTagRegistry.getLabel("mcp"), "MCP");
});

test("approved connector tags expose stable display metadata", () => {
  const entriesById = new Map(
    canonicalTagRegistry.entries.map((entry) => [entry.id, entry]),
  );

  for (const expectedEntry of expectedConnectorEntries) {
    assert.deepEqual(entriesById.get(expectedEntry.id), expectedEntry);
  }
});

test("registry entries cannot drift from lookup state", () => {
  const registry = createTagRegistry([validTag]);
  const entry = registry.entries[0];

  assert.equal(Object.isFrozen(registry), true);
  assert.throws(() => {
    (registry as { entries: readonly unknown[] }).entries = [];
  }, TypeError);
  assert.equal(Object.isFrozen(registry.entries), true);
  assert.equal(Object.isFrozen(entry), true);
  assert.equal(Object.isFrozen(entry.aliases), true);
  assert.throws(() => {
    (entry as { id: string }).id = "renamed";
  }, TypeError);
  assert.equal(registry.validateCanonicalId("example"), "example");
  assert.equal(registry.resolveId("renamed"), undefined);
});

test("registry covers the Ticket 01 canonical corpus", () => {
  const expectedIds = [
    "FFF",
    "Stryker",
    "ai-agent",
    "ai-testing",
    "ai-workflow",
    "auto-memory",
    "automation",
    "bumblebee",
    "claude-code",
    "code-review",
    "code-search",
    "cost-analysis",
    "data-quality",
    "deep-research",
    "evaluation",
    "fabrication",
    "fact-check",
    "gpt",
    "hook",
    "knowledge-management",
    "llm",
    "local-llm",
    "matt-pocock",
    "mcp",
    "memory",
    "methodology",
    "model-behavior",
    "model-routing",
    "multi-model",
    "mutation-testing",
    "philosophy",
    "prompt-caching",
    "proxy",
    "quota",
    "report-vs-reality",
    "retrospective",
    "revealed-preference",
    "review-governance",
    "scope-control",
    "security",
    "skill",
    "spec-review",
    "subagent",
    "supply-chain",
    "test-theater",
    "testing",
    "token-optimization",
    "tool-adoption",
    "tool-evaluation",
    "tooling",
    "trial-review",
    "vector-db",
    "vendor-swap",
    "verify",
    "vscode-extension",
    "websearch",
    "workflow",
    "workflow-resume",
  ];
  const actualIds = canonicalTagRegistry.entries
    .map((entry) => entry.id)
    .sort((left, right) => left.localeCompare(right));

  assert.deepEqual(
    actualIds,
    expectedIds.sort((left, right) => left.localeCompare(right)),
  );
  assert.equal(canonicalTagRegistry.resolveId("Claude Code"), "claude-code");
  assert.equal(canonicalTagRegistry.resolveId("MCP"), "mcp");
  assert.equal(canonicalTagRegistry.resolveId("hooks"), "hook");
  assert.equal(canonicalTagRegistry.resolveId("skills"), "skill");
  assert.equal(canonicalTagRegistry.resolveId("subagents"), "subagent");
  assert.equal(canonicalTagRegistry.resolveId("AI-agents"), "ai-agent");
  assert.equal(canonicalTagRegistry.resolveId("AI-testing"), "ai-testing");
});

test("every article tag is a registered canonical ID", () => {
  assert.equal(blogCorpus.length, 40);
  for (const article of blogCorpus) {
    for (const tag of article.tags) {
      canonicalTagRegistry.validateCanonicalId(tag);
    }
  }
});
