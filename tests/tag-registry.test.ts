import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import {
  canonicalTagRegistry,
  createTagRegistry,
} from "../src/data/tag-registry.ts";

const validTag = {
  id: "example",
  label: "Example",
  aliases: ["legacy-example"],
  dimension: "subject",
  meaning: "A reusable example subject.",
  boundary: "Not every article with an example.",
} as const;

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
    "retrospective",
    "revealed-preference",
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

function readArticleTags(fileName: string): string[] {
  const source = readFileSync(
    new URL(`../src/content/blog/${fileName}`, import.meta.url),
    "utf8",
  );
  const serializedTags = source.match(/^tags:\s*(\[.*\])$/m)?.[1];
  assert.ok(serializedTags, `Missing tags frontmatter in ${fileName}`);
  return JSON.parse(serializedTags) as string[];
}

test("every article tag is a registered canonical ID", () => {
  const articleNames = readdirSync(
    new URL("../src/content/blog", import.meta.url),
  ).filter((fileName) => fileName.endsWith(".md"));

  assert.equal(articleNames.length, 40);
  for (const articleName of articleNames) {
    for (const tag of readArticleTags(articleName)) {
      canonicalTagRegistry.validateCanonicalId(tag);
    }
  }
});
