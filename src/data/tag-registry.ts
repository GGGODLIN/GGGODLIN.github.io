export type TagDimension = "subject" | "article-angle" | "proper-name";

export interface TagDefinition {
  readonly id: string;
  readonly label: string;
  readonly aliases: readonly string[];
  readonly dimension: TagDimension;
  readonly meaning: string;
  readonly boundary: string;
}

export interface TagRegistry {
  readonly entries: readonly TagDefinition[];
  readonly resolveId: (value: string) => string | undefined;
  readonly getLabel: (id: string) => string;
  readonly validateCanonicalId: (id: string) => string;
}

const requiredFields = [
  "id",
  "label",
  "aliases",
  "dimension",
  "meaning",
  "boundary",
] as const;

const dimensions = new Set<TagDimension>([
  "subject",
  "article-angle",
  "proper-name",
]);

function readTagDefinition(value: unknown, index: number): TagDefinition {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Tag at index ${index} must be an object`);
  }

  const candidate = value as Record<string, unknown>;
  const fallbackId = typeof candidate.id === "string" ? candidate.id : `index ${index}`;

  for (const field of requiredFields) {
    if (!(field in candidate)) {
      throw new Error(`Tag "${fallbackId}" is missing required field "${field}"`);
    }
  }

  for (const field of ["id", "label", "meaning", "boundary"] as const) {
    if (typeof candidate[field] !== "string" || candidate[field].trim() === "") {
      throw new Error(`Tag "${fallbackId}" has invalid field "${field}"`);
    }
  }

  if (!Array.isArray(candidate.aliases) || candidate.aliases.some(
    (alias) => typeof alias !== "string" || alias.trim() === "",
  )) {
    throw new Error(`Tag "${fallbackId}" has invalid field "aliases"`);
  }

  if (!dimensions.has(candidate.dimension as TagDimension)) {
    throw new Error(`Tag "${fallbackId}" has invalid field "dimension"`);
  }

  return Object.freeze({
    id: candidate.id as string,
    label: candidate.label as string,
    aliases: Object.freeze([...(candidate.aliases as string[])]),
    dimension: candidate.dimension as TagDimension,
    meaning: candidate.meaning as string,
    boundary: candidate.boundary as string,
  });
}

export function createTagRegistry(values: readonly unknown[]): TagRegistry {
  const entries = Object.freeze(values.map(readTagDefinition));
  const ids = new Map<string, TagDefinition>();
  const aliases = new Map<string, string>();

  for (const entry of entries) {
    if (ids.has(entry.id)) {
      throw new Error(`Duplicate tag ID "${entry.id}"`);
    }
    if (aliases.has(entry.id)) {
      throw new Error(`Tag ID "${entry.id}" conflicts with alias for "${aliases.get(entry.id)}"`);
    }
    ids.set(entry.id, entry);

    for (const alias of entry.aliases) {
      const existingId = aliases.get(alias);
      if (existingId && existingId !== entry.id) {
        throw new Error(`Alias "${alias}" resolves to both "${existingId}" and "${entry.id}"`);
      }
      if (ids.has(alias) && alias !== entry.id) {
        throw new Error(`Alias "${alias}" conflicts with tag ID "${alias}"`);
      }
      aliases.set(alias, entry.id);
    }
  }

  const resolveId = (value: string): string | undefined => {
    if (ids.has(value)) return value;
    return aliases.get(value);
  };

  const validateCanonicalId = (id: string): string => {
    if (!ids.has(id)) {
      throw new Error(
        `Unknown canonical tag "${id}". Reuse an existing ID or register a new tag in the canonical tag registry.`,
      );
    }
    return id;
  };

  const getLabel = (id: string): string => {
    validateCanonicalId(id);
    return ids.get(id)?.label ?? id;
  };

  return Object.freeze({
    entries,
    resolveId,
    getLabel,
    validateCanonicalId,
  });
}

export const canonicalTagRegistry = createTagRegistry([
  {
    id: "FFF",
    label: "FFF",
    aliases: [],
    dimension: "proper-name",
    meaning: "FFF 工具本身與其能力邊界。",
    boundary: "code search 與 MCP 另用各自主題 tag。",
  },
  {
    id: "Stryker",
    label: "Stryker",
    aliases: [],
    dimension: "proper-name",
    meaning: "Stryker mutation testing 工具。",
    boundary: "mutation testing 方法另用主題 tag。",
  },
  {
    id: "ai-agent",
    label: "AI agent",
    aliases: ["AI-agents"],
    dimension: "subject",
    meaning: "agent 層級的架構、治理與能力預算。",
    boundary: "不因文章由 agent 執行就加入；委派子 agent 優先用 subagent。",
  },
  {
    id: "ai-testing",
    label: "AI testing",
    aliases: ["AI-testing"],
    dimension: "subject",
    meaning: "AI 產生或維護測試時的可靠性。",
    boundary: "不等於一般 testing 或 mutation testing。",
  },
  {
    id: "ai-workflow",
    label: "AI workflow",
    aliases: [],
    dimension: "subject",
    meaning: "AI 直接參與資料、敘事或決策的流程。",
    boundary: "不與所有 workflow 合併。",
  },
  {
    id: "auto-memory",
    label: "auto memory",
    aliases: [],
    dimension: "subject",
    meaning: "Claude Code auto memory 的容量、載入與目錄化。",
    boundary: "一般手寫記憶不算。",
  },
  {
    id: "automation",
    label: "automation",
    aliases: [],
    dimension: "subject",
    meaning: "自動觸發、檢查、攔截或放行。",
    boundary: "單純可重複步驟不算。",
  },
  {
    id: "bumblebee",
    label: "bumblebee",
    aliases: [],
    dimension: "proper-name",
    meaning: "bumblebee 掃描工具與 catalog 能力。",
    boundary: "一般供應鏈問題另用 supply chain。",
  },
  {
    id: "claude-code",
    label: "Claude Code",
    aliases: ["Claude Code"],
    dimension: "proper-name",
    meaning: "Claude Code 產品專屬行為、設定或生態。",
    boundary: "泛用 coding agent 問題不算，也不作為新文章預設 tag。",
  },
  {
    id: "code-review",
    label: "code review",
    aliases: [],
    dimension: "subject",
    meaning: "code review 的視角、停止條件、影響面與資料層。",
    boundary: "spec review 另用 spec-review。",
  },
  {
    id: "code-search",
    label: "code search",
    aliases: [],
    dimension: "subject",
    meaning: "codebase 搜尋工具、品質與 agent 採用。",
    boundary: "一般 MCP 工具不算。",
  },
  {
    id: "cost-analysis",
    label: "cost analysis",
    aliases: [],
    dimension: "article-angle",
    meaning: "用成本模型、回本點或機會成本裁決方案。",
    boundary: "只提價格或成本數字不算。",
  },
  {
    id: "data-quality",
    label: "data quality",
    aliases: [],
    dimension: "subject",
    meaning: "欄位、資料列、儲存格與查詢結果的真實性。",
    boundary: "外部來源真偽用 fact-check。",
  },
  {
    id: "deep-research",
    label: "deep research",
    aliases: [],
    dimension: "subject",
    meaning: "deep-research workflow 本身與其執行限制。",
    boundary: "一般研究文章不算。",
  },
  {
    id: "evaluation",
    label: "evaluation",
    aliases: [],
    dimension: "article-angle",
    meaning: "對模型、判官或機制的精確率、召回率、成本與責任評估。",
    boundary: "外部工具競合用 tool-evaluation。",
  },
  {
    id: "fabrication",
    label: "fabrication",
    aliases: [],
    dimension: "subject",
    meaning: "agent 報告、路徑、規則或完成宣告與現實不符。",
    boundary: "測試空洞用 test-theater。",
  },
  {
    id: "fact-check",
    label: "fact check",
    aliases: [],
    dimension: "subject",
    meaning: "主張是否有權威來源與原始證據。",
    boundary: "資料表內部品質用 data-quality。",
  },
  {
    id: "gpt",
    label: "GPT",
    aliases: [],
    dimension: "proper-name",
    meaning: "GPT 模型接入與行為實測。",
    boundary: "泛稱模型比較用 llm 或更精確 tag。",
  },
  {
    id: "hook",
    label: "hook",
    aliases: ["hooks"],
    dimension: "subject",
    meaning: "hook 的觸發、攔截、注入、判官或限制。",
    boundary: "自動化目的不是 hook 的同義詞。",
  },
  {
    id: "knowledge-management",
    label: "knowledge management",
    aliases: [],
    dimension: "subject",
    meaning: "wiki、知識管線、整理與持續可用性。",
    boundary: "單一 memory 檔技巧不一定算。",
  },
  {
    id: "llm",
    label: "LLM",
    aliases: [],
    dimension: "subject",
    meaning: "模型相容性、部署、能力與供應商層面的共同路徑。",
    boundary: "正文只順帶出現模型不算。",
  },
  {
    id: "local-llm",
    label: "local LLM",
    aliases: [],
    dimension: "subject",
    meaning: "本地模型的部署、延遲、限制與適用職位。",
    boundary: "雲端模型比較不算。",
  },
  {
    id: "matt-pocock",
    label: "Matt Pocock",
    aliases: [],
    dimension: "proper-name",
    meaning: "Matt Pocock 的公開方法、工具或立場。",
    boundary: "skill 一般設計另用 skill。",
  },
  {
    id: "mcp",
    label: "MCP",
    aliases: ["MCP"],
    dimension: "proper-name",
    meaning: "MCP 介面、server 或工具交付型態。",
    boundary: "工具用途另用相應主題 tag。",
  },
  {
    id: "memory",
    label: "memory",
    aliases: [],
    dimension: "subject",
    meaning: "agent 與 Claude Code 記憶系統的寫入、載入、架構與退役。",
    boundary: "一般文章中的回憶不算。",
  },
  {
    id: "methodology",
    label: "methodology",
    aliases: [],
    dimension: "article-angle",
    meaning: "文章主要交付可重複的方法、量尺、判準或流程原則。",
    boundary: "只有經驗敘事或單次結果不算。",
  },
  {
    id: "model-behavior",
    label: "model behavior",
    aliases: ["llm-behavior", "model"],
    dimension: "subject",
    meaning: "不同模型執行同一規則、治理層或任務時的行為差。",
    boundary: "不等於 model routing。",
  },
  {
    id: "model-routing",
    label: "model routing",
    aliases: [],
    dimension: "subject",
    meaning: "按任務性質、成本或能力分配模型。",
    boundary: "同一任務並行多模型用 multi-model。",
  },
  {
    id: "multi-model",
    label: "multi-model",
    aliases: [],
    dimension: "subject",
    meaning: "同一工作刻意使用多個模型或 context 製造視角差。",
    boundary: "不等於 model routing。",
  },
  {
    id: "mutation-testing",
    label: "mutation testing",
    aliases: [],
    dimension: "subject",
    meaning: "故意改壞程式以檢驗測試是否守住行為。",
    boundary: "工具專名另用 Stryker。",
  },
  {
    id: "philosophy",
    label: "philosophy",
    aliases: [],
    dimension: "article-angle",
    meaning: "價值排序、主導權、注意力配置與設計立場。",
    boundary: "可操作步驟優先用 methodology。",
  },
  {
    id: "prompt-caching",
    label: "prompt caching",
    aliases: [],
    dimension: "subject",
    meaning: "prompt cache 的命中、暖機與成本效果。",
    boundary: "泛用 token 成本用 token-optimization。",
  },
  {
    id: "proxy",
    label: "proxy",
    aliases: [],
    dimension: "subject",
    meaning: "模型或 API proxy 的路由、暖機與風險。",
    boundary: "一般 vendor swap 不自動加入。",
  },
  {
    id: "quota",
    label: "quota",
    aliases: [],
    dimension: "subject",
    meaning: "帳號或模型用量天花板與資源分配。",
    boundary: "API burst rate limit 不自動算 quota。",
  },
  {
    id: "retrospective",
    label: "retrospective",
    aliases: [],
    dimension: "article-angle",
    meaning: "用使用後證據重看原本假設、架構或工具決定。",
    boundary: "只介紹方法不算；可與 methodology 同時成立。",
  },
  {
    id: "revealed-preference",
    label: "revealed preference",
    aliases: [],
    dimension: "article-angle",
    meaning: "用實際行為而非口頭偏好判斷需求與採用。",
    boundary: "一般 usage metric 不一定算。",
  },
  {
    id: "security",
    label: "security",
    aliases: [],
    dimension: "subject",
    meaning: "credential、危險指令、惡意套件與安全退化。",
    boundary: "supply chain 是更窄子題。",
  },
  {
    id: "skill",
    label: "skill",
    aliases: ["skills"],
    dimension: "subject",
    meaning: "skill 作為可重用知識、流程與規則載體。",
    boundary: "特定 skill repo 的專名仍另用專名 tag。",
  },
  {
    id: "spec-review",
    label: "spec review",
    aliases: [],
    dimension: "subject",
    meaning: "spec 的反問、證據追問與人類拍板。",
    boundary: "code diff review 不算。",
  },
  {
    id: "subagent",
    label: "subagent",
    aliases: ["subagents"],
    dimension: "subject",
    meaning: "委派子 agent 的可靠性、採用與成本。",
    boundary: "不等於所有 AI agent。",
  },
  {
    id: "supply-chain",
    label: "supply chain",
    aliases: [],
    dimension: "subject",
    meaning: "套件或 extension 的惡意傳播、下架與殘留。",
    boundary: "一般 shell safety 不算。",
  },
  {
    id: "test-theater",
    label: "test theater",
    aliases: [],
    dimension: "subject",
    meaning: "測試全綠但沒有守住行為的失效型態。",
    boundary: "不等於測試領域本身。",
  },
  {
    id: "testing",
    label: "testing",
    aliases: [],
    dimension: "subject",
    meaning: "測試策略、回歸考卷與可觀察驗收。",
    boundary: "AI testing 與 mutation testing 可另加窄 tag。",
  },
  {
    id: "token-optimization",
    label: "token optimization",
    aliases: ["token"],
    dimension: "subject",
    meaning: "token 節省、資訊損失、暖機或 agent 開機成本。",
    boundary: "只列 token 數字但不分析取捨時不加。",
  },
  {
    id: "tool-adoption",
    label: "tool adoption",
    aliases: [],
    dimension: "subject",
    meaning: "實際安裝、試用、採用率、留下、退役或抽件。",
    boundary: "未實機使用且只做紙上否決時用 tool-evaluation。",
  },
  {
    id: "tool-evaluation",
    label: "tool evaluation",
    aliases: [],
    dimension: "subject",
    meaning: "引入前的 stack-fit、剩餘價值、紙上上限與方案比較。",
    boundary: "已進真實 trial 或量實際使用時用 tool-adoption。",
  },
  {
    id: "tooling",
    label: "tooling",
    aliases: [],
    dimension: "subject",
    meaning: "具名工具的接線、操作、能力與限制。",
    boundary: "只評估工具但未接線時用 tool-evaluation。",
  },
  {
    id: "vector-db",
    label: "vector DB",
    aliases: [],
    dimension: "subject",
    meaning: "embedding 與 vector DB 記憶的適配、搜尋與退役。",
    boundary: "一般 knowledge management 不自動加入。",
  },
  {
    id: "vendor-swap",
    label: "vendor swap",
    aliases: [],
    dimension: "subject",
    meaning: "Claude Code 更換模型供應商的協議、功能、生態與韌性。",
    boundary: "只有模型性格差異時用 model-behavior。",
  },
  {
    id: "verify",
    label: "verify",
    aliases: [],
    dimension: "subject",
    meaning: "完成宣告、證據與真實結果層的核對。",
    boundary: "fact check 側重外部事實來源。",
  },
  {
    id: "vscode-extension",
    label: "VS Code extension",
    aliases: [],
    dimension: "subject",
    meaning: "VS Code extension 的安裝、更新、版號與市集生命週期。",
    boundary: "一般編輯器工具不算。",
  },
  {
    id: "websearch",
    label: "WebSearch",
    aliases: [],
    dimension: "proper-name",
    meaning: "Claude Code WebSearch 的排序、來源覆蓋與限制。",
    boundary: "一般 web research 不算。",
  },
  {
    id: "workflow",
    label: "workflow",
    aliases: [],
    dimension: "subject",
    meaning: "有明確階段、編排或可重跑入口的流程。",
    boundary: "只有方法判準但沒有流程編排時用 methodology。",
  },
  {
    id: "workflow-resume",
    label: "workflow resume",
    aliases: ["resume"],
    dimension: "subject",
    meaning: "長時間 workflow 的暫停、恢復與重用。",
    boundary: "不使用語意過寬的 resume。",
  },
]);
