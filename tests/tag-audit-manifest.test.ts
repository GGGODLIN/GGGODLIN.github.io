import assert from "node:assert/strict";
import test from "node:test";
import { canonicalTagRegistry } from "../src/data/tag-registry.ts";
import {
  createTopicGroups,
  getTopicIds,
  topicGroups,
} from "../src/data/topic-groups.ts";
import { readBlogCorpus } from "./support/blog-corpus.ts";

const blogCorpus = readBlogCorpus(
  new URL("../src/content/blog", import.meta.url),
);
const articleTagsBySlug = new Map(
  blogCorpus.map((article) => [article.slug, article.tags]),
);

const expectedPreConnectorTags = {
  "absorb-awesome-list": ["claude-code", "tool-evaluation", "methodology", "workflow"],
  "agent-tool-reach": ["claude-code", "mcp", "code-search", "tool-evaluation", "FFF"],
  "ai-report-two-lies": ["ai-workflow", "data-quality", "methodology"],
  "bumblebee-still-on-disk": ["security", "supply-chain", "vscode-extension", "bumblebee", "tool-adoption"],
  "cc-vendor-swap": ["claude-code", "vendor-swap", "llm"],
  "check-my-stack": ["claude-code", "tool-evaluation", "methodology"],
  "checker-layoff": ["claude-code", "hook", "llm", "evaluation"],
  "compact-guard": ["gpt", "hook", "memory", "verify", "trial-review"],
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

const approvedConnectorAdditions = {
  "absorb-awesome-list": ["trial-review"],
  "bumblebee-still-on-disk": ["trial-review"],
  "checker-layoff": ["verify", "trial-review"],
  "dcg-safety-lock": ["trial-review"],
  "exit-0-illusion": ["report-vs-reality"],
  "gpt-review-tunnel-vision": ["scope-control"],
  "local-llm-hook-judge": ["verify", "trial-review"],
  "model-routing": ["automation", "review-governance"],
  "one-model-not-enough": ["review-governance"],
  "prose-exams": ["trial-review"],
  "protocol-model-dependency": ["report-vs-reality"],
  "sem-blast-radius": ["review-governance", "trial-review"],
  "sol-overimplementation": ["scope-control"],
  "spec-review-round": ["review-governance"],
  "steal-determinism-layer": ["automation"],
  "test-theater": ["automation"],
  "trial-review-system": ["trial-review"],
  "unattended-workflow-resume": ["deep-research"],
  "websearch-misses-official-docs": ["report-vs-reality"],
  "workflow-vs-skill": ["deep-research"],
} as const satisfies Partial<Record<keyof typeof expectedPreConnectorTags, readonly string[]>>;

const expectedFinalTags: Record<string, readonly string[]> = Object.fromEntries(
  Object.entries(expectedPreConnectorTags).map(([slug, tags]) => [
    slug,
    [
      ...tags,
      ...(approvedConnectorAdditions[slug as keyof typeof approvedConnectorAdditions] ?? []),
    ],
  ]),
);

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
  "compact-guard": ["models", "memory", "quality", "automation"],
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
  "local-llm-hook-judge": ["models", "quality", "automation"],
  "matt-philosophy": ["tools"],
  "measure-revealed-adoption": ["workflow", "tools"],
  "memory-cap-reframe": ["memory"],
  "model-routing": ["models", "automation"],
  "one-model-not-enough": ["workflow", "models", "quality"],
  "prose-exams": ["workflow", "tools", "quality", "automation"],
  "protocol-model-dependency": ["models", "automation"],
  "proxy-warmup-cost": ["tools"],
  "retire-vector-memory": ["tools", "memory"],
  "rule-ladder": ["workflow", "automation"],
  "sem-blast-radius": ["tools", "quality", "automation"],
  "sol-overimplementation": ["models"],
  "spec-review-round": ["workflow", "quality"],
  "steal-determinism-layer": ["tools", "quality", "automation"],
  "subagent-boot-cost": ["workflow", "models"],
  "test-theater": ["quality", "automation"],
  "token-saving-tools": ["tools"],
  "trial-review-system": ["workflow", "tools"],
  "unattended-workflow-resume": ["workflow"],
  "vendor-benefit": ["models"],
  "websearch-misses-official-docs": ["quality"],
  "workflow-vs-skill": ["workflow", "tools"],
} as const;

function readCurrentArticleTags(slug: string): readonly string[] {
  const tags = articleTagsBySlug.get(slug);
  assert.ok(tags, `Missing article in recursive blog corpus: ${slug}`);
  return tags;
}

test("approved connector manifest defines the 41-article final corpus", () => {
  const articleSlugs = blogCorpus.map((article) => article.slug);
  const expectedSlugs = Object.keys(expectedFinalTags).sort((left, right) => left.localeCompare(right));
  const affectedArticles = Object.keys(approvedConnectorAdditions)
    .sort((left, right) => left.localeCompare(right));
  const assignmentCount = Object.values(expectedFinalTags)
    .reduce((total, tags) => total + tags.length, 0);
  const approvedAdditionCount = Object.values(approvedConnectorAdditions)
    .reduce((total, tags) => total + tags.length, 0);
  const usedTags = new Set<string>(Object.values(expectedFinalTags).flat());
  const registryIds = new Set(canonicalTagRegistry.entries.map((entry) => entry.id));

  assert.equal(articleSlugs.length, 41);
  assert.deepEqual(articleSlugs, expectedSlugs);
  assert.equal(assignmentCount, 193);
  assert.equal(approvedAdditionCount, 24);
  assert.equal(affectedArticles.length, 20);
  assert.equal(registryIds.size, 58);
  assert.equal(usedTags.size, 58);
  assert.deepEqual([...usedTags].filter((tag) => !registryIds.has(tag)), []);
  assert.deepEqual([...registryIds].filter((tag) => !usedTags.has(tag)), []);

  for (const slug of articleSlugs) {
    const expectedTags = expectedFinalTags[slug as keyof typeof expectedFinalTags];
    assert.deepEqual(readCurrentArticleTags(slug), expectedTags, slug);
  }
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

test("six broad topics match the approved labels, memberships, counts, and 41-article coverage", () => {
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
    models: 13,
    tools: 16,
    memory: 5,
    quality: 14,
    automation: 13,
  });
  assert.equal(coveredArticles, 41);
});
