import { canonicalTagRegistry } from "./tag-registry.ts";

export interface TopicGroup {
  readonly id: string;
  readonly label: string;
  readonly tags: readonly string[];
}

export function createTopicGroups(values: readonly TopicGroup[]): readonly TopicGroup[] {
  return Object.freeze(values.map((group) => {
    for (const tag of group.tags) {
      canonicalTagRegistry.validateCanonicalId(tag);
    }

    return Object.freeze({
      ...group,
      tags: Object.freeze([...group.tags]),
    });
  }));
}

export const topicGroups = createTopicGroups([
  {
    id: "workflow",
    label: "工作流",
    tags: [
      "workflow",
      "ai-workflow",
      "ai-agent",
      "subagent",
      "workflow-resume",
      "deep-research",
    ],
  },
  {
    id: "models",
    label: "模型",
    tags: [
      "llm",
      "gpt",
      "model-routing",
      "model-behavior",
      "vendor-swap",
      "local-llm",
      "multi-model",
      "quota",
    ],
  },
  {
    id: "tools",
    label: "工具",
    tags: [
      "tool-adoption",
      "tool-evaluation",
      "tooling",
      "mcp",
      "code-search",
      "skill",
      "FFF",
      "prompt-caching",
      "proxy",
    ],
  },
  {
    id: "memory",
    label: "記憶",
    tags: ["memory", "auto-memory", "knowledge-management", "vector-db"],
  },
  {
    id: "quality",
    label: "品質與驗證",
    tags: [
      "code-review",
      "testing",
      "mutation-testing",
      "ai-testing",
      "test-theater",
      "evaluation",
      "spec-review",
      "verify",
      "data-quality",
      "fact-check",
      "fabrication",
    ],
  },
  {
    id: "automation",
    label: "Hook",
    tags: ["hook", "automation"],
  },
]);

export function getTopicIds(
  tags: readonly string[],
  groups: readonly TopicGroup[] = topicGroups,
): string[] {
  const tagIds = new Set(tags);
  return groups
    .filter((group) => group.tags.some((tag) => tagIds.has(tag)))
    .map((group) => group.id);
}
