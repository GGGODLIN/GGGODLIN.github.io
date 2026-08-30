export const approvedExpectedSeries = [
  {
    id: "S01",
    members: [
      "absorb-awesome-list",
      "agent-tool-reach",
      "check-my-stack",
      "code-search-adoption",
      "measure-revealed-adoption",
      "retire-vector-memory",
      "steal-determinism-layer",
      "token-saving-tools",
      "trial-review-system",
    ],
    validConnectors: ["tool-evaluation", "tool-adoption", "code-search"],
  },
  {
    id: "S02",
    members: [
      "agent-tool-reach",
      "code-search-adoption",
      "measure-revealed-adoption",
    ],
    validConnectors: ["code-search", "tool-adoption"],
  },
  {
    id: "S03",
    members: [
      "keep-the-wiki-alive",
      "memory-cap-reframe",
      "retire-vector-memory",
    ],
    validConnectors: ["memory"],
  },
  {
    id: "S04",
    members: [
      "deep-research-rate-limit",
      "unattended-workflow-resume",
      "workflow-vs-skill",
    ],
    validConnectors: ["deep-research"],
  },
  {
    id: "S05",
    members: [
      "cc-vendor-swap",
      "gpt-in-cc",
      "gpt-in-cc-performance",
      "vendor-benefit",
    ],
    validConnectors: ["vendor-swap"],
  },
  {
    id: "S06",
    members: [
      "gpt-in-cc-performance",
      "gpt-review-tunnel-vision",
      "sol-overimplementation",
    ],
    validConnectors: ["gpt"],
  },
  {
    id: "S07",
    members: [
      "exit-0-illusion",
      "protocol-model-dependency",
      "websearch-misses-official-docs",
    ],
    validConnectors: ["report-vs-reality"],
  },
  {
    id: "S08",
    members: [
      "checker-layoff",
      "exit-0-illusion",
      "hook-watchdog",
      "local-llm-hook-judge",
    ],
    validConnectors: ["verify"],
  },
  {
    id: "S09",
    members: [
      "checker-layoff",
      "dcg-safety-lock",
      "hook-watchdog",
      "inline-the-rules",
      "model-routing",
      "prose-exams",
      "protocol-model-dependency",
      "rule-ladder",
      "steal-determinism-layer",
      "test-theater",
    ],
    validConnectors: ["hook", "automation"],
  },
  {
    id: "S10",
    members: [
      "model-routing",
      "one-model-not-enough",
      "sem-blast-radius",
      "spec-review-round",
    ],
    validConnectors: ["code-review", "review-governance"],
  },
  {
    id: "S11",
    members: [
      "gpt-review-tunnel-vision",
      "sol-overimplementation",
    ],
    validConnectors: ["scope-control"],
  },
  {
    id: "S12",
    members: [
      "model-routing",
      "proxy-warmup-cost",
      "subagent-boot-cost",
      "token-saving-tools",
    ],
    validConnectors: ["token-optimization", "model-routing"],
  },
  {
    id: "S13",
    members: [
      "absorb-awesome-list",
      "bumblebee-still-on-disk",
      "checker-layoff",
      "dcg-safety-lock",
      "local-llm-hook-judge",
      "prose-exams",
      "sem-blast-radius",
      "trial-review-system",
    ],
    validConnectors: ["tool-adoption", "trial-review"],
  },
] as const;
