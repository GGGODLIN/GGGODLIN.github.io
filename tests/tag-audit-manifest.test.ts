import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { isDeepStrictEqual } from "node:util";
import { canonicalTagRegistry } from "../src/data/tag-registry.ts";
import {
  createTopicGroups,
  getTopicIds,
  topicGroups,
} from "../src/data/topic-groups.ts";

const expectedFinalTags = {
  "absorb-awesome-list": ["claude-code", "tool-evaluation", "methodology", "workflow"],
  "agent-tool-reach": ["claude-code", "mcp", "code-search", "tool-evaluation", "FFF"],
  "ai-report-two-lies": ["ai-workflow", "data-quality", "methodology"],
  "bumblebee-still-on-disk": ["security", "supply-chain", "vscode-extension", "bumblebee", "tool-adoption"],
  "cc-vendor-swap": ["claude-code", "vendor-swap", "llm"],
  "check-my-stack": ["claude-code", "tool-evaluation", "methodology"],
  "checker-layoff": ["claude-code", "hook", "llm", "evaluation"],
  "code-search-adoption": ["claude-code", "mcp", "code-search", "tool-adoption"],
  "dcg-safety-lock": ["claude-code", "hook", "security", "tooling", "tool-adoption"],
  "deep-research-rate-limit": ["claude-code", "workflow", "deep-research"],
  "exit-0-illusion": ["claude-code", "subagent", "fabrication", "verify"],
  "gpt-in-cc-performance": ["claude-code", "vendor-swap", "gpt", "llm", "model-behavior"],
  "gpt-in-cc": ["claude-code", "vendor-swap", "gpt", "llm"],
  "gpt-review-tunnel-vision": ["claude-code", "gpt", "code-review", "methodology"],
  "hook-watchdog": ["claude-code", "hook", "automation", "methodology", "verify"],
  "inline-the-rules": ["claude-code", "memory", "hook", "methodology"],
  "keep-the-wiki-alive": ["claude-code", "memory", "knowledge-management", "retrospective"],
  "local-llm-hook-judge": ["claude-code", "local-llm", "hook", "llm"],
  "matt-philosophy": ["claude-code", "skill", "matt-pocock", "philosophy"],
  "measure-revealed-adoption": ["claude-code", "tool-adoption", "subagent", "methodology", "revealed-preference"],
  "memory-cap-reframe": ["claude-code", "memory", "auto-memory"],
  "model-routing": ["claude-code", "model-routing", "quota", "methodology"],
  "one-model-not-enough": ["claude-code", "code-review", "multi-model", "workflow"],
  "prose-exams": ["claude-code", "testing", "workflow", "methodology", "skill", "hook"],
  "protocol-model-dependency": ["claude-code", "hook", "model-behavior"],
  "proxy-warmup-cost": ["claude-code", "token-optimization", "prompt-caching", "proxy", "cost-analysis"],
  "retire-vector-memory": ["claude-code", "memory", "vector-db", "retrospective", "tool-adoption"],
  "rule-ladder": ["claude-code", "hook", "ai-agent", "automation", "methodology"],
  "sem-blast-radius": ["claude-code", "hook", "code-review", "tooling", "tool-adoption"],
  "sol-overimplementation": ["claude-code", "gpt", "methodology"],
  "spec-review-round": ["claude-code", "spec-review", "ai-workflow", "methodology"],
  "steal-determinism-layer": ["claude-code", "tool-adoption", "code-review", "methodology"],
  "subagent-boot-cost": ["claude-code", "subagent", "token-optimization", "model-routing", "ai-agent"],
  "test-theater": ["mutation-testing", "Stryker", "ai-testing", "test-theater"],
  "token-saving-tools": ["claude-code", "token-optimization", "mcp", "tool-evaluation", "tool-adoption"],
  "trial-review-system": ["claude-code", "methodology", "tool-adoption", "workflow"],
  "unattended-workflow-resume": ["claude-code", "workflow", "workflow-resume"],
  "vendor-benefit": ["claude-code", "vendor-swap", "llm"],
  "websearch-misses-official-docs": ["claude-code", "websearch", "fact-check", "retrospective"],
  "workflow-vs-skill": ["claude-code", "workflow", "skill"],
} as const;

const approvedBeforeTags = {
  "absorb-awesome-list": ["claude-code", "tooling", "methodology", "workflow"],
  "agent-tool-reach": ["Claude Code", "MCP", "code-search", "tool-adoption", "FFF"],
  "bumblebee-still-on-disk": ["security", "supply-chain", "vscode-extension", "bumblebee"],
  "code-search-adoption": ["claude-code", "mcp", "code-search"],
  "dcg-safety-lock": ["claude-code", "hook", "security", "tooling"],
  "hook-watchdog": ["claude-code", "hook", "automation", "methodology"],
  "matt-philosophy": ["claude-code", "skills", "matt-pocock", "philosophy"],
  "measure-revealed-adoption": ["Claude Code", "tool-adoption", "subagent", "methodology", "revealed-preference"],
  "one-model-not-enough": ["Claude Code", "code-review", "multi-model", "workflow"],
  "prose-exams": ["claude-code", "testing", "workflow", "methodology"],
  "protocol-model-dependency": ["Claude Code", "hook", "model", "llm-behavior"],
  "retire-vector-memory": ["claude-code", "memory", "vector-db", "retrospective"],
  "rule-ladder": ["claude-code", "hooks", "workflow", "AI-agents", "automation"],
  "sem-blast-radius": ["claude-code", "hook", "code-review", "tooling"],
  "steal-determinism-layer": ["Claude Code", "tool-adoption", "code-review", "methodology"],
  "subagent-boot-cost": ["claude-code", "subagents", "token-optimization", "model-routing", "AI-agents"],
  "test-theater": ["mutation-testing", "Stryker", "AI-testing", "test-theater", "Claude Code"],
  "token-saving-tools": ["claude-code", "token", "mcp"],
  "unattended-workflow-resume": ["claude-code", "workflow", "resume"],
} as const;

const expectedChangedArticles = [
  "absorb-awesome-list",
  "agent-tool-reach",
  "bumblebee-still-on-disk",
  "code-search-adoption",
  "dcg-safety-lock",
  "hook-watchdog",
  "matt-philosophy",
  "measure-revealed-adoption",
  "one-model-not-enough",
  "prose-exams",
  "protocol-model-dependency",
  "retire-vector-memory",
  "rule-ladder",
  "sem-blast-radius",
  "steal-determinism-layer",
  "subagent-boot-cost",
  "test-theater",
  "token-saving-tools",
  "unattended-workflow-resume",
] as const;

const expectedTopicGroups = [
  {
    id: "workflow",
    label: "工作流",
    tags: ["workflow", "ai-workflow", "ai-agent", "subagent", "workflow-resume", "deep-research"],
  },
  {
    id: "models",
    label: "模型",
    tags: ["llm", "gpt", "model-routing", "model-behavior", "vendor-swap", "local-llm", "multi-model", "quota"],
  },
  {
    id: "tools",
    label: "工具",
    tags: ["tool-adoption", "tool-evaluation", "tooling", "mcp", "code-search", "skill", "FFF", "prompt-caching", "proxy"],
  },
  {
    id: "memory",
    label: "記憶",
    tags: ["memory", "auto-memory", "knowledge-management", "vector-db"],
  },
  {
    id: "quality",
    label: "品質與驗證",
    tags: ["code-review", "testing", "mutation-testing", "ai-testing", "test-theater", "evaluation", "spec-review", "verify", "data-quality", "fact-check", "fabrication"],
  },
  {
    id: "automation",
    label: "Hook",
    tags: ["hook", "automation"],
  },
] as const;

const expectedTopicMemberships = {
  "absorb-awesome-list": ["workflow", "tools"],
  "agent-tool-reach": ["tools"],
  "ai-report-two-lies": ["workflow", "quality"],
  "bumblebee-still-on-disk": ["tools"],
  "cc-vendor-swap": ["models"],
  "check-my-stack": ["tools"],
  "checker-layoff": ["models", "quality", "automation"],
  "code-search-adoption": ["tools"],
  "dcg-safety-lock": ["tools", "automation"],
  "deep-research-rate-limit": ["workflow"],
  "exit-0-illusion": ["workflow", "quality"],
  "gpt-in-cc-performance": ["models"],
  "gpt-in-cc": ["models"],
  "gpt-review-tunnel-vision": ["models", "quality"],
  "hook-watchdog": ["quality", "automation"],
  "inline-the-rules": ["memory", "automation"],
  "keep-the-wiki-alive": ["memory"],
  "local-llm-hook-judge": ["models", "automation"],
  "matt-philosophy": ["tools"],
  "measure-revealed-adoption": ["workflow", "tools"],
  "memory-cap-reframe": ["memory"],
  "model-routing": ["models"],
  "one-model-not-enough": ["workflow", "models", "quality"],
  "prose-exams": ["workflow", "tools", "quality", "automation"],
  "protocol-model-dependency": ["models", "automation"],
  "proxy-warmup-cost": ["tools"],
  "retire-vector-memory": ["tools", "memory"],
  "rule-ladder": ["workflow", "automation"],
  "sem-blast-radius": ["tools", "quality", "automation"],
  "sol-overimplementation": ["models"],
  "spec-review-round": ["workflow", "quality"],
  "steal-determinism-layer": ["tools", "quality"],
  "subagent-boot-cost": ["workflow", "models"],
  "test-theater": ["quality"],
  "token-saving-tools": ["tools"],
  "trial-review-system": ["workflow", "tools"],
  "unattended-workflow-resume": ["workflow"],
  "vendor-benefit": ["models"],
  "websearch-misses-official-docs": ["quality"],
  "workflow-vs-skill": ["workflow", "tools"],
} as const;

function readTags(source: string, fileName: string): string[] {
  const serializedTags = source.match(/^tags:\s*(\[.*\])$/m)?.[1];
  assert.ok(serializedTags, `Missing tags frontmatter in ${fileName}`);
  return JSON.parse(serializedTags) as string[];
}

function readCurrentArticleTags(slug: string): string[] {
  return readTags(
    readFileSync(new URL(`../src/content/blog/${slug}.md`, import.meta.url), "utf8"),
    `${slug}.md`,
  );
}

test("approved audit manifest defines 40 final articles and the 19-article change set", () => {
  const articleSlugs = readdirSync(new URL("../src/content/blog", import.meta.url))
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""))
    .sort((left, right) => left.localeCompare(right));
  const expectedSlugs = Object.keys(expectedFinalTags).sort((left, right) => left.localeCompare(right));

  assert.equal(articleSlugs.length, 40);
  assert.deepEqual(articleSlugs, expectedSlugs);

  for (const slug of articleSlugs) {
    const expectedTags = expectedFinalTags[slug as keyof typeof expectedFinalTags];
    assert.deepEqual(readCurrentArticleTags(slug), expectedTags, slug);
  }

  const changedArticles = Object.entries(approvedBeforeTags)
    .filter(([slug, beforeTags]) => !isDeepStrictEqual(
      beforeTags,
      expectedFinalTags[slug as keyof typeof expectedFinalTags],
    ))
    .map(([slug]) => slug)
    .sort((left, right) => left.localeCompare(right));

  assert.equal(Object.keys(approvedBeforeTags).length, 19);
  assert.deepEqual(changedArticles, [...expectedChangedArticles]);
});

test("approved audit manifest fixes registry IDs and aliases without a migration layer", () => {
  const registryIds = new Set(canonicalTagRegistry.entries.map((entry) => entry.id));

  for (const obsoleteId of ["llm-behavior", "model", "resume", "token"]) {
    assert.equal(registryIds.has(obsoleteId), false, obsoleteId);
  }
  assert.equal(canonicalTagRegistry.resolveId("llm-behavior"), "model-behavior");
  assert.equal(canonicalTagRegistry.resolveId("model"), "model-behavior");
  assert.equal(canonicalTagRegistry.resolveId("resume"), "workflow-resume");
  assert.equal(canonicalTagRegistry.resolveId("token"), "token-optimization");
  assert.equal(registryIds.has("security"), true);
  assert.equal(registryIds.has("supply-chain"), true);
  assert.equal(registryIds.has("token-optimization"), true);
});

test("six broad topics match the approved labels, memberships, counts, and 40-article coverage", () => {
  assert.deepEqual(topicGroups, expectedTopicGroups);
  assert.throws(
    () => createTopicGroups([{ id: "invalid", label: "Invalid", tags: ["unknown-tag"] }]),
    /Unknown canonical tag "unknown-tag"/,
  );

  const topicCounts = Object.fromEntries(topicGroups.map((group) => [group.id, 0]));
  let coveredArticles = 0;

  for (const [slug, expectedMembership] of Object.entries(expectedTopicMemberships)) {
    const actualMembership = getTopicIds(readCurrentArticleTags(slug), topicGroups);
    assert.deepEqual(actualMembership, expectedMembership, slug);
    if (actualMembership.length > 0) coveredArticles += 1;
    for (const topicId of actualMembership) {
      topicCounts[topicId] = (topicCounts[topicId] ?? 0) + 1;
    }
  }

  assert.deepEqual(topicCounts, {
    workflow: 13,
    models: 12,
    tools: 16,
    memory: 4,
    quality: 12,
    automation: 9,
  });
  assert.equal(coveredArticles, 40);
});
