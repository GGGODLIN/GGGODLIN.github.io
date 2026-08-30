export interface ExpectedSeriesDefinition {
  readonly id: string;
  readonly title: string;
  readonly minimumCommonConcept: string;
  readonly members: readonly string[];
  readonly validConnectors: readonly string[];
}

export interface SeriesConnectivityEdge {
  readonly source: string;
  readonly target: string;
  readonly connectors: readonly string[];
}

export interface SeriesConnectivityResult extends ExpectedSeriesDefinition {
  readonly connected: boolean;
  readonly components: readonly (readonly string[])[];
  readonly edges: readonly SeriesConnectivityEdge[];
}

export const forbiddenSeriesConnectorTags = [
  "claude-code",
  "methodology",
] as const;

export const expectedSeries: readonly ExpectedSeriesDefinition[] = [
  {
    id: "S01",
    title: "工具不是看起來厲害就裝，要看它在你的環境剩多少價值",
    minimumCommonConcept: "工具價值必須相對既有工作方式、真實採用與退出結果計算；不能只看 README、星數或口頭意願。",
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
    title: "codebase 搜尋工具的真正門檻，是 agent 會不會走那條路",
    minimumCommonConcept: "搜尋品質只是前提；還要量 agent 是否主動選用，以及工具能介入實際搜尋路徑的比例。",
    members: [
      "agent-tool-reach",
      "code-search-adoption",
      "measure-revealed-adoption",
    ],
    validConnectors: ["code-search", "tool-adoption"],
  },
  {
    id: "S03",
    title: "個人 memory 從向量倉庫，改成能維護的索引與 wiki",
    minimumCommonConcept: "原始對話大量自動寫入沒有用，整理後的結論、分層索引與持續健康檢查才構成可用 memory。",
    members: [
      "keep-the-wiki-alive",
      "memory-cap-reframe",
      "retire-vector-memory",
    ],
    validConnectors: ["memory"],
  },
  {
    id: "S04",
    title: "固定 workflow 要先存下來，再處理限流與中斷續跑",
    minimumCommonConcept: "同一支 deep-research workflow 從編排可復用一路遇到 burst 限流與 resume 快取前提，三篇是同一執行鏈的連續工程問題。",
    members: [
      "deep-research-rate-limit",
      "unattended-workflow-resume",
      "workflow-vs-skill",
    ],
    validConnectors: ["deep-research"],
  },
  {
    id: "S05",
    title: "把其他模型接進 Claude Code，代價、回報與性格都會跟著換",
    minimumCommonConcept: "模型供應商替換不是只改 endpoint；協議、生態、額度、fallback、規則遵循與 context 行為都要重新驗。",
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
    title: "GPT 很會深挖，但要替它畫出範圍與停止線",
    minimumCommonConcept: "同一種服從與深挖能力，在規則清楚時有利；缺少成本、範圍與停止條件時，會把推演風險變成額外需求或程式碼。",
    members: [
      "gpt-in-cc-performance",
      "gpt-review-tunnel-vision",
      "sol-overimplementation",
    ],
    validConnectors: ["gpt"],
  },
  {
    id: "S07",
    title: "AI 說成功或沒出聲，都不能直接當成現實",
    minimumCommonConcept: "報告層訊號必須回到外部可觀察結果；成功可能是假成功，沒有回報也可能只是不報。",
    members: [
      "exit-0-illusion",
      "protocol-model-dependency",
      "websearch-misses-official-docs",
    ],
    validConnectors: ["report-vs-reality"],
  },
  {
    id: "S08",
    title: "完成宣告監工：程式先篩，模型只判剩下的語意",
    minimumCommonConcept: "對 AI 說做完的治理，先由程式拿結構化證據縮小案件，再讓模型只處理規則無法判斷的殘餘，最後用真實誤報與命中紀錄決定去留。",
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
    title: "規矩要用多硬，還要放在看得到證據的位置",
    minimumCommonConcept: "先把可列舉證據交給程式；是否升成 hook、硬攔截或人工放行，取決於復發、誤攔成本與攔截位置，不是焦慮程度。",
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
    title: "review 要靠不同視角找，也要靠證據與影響面驗",
    minimumCommonConcept: "review 不只要增加視角；還要讓發現接受獨立複查、讓人保留否決權，並在審查前補上 diff 本身看不到的影響面。",
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
    title: "review 需要停止線，不能把每條疑慮都做成新需求",
    minimumCommonConcept: "review finding 與推演風險不是自動的實作需求；原始驗收、最小修正、範圍交還與具名不修理由共同構成停止條件。",
    members: [
      "gpt-review-tunnel-vision",
      "sol-overimplementation",
    ],
    validConnectors: ["scope-control"],
  },
  {
    id: "S12",
    title: "真正的 AI 成本，要把固定開機費、快取、配額與單價一起算",
    minimumCommonConcept: "不能只看總 token 或工具自報省幅；固定啟動成本、prompt cache、proxy 路徑、模型單價與配額權重會改變最後是否划算。",
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
    title: "新工具要有觀察期，到期看真實行為決定留、砍或延後",
    minimumCommonConcept: "新工具或機制要有觀察窗；到期以真實觸發、命中、誤報、人的介入與故障紀錄，決定保留、移除、收窄或延長。",
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
];

export const intentionalIslandSlugs = [
  "ai-report-two-lies",
  "matt-philosophy",
] as const;

function getComponents(
  members: readonly string[],
  edges: readonly SeriesConnectivityEdge[],
): readonly (readonly string[])[] {
  const neighbors = new Map(members.map((member) => [member, new Set<string>()]));

  for (const edge of edges) {
    neighbors.get(edge.source)?.add(edge.target);
    neighbors.get(edge.target)?.add(edge.source);
  }

  const remaining = new Set(members);
  const components: string[][] = [];

  while (remaining.size > 0) {
    const start = [...remaining].sort((left, right) => left.localeCompare(right))[0];
    const queue = [start];
    const component: string[] = [];
    remaining.delete(start);

    while (queue.length > 0) {
      const member = queue.shift();
      if (member === undefined) continue;
      component.push(member);
      const nextMembers = [...(neighbors.get(member) ?? [])]
        .filter((neighbor) => remaining.has(neighbor))
        .sort((left, right) => left.localeCompare(right));
      for (const neighbor of nextMembers) {
        remaining.delete(neighbor);
        queue.push(neighbor);
      }
    }

    components.push(component.sort((left, right) => left.localeCompare(right)));
  }

  return components;
}

export function validateSeriesConnectors(
  definitions: readonly ExpectedSeriesDefinition[],
  validateConnector: (connector: string) => unknown,
): void {
  const forbiddenConnectors = new Set<string>(forbiddenSeriesConnectorTags);
  for (const definition of definitions) {
    for (const connector of definition.validConnectors) {
      if (forbiddenConnectors.has(connector)) {
        throw new Error(`Forbidden series connector "${connector}" in ${definition.id}`);
      }
      validateConnector(connector);
    }
  }
}

export function analyzeSeriesConnectivity(
  definitions: readonly ExpectedSeriesDefinition[],
  tagsBySlug: ReadonlyMap<string, readonly string[]>,
): readonly SeriesConnectivityResult[] {
  return definitions.map((definition) => {
    const missingMembers = definition.members.filter((member) => !tagsBySlug.has(member));
    if (missingMembers.length > 0) {
      throw new Error(`${definition.id} is missing corpus members: ${missingMembers.join(", ")}`);
    }

    const edges: SeriesConnectivityEdge[] = [];
    for (let sourceIndex = 0; sourceIndex < definition.members.length; sourceIndex += 1) {
      for (let targetIndex = sourceIndex + 1; targetIndex < definition.members.length; targetIndex += 1) {
        const source = definition.members[sourceIndex];
        const target = definition.members[targetIndex];
        const sourceTags = new Set(tagsBySlug.get(source) ?? []);
        const targetTags = new Set(tagsBySlug.get(target) ?? []);
        const connectors = definition.validConnectors
          .filter((connector) => sourceTags.has(connector) && targetTags.has(connector))
          .sort((left, right) => left.localeCompare(right));

        if (connectors.length > 0) {
          edges.push({ source, target, connectors });
        }
      }
    }

    const components = getComponents(definition.members, edges);
    return {
      ...definition,
      connected: components.length === 1,
      components,
      edges,
    };
  });
}

export function formatConnectivityFailures(
  results: readonly SeriesConnectivityResult[],
): string {
  return results
    .filter((result) => !result.connected)
    .map((result) => {
      const components = result.components
        .map((component) => `[${component.join(", ")}]`)
        .join(" | ");
      return `${result.id} disconnected: components=${components}; allowlist=[${result.validConnectors.join(", ")}]`;
    })
    .join("\n");
}
