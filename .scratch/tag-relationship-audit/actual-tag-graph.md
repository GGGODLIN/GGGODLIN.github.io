# Actual tag graph 唯讀 audit

本報告只描述目前 40 篇文章 frontmatter 形成的實際 tag 關係圖。它不推斷預期系列、不建立 mismatch finding，也不把 singleton、孤立 node 或 degree 0 判成缺陷。

## 範圍與不做事項

- 第一手來源：40 份 `src/content/blog/*.md` frontmatter、`src/data/tag-registry.ts`、`src/data/topic-groups.ts`。
- `generic tags = {claude-code, methodology}`；meaningful graph 排除這兩個 tag，只保留至少一個 shared specific tag 的文章 pair。
- topic groups 只提供 node metadata 與 tag 的辨識力診斷；它們不建立 edge，也不替文章補 tag。
- 本報告不從文章內容推斷預期系列，不提出 tag 修正，不把孤島視為錯誤。
- `actual-tag-graph.json` 是完整機器可讀 manifest；本檔不重複 687 條 all edge。

## 公式

- 文章 pair 分母：`C(40,2) = 40 × 39 ÷ 2 = 780`。
- tag 形成邊數：`C(n,2)`，其中 `n` 是帶有該 tag 的文章數。
- coverage：`n ÷ 40`；pair coverage：`C(n,2) ÷ 780`。
- information bits：`log2(40 ÷ n)`；文章越少，單次共享提供的辨識資訊越高。
- residual tag Jaccard：對 tag 內每個文章 pair，先從兩篇 tag set 都拿掉候選 tag，再算 `|交集| ÷ |聯集|`，最後取平均。`n < 2` 時記為 `null / —`。
- all edge weight：所有 shared tags 數；meaningful edge weight：shared specific tags 數。
- `sole_edge_pair_count`：兩篇文章的完整 tag 交集恰好只有候選 tag 的 pair 數。
- tag 的 topic group spread：先從每篇文章拿掉候選 tag，再看其餘 tags 命中哪些 `topic-groups.ts` 群組；只做 metadata，不建立 edge。

## Coverage receipt

| 檢查 | 實際值 | 分母／對帳 |
|---|---:|---|
| frontmatter parsed | 40/40 | 40 份來源檔 |
| tag assignments | 164 | 40 篇 tags 長度總和 |
| used / registry tags | 54/54 | unknown 0；unused 0 |
| article pairs | 780 | `C(40,2)` |
| all graph | 687 edge + 93 non-edge = 780 | pair 全覆蓋 |
| meaningful graph | 144 edge + 636 non-edge = 780 | pair 全覆蓋 |
| missing required fields | 0 | required: title / description / pubDate / tags |
| empty tags | 0 | 40 篇 |
| unknown tags | 0 | used − registry |
| unused registry tags | 0 | registry − used |
| duplicate slug | 0 | 40 篇 |
| duplicate title | 0 | 40 篇 |
| duplicate per-article tag | 0 | 40 篇 |

## 來源 digest

- `brief.md` SHA-256：`e5adf9d4e5dfe6479063e7122abfb038c465070d7f3dfadd1a38ae1c8f2fbe55`。
- normalized frontmatter SHA-256：`37475e86a0caaedd44b8500581942ac87a3a9c4f4bc5643db056fcf057ec54fb`。正規化方式：檔名排序；解析 frontmatter；`pubDate` 轉字串；加入 slug；以 UTF-8、key 排序、compact JSON 序列化。
- `tag-registry.ts` SHA-256：`b040db76033a43a58ccfa3e90c64e4733ae9b2315d4bb73c1e49885d7d17e6ea`。
- `topic-groups.ts` SHA-256：`019ef493099627e2346785977df7acf4da0a6a5fd4b92f7324ae68bb5c078076`。

## Generic 判斷

| tag | n/40 | pair coverage | residual Jaccard | sole pairs | 裁決 |
|---|---:|---:|---:|---:|---|
| `claude-code` | 37/40 (92.50%) | 666/780 (85.38%) | 0.069614 | 468 | generic |
| `methodology` | 14/40 (35.00%) | 91/780 (11.67%) | 0.210296 | 12 | generic |
| `hook` | 9/40 (22.50%) | 36/780 (4.62%) | 0.230423 | 0 | specific（候選後反證） |
| `tool-adoption` | 9/40 (22.50%) | 36/780 (4.62%) | 0.176720 | 7 | specific（候選後反證） |
| `workflow` | 7/40 (17.50%) | 21/780 (2.69%) | 0.271088 | 0 | specific（候選後反證） |
| `llm` | 6/40 (15.00%) | 15/780 (1.92%) | 0.421111 | 0 | specific（候選後反證） |

- `claude-code`：registry 雖把它界定為 Claude Code 產品專屬行為，但它覆蓋 37/40 篇，單獨形成 468 個 sole pair，拿掉後其餘 tags 的平均 Jaccard 只有 0.069614。它在這份 corpus 幾乎是背景條件，不能單獨證明系列關係。
- `methodology`：這是 corpus-local generic 裁決，不是宣稱該詞永遠泛用。registry 把它定義為「文章主要交付可重複的方法、量尺、判準或流程原則」的 article-angle；14 篇橫跨工具評估、模型分工、hook、spec review 與寫作治理。只排除 `claude-code` 時 meaningful graph 有 219 條 edge、2 個 component（39+1）；再排除 `methodology` 後降為 144 條、3 個 component（37+2+1），顯示它會實質把不同 subject 串成一團，因此主圖排除。
- `hook` 候選反證：registry 明確指向 hook 的觸發、攔截、注入、判官與限制，boundary 又把「自動化目的」排除在同義範圍外。9/40 的 coverage 與清楚機制邊界足以保留為 specific。
- `tool-adoption` 候選反證：registry 要求實際安裝、試用、採用率、留下、退役或抽件，並以 boundary 區分紙上 `tool-evaluation`。雖有 7 個 sole pair，它仍表達可辨識的試用生命週期，不當 generic。
- `workflow` 候選反證：registry 要求明確階段、編排或可重跑入口，boundary 排除只有方法判準的文章；7/40，且 formed edge 只有 21/780。它保留流程編排語意。
- `llm` 候選反證：它是模型相容性、部署、能力與供應商的父層 subject，boundary 排除正文只順帶提模型的文章。6/40、residual Jaccard 0.421111，tag 內文章在拿掉 `llm` 後仍有明顯凝聚，故保留 specific；高重疊候選另顯示它可能與 `vendor-swap` 是父子層級，而非近義詞。

### Generic 敏感度

| 排除 tags | edges | components | component sizes |
|---|---:|---:|---|
| `claude-code` | 219 | 2 | 39 + 1 |
| `claude-code`, `methodology` | 144 | 3 | 37 + 2 + 1 |

## 兩張圖指標

| 指標 | All graph | Meaningful graph |
|---|---:|---:|
| edge / 780 | 687 | 144 |
| generic-only pair / 780 | 543/780 | 0/780（定義上排除） |
| non-edge / 780 | 93 | 636 |
| degree sum | 1374 = 2×687 | 288 = 2×144 |
| average degree | 34.35 = 1374/40 | 7.20 = 288/40 |
| components | 2（39 + 1） | 3（37 + 2 + 1） |
| isolated nodes | `test-theater` | `test-theater` |
| weight distribution | 1→487；2→171；3→26；4→3 | 1→128；2→14；3→2 |

`test-theater` 在兩張圖都是 degree 0；本 audit 只記錄，不判錯。

## Meaningful weight ≥ 2 edges

共 16/144 條；weight 以 shared specific tags 數計。

| source | target | shared specific tags | all shared tags | weight | 原 all-edge 類型 |
|---|---|---|---|---:|---|
| `agent-tool-reach` | `code-search-adoption` | `code-search`, `mcp` | `claude-code`, `code-search`, `mcp` | 2 | mixed |
| `agent-tool-reach` | `token-saving-tools` | `mcp`, `tool-evaluation` | `claude-code`, `mcp`, `tool-evaluation` | 2 | mixed |
| `bumblebee-still-on-disk` | `dcg-safety-lock` | `security`, `tool-adoption` | `security`, `tool-adoption` | 2 | specific |
| `cc-vendor-swap` | `gpt-in-cc-performance` | `llm`, `vendor-swap` | `claude-code`, `llm`, `vendor-swap` | 2 | mixed |
| `cc-vendor-swap` | `gpt-in-cc` | `llm`, `vendor-swap` | `claude-code`, `llm`, `vendor-swap` | 2 | mixed |
| `cc-vendor-swap` | `vendor-benefit` | `llm`, `vendor-swap` | `claude-code`, `llm`, `vendor-swap` | 2 | mixed |
| `checker-layoff` | `local-llm-hook-judge` | `hook`, `llm` | `claude-code`, `hook`, `llm` | 2 | mixed |
| `code-search-adoption` | `token-saving-tools` | `mcp`, `tool-adoption` | `claude-code`, `mcp`, `tool-adoption` | 2 | mixed |
| `dcg-safety-lock` | `sem-blast-radius` | `hook`, `tool-adoption`, `tooling` | `claude-code`, `hook`, `tool-adoption`, `tooling` | 3 | mixed |
| `gpt-in-cc-performance` | `gpt-in-cc` | `gpt`, `llm`, `vendor-swap` | `claude-code`, `gpt`, `llm`, `vendor-swap` | 3 | mixed |
| `gpt-in-cc-performance` | `vendor-benefit` | `llm`, `vendor-swap` | `claude-code`, `llm`, `vendor-swap` | 2 | mixed |
| `gpt-in-cc` | `vendor-benefit` | `llm`, `vendor-swap` | `claude-code`, `llm`, `vendor-swap` | 2 | mixed |
| `hook-watchdog` | `rule-ladder` | `automation`, `hook` | `automation`, `claude-code`, `hook`, `methodology` | 2 | mixed |
| `keep-the-wiki-alive` | `retire-vector-memory` | `memory`, `retrospective` | `claude-code`, `memory`, `retrospective` | 2 | mixed |
| `prose-exams` | `workflow-vs-skill` | `skill`, `workflow` | `claude-code`, `skill`, `workflow` | 2 | mixed |
| `sem-blast-radius` | `steal-determinism-layer` | `code-review`, `tool-adoption` | `claude-code`, `code-review`, `tool-adoption` | 2 | mixed |

## Tag layer 全表

`topic spread` 的 `group:n` 是拿掉候選 tag 後，仍由其餘 tags 命中該 group 的文章數；`ungrouped:n` 另列未命中任何 topic group 的文章數。`neighbor articles` 是帶有該 tag 的完整文章集合。

| tag | registry definition / boundary | n；C(n,2) | coverage；pair coverage | generic；bits；residual J | sole pairs | topic spread | neighbor articles |
|---|---|---:|---:|---|---:|---|---|
| `FFF` | FFF 工具本身與其能力邊界。 / 邊界：code search 與 MCP 另用各自主題 tag。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | tools:1 | `agent-tool-reach` |
| `Stryker` | Stryker mutation testing 工具。 / 邊界：mutation testing 方法另用主題 tag。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | quality:1 | `test-theater` |
| `ai-agent` | agent 層級的架構、治理與能力預算。 / 邊界：不因文章由 agent 執行就加入；委派子 agent 優先用 subagent。 | 2；1 | 5.00%；0.13% | no；4.321928；0.142857 | 0 | workflow:1, models:1, automation:1 | `rule-ladder`, `subagent-boot-cost` |
| `ai-testing` | AI 產生或維護測試時的可靠性。 / 邊界：不等於一般 testing 或 mutation testing。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | quality:1 | `test-theater` |
| `ai-workflow` | AI 直接參與資料、敘事或決策的流程。 / 邊界：不與所有 workflow 合併。 | 2；1 | 5.00%；0.13% | no；4.321928；0.250000 | 0 | quality:2 | `ai-report-two-lies`, `spec-review-round` |
| `auto-memory` | Claude Code auto memory 的容量、載入與目錄化。 / 邊界：一般手寫記憶不算。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | memory:1 | `memory-cap-reframe` |
| `automation` | 自動觸發、檢查、攔截或放行。 / 邊界：單純可重複步驟不算。 | 2；1 | 5.00%；0.13% | no；4.321928；0.600000 | 0 | workflow:1, quality:1, automation:2 | `hook-watchdog`, `rule-ladder` |
| `bumblebee` | bumblebee 掃描工具與 catalog 能力。 / 邊界：一般供應鏈問題另用 supply chain。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | tools:1 | `bumblebee-still-on-disk` |
| `claude-code` | Claude Code 產品專屬行為、設定或生態。 / 邊界：泛用 coding agent 問題不算，也不作為新文章預設 tag。 | 37；666 | 92.50%；85.38% | yes；0.112475；0.069614 | 468 | workflow:12, models:12, tools:15, memory:4, quality:10, automation:9 | `absorb-awesome-list`, `agent-tool-reach`, `cc-vendor-swap`, `check-my-stack`, `checker-layoff`, `code-search-adoption`, `dcg-safety-lock`, `deep-research-rate-limit`, `exit-0-illusion`, `gpt-in-cc`, `gpt-in-cc-performance`, `gpt-review-tunnel-vision`, `hook-watchdog`, `inline-the-rules`, `keep-the-wiki-alive`, `local-llm-hook-judge`, `matt-philosophy`, `measure-revealed-adoption`, `memory-cap-reframe`, `model-routing`, `one-model-not-enough`, `prose-exams`, `protocol-model-dependency`, `proxy-warmup-cost`, `retire-vector-memory`, `rule-ladder`, `sem-blast-radius`, `sol-overimplementation`, `spec-review-round`, `steal-determinism-layer`, `subagent-boot-cost`, `token-saving-tools`, `trial-review-system`, `unattended-workflow-resume`, `vendor-benefit`, `websearch-misses-official-docs`, `workflow-vs-skill` |
| `code-review` | code review 的視角、停止條件、影響面與資料層。 / 邊界：spec review 另用 spec-review。 | 4；6 | 10.00%；0.77% | no；3.321928；0.272222 | 0 | workflow:1, models:2, tools:2, automation:1 | `gpt-review-tunnel-vision`, `one-model-not-enough`, `sem-blast-radius`, `steal-determinism-layer` |
| `code-search` | codebase 搜尋工具、品質與 agent 採用。 / 邊界：一般 MCP 工具不算。 | 2；1 | 5.00%；0.13% | no；4.321928；0.400000 | 0 | tools:2 | `agent-tool-reach`, `code-search-adoption` |
| `cost-analysis` | 用成本模型、回本點或機會成本裁決方案。 / 邊界：只提價格或成本數字不算。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | tools:1 | `proxy-warmup-cost` |
| `data-quality` | 欄位、資料列、儲存格與查詢結果的真實性。 / 邊界：外部來源真偽用 fact-check。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | workflow:1 | `ai-report-two-lies` |
| `deep-research` | deep-research workflow 本身與其執行限制。 / 邊界：一般研究文章不算。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | workflow:1 | `deep-research-rate-limit` |
| `evaluation` | 對模型、判官或機制的精確率、召回率、成本與責任評估。 / 邊界：外部工具競合用 tool-evaluation。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | models:1, automation:1 | `checker-layoff` |
| `fabrication` | agent 報告、路徑、規則或完成宣告與現實不符。 / 邊界：測試空洞用 test-theater。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | workflow:1, quality:1 | `exit-0-illusion` |
| `fact-check` | 主張是否有權威來源與原始證據。 / 邊界：資料表內部品質用 data-quality。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | ungrouped:1 | `websearch-misses-official-docs` |
| `gpt` | GPT 模型接入與行為實測。 / 邊界：泛稱模型比較用 llm 或更精確 tag。 | 4；6 | 10.00%；0.77% | no；3.321928；0.372222 | 0 | models:2, quality:1; ungrouped:1 | `gpt-in-cc`, `gpt-in-cc-performance`, `gpt-review-tunnel-vision`, `sol-overimplementation` |
| `hook` | hook 的觸發、攔截、注入、判官或限制。 / 邊界：自動化目的不是 hook 的同義詞。 | 9；36 | 22.50%；4.62% | no；2.152003；0.230423 | 0 | workflow:2, models:3, tools:3, memory:1, quality:4, automation:2 | `checker-layoff`, `dcg-safety-lock`, `hook-watchdog`, `inline-the-rules`, `local-llm-hook-judge`, `prose-exams`, `protocol-model-dependency`, `rule-ladder`, `sem-blast-radius` |
| `knowledge-management` | wiki、知識管線、整理與持續可用性。 / 邊界：單一 memory 檔技巧不一定算。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | memory:1 | `keep-the-wiki-alive` |
| `llm` | 模型相容性、部署、能力與供應商層面的共同路徑。 / 邊界：正文只順帶出現模型不算。 | 6；15 | 15.00%；1.92% | no；2.736966；0.421111 | 0 | models:5, quality:1, automation:2 | `cc-vendor-swap`, `checker-layoff`, `gpt-in-cc`, `gpt-in-cc-performance`, `local-llm-hook-judge`, `vendor-benefit` |
| `local-llm` | 本地模型的部署、延遲、限制與適用職位。 / 邊界：雲端模型比較不算。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | models:1, automation:1 | `local-llm-hook-judge` |
| `matt-pocock` | Matt Pocock 的公開方法、工具或立場。 / 邊界：skill 一般設計另用 skill。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | tools:1 | `matt-philosophy` |
| `mcp` | MCP 介面、server 或工具交付型態。 / 邊界：工具用途另用相應主題 tag。 | 3；3 | 7.50%；0.38% | no；3.736966；0.377778 | 0 | tools:3 | `agent-tool-reach`, `code-search-adoption`, `token-saving-tools` |
| `memory` | agent 與 Claude Code 記憶系統的寫入、載入、架構與退役。 / 邊界：一般文章中的回憶不算。 | 4；6 | 10.00%；0.77% | no；3.321928；0.244444 | 0 | tools:1, memory:3, automation:1 | `inline-the-rules`, `keep-the-wiki-alive`, `memory-cap-reframe`, `retire-vector-memory` |
| `methodology` | 文章主要交付可重複的方法、量尺、判準或流程原則。 / 邊界：只有經驗敘事或單次結果不算。 | 14；91 | 35.00%；11.67% | yes；1.514573；0.210296 | 12 | workflow:7, models:3, tools:6, memory:1, quality:6, automation:4 | `absorb-awesome-list`, `ai-report-two-lies`, `check-my-stack`, `gpt-review-tunnel-vision`, `hook-watchdog`, `inline-the-rules`, `measure-revealed-adoption`, `model-routing`, `prose-exams`, `rule-ladder`, `sol-overimplementation`, `spec-review-round`, `steal-determinism-layer`, `trial-review-system` |
| `model-behavior` | 不同模型執行同一規則、治理層或任務時的行為差。 / 邊界：不等於 model routing。 | 2；1 | 5.00%；0.13% | no；4.321928；0.200000 | 0 | models:1, automation:1 | `gpt-in-cc-performance`, `protocol-model-dependency` |
| `model-routing` | 按任務性質、成本或能力分配模型。 / 邊界：同一任務並行多模型用 multi-model。 | 2；1 | 5.00%；0.13% | no；4.321928；0.166667 | 0 | workflow:1, models:1 | `model-routing`, `subagent-boot-cost` |
| `multi-model` | 同一工作刻意使用多個模型或 context 製造視角差。 / 邊界：不等於 model routing。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | workflow:1, quality:1 | `one-model-not-enough` |
| `mutation-testing` | 故意改壞程式以檢驗測試是否守住行為。 / 邊界：工具專名另用 Stryker。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | quality:1 | `test-theater` |
| `philosophy` | 價值排序、主導權、注意力配置與設計立場。 / 邊界：可操作步驟優先用 methodology。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | tools:1 | `matt-philosophy` |
| `prompt-caching` | prompt cache 的命中、暖機與成本效果。 / 邊界：泛用 token 成本用 token-optimization。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | tools:1 | `proxy-warmup-cost` |
| `proxy` | 模型或 API proxy 的路由、暖機與風險。 / 邊界：一般 vendor swap 不自動加入。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | tools:1 | `proxy-warmup-cost` |
| `quota` | 帳號或模型用量天花板與資源分配。 / 邊界：API burst rate limit 不自動算 quota。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | models:1 | `model-routing` |
| `retrospective` | 用使用後證據重看原本假設、架構或工具決定。 / 邊界：只介紹方法不算；可與 methodology 同時成立。 | 3；3 | 7.50%；0.38% | no；3.736966；0.255556 | 0 | tools:1, memory:2, quality:1 | `keep-the-wiki-alive`, `retire-vector-memory`, `websearch-misses-official-docs` |
| `revealed-preference` | 用實際行為而非口頭偏好判斷需求與採用。 / 邊界：一般 usage metric 不一定算。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | workflow:1, tools:1 | `measure-revealed-adoption` |
| `security` | credential、危險指令、惡意套件與安全退化。 / 邊界：supply chain 是更窄子題。 | 2；1 | 5.00%；0.13% | no；4.321928；0.142857 | 0 | tools:2, automation:1 | `bumblebee-still-on-disk`, `dcg-safety-lock` |
| `skill` | skill 作為可重用知識、流程與規則載體。 / 邊界：特定 skill repo 的專名仍另用專名 tag。 | 3；3 | 7.50%；0.38% | no；3.736966；0.264286 | 0 | workflow:2, quality:1, automation:1; ungrouped:1 | `matt-philosophy`, `prose-exams`, `workflow-vs-skill` |
| `spec-review` | spec 的反問、證據追問與人類拍板。 / 邊界：code diff review 不算。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | workflow:1 | `spec-review-round` |
| `subagent` | 委派子 agent 的可靠性、採用與成本。 / 邊界：不等於所有 AI agent。 | 3；3 | 7.50%；0.38% | no；3.736966；0.158730 | 0 | workflow:1, models:1, tools:1, quality:1 | `exit-0-illusion`, `measure-revealed-adoption`, `subagent-boot-cost` |
| `supply-chain` | 套件或 extension 的惡意傳播、下架與殘留。 / 邊界：一般 shell safety 不算。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | tools:1 | `bumblebee-still-on-disk` |
| `test-theater` | 測試全綠但沒有守住行為的失效型態。 / 邊界：不等於測試領域本身。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | quality:1 | `test-theater` |
| `testing` | 測試策略、回歸考卷與可觀察驗收。 / 邊界：AI testing 與 mutation testing 可另加窄 tag。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | workflow:1, tools:1, automation:1 | `prose-exams` |
| `token-optimization` | token 節省、資訊損失、暖機或 agent 開機成本。 / 邊界：只列 token 數字但不分析取捨時不加。 | 3；3 | 7.50%；0.38% | no；3.736966；0.142857 | 0 | workflow:1, models:1, tools:2 | `proxy-warmup-cost`, `subagent-boot-cost`, `token-saving-tools` |
| `tool-adoption` | 實際安裝、試用、採用率、留下、退役或抽件。 / 邊界：未實機使用且只做紙上否決時用 tool-evaluation。 | 9；36 | 22.50%；4.62% | no；2.152003；0.176720 | 7 | workflow:2, tools:4, memory:1, quality:2, automation:2; ungrouped:1 | `bumblebee-still-on-disk`, `code-search-adoption`, `dcg-safety-lock`, `measure-revealed-adoption`, `retire-vector-memory`, `sem-blast-radius`, `steal-determinism-layer`, `token-saving-tools`, `trial-review-system` |
| `tool-evaluation` | 引入前的 stack-fit、剩餘價值、紙上上限與方案比較。 / 邊界：已進真實 trial 或量實際使用時用 tool-adoption。 | 4；6 | 10.00%；0.77% | no；3.321928；0.288889 | 0 | workflow:1, tools:2; ungrouped:1 | `absorb-awesome-list`, `agent-tool-reach`, `check-my-stack`, `token-saving-tools` |
| `tooling` | 具名工具的接線、操作、能力與限制。 / 邊界：只評估工具但未接線時用 tool-evaluation。 | 2；1 | 5.00%；0.13% | no；4.321928；0.600000 | 0 | tools:2, quality:1, automation:2 | `dcg-safety-lock`, `sem-blast-radius` |
| `vector-db` | embedding 與 vector DB 記憶的適配、搜尋與退役。 / 邊界：一般 knowledge management 不自動加入。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | tools:1, memory:1 | `retire-vector-memory` |
| `vendor-swap` | Claude Code 更換模型供應商的協議、功能、生態與韌性。 / 邊界：只有模型性格差異時用 model-behavior。 | 4；6 | 10.00%；0.77% | no；3.321928；0.680556 | 0 | models:4 | `cc-vendor-swap`, `gpt-in-cc`, `gpt-in-cc-performance`, `vendor-benefit` |
| `verify` | 完成宣告、證據與真實結果層的核對。 / 邊界：fact check 側重外部事實來源。 | 2；1 | 5.00%；0.13% | no；4.321928；0.166667 | 0 | workflow:1, quality:1, automation:1 | `exit-0-illusion`, `hook-watchdog` |
| `vscode-extension` | VS Code extension 的安裝、更新、版號與市集生命週期。 / 邊界：一般編輯器工具不算。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | tools:1 | `bumblebee-still-on-disk` |
| `websearch` | Claude Code WebSearch 的排序、來源覆蓋與限制。 / 邊界：一般 web research 不算。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | quality:1 | `websearch-misses-official-docs` |
| `workflow` | 有明確階段、編排或可重跑入口的流程。 / 邊界：只有方法判準但沒有流程編排時用 methodology。 | 7；21 | 17.50%；2.69% | no；2.514573；0.271088 | 0 | workflow:2, models:1, tools:4, quality:2, automation:1 | `absorb-awesome-list`, `deep-research-rate-limit`, `one-model-not-enough`, `prose-exams`, `trial-review-system`, `unattended-workflow-resume`, `workflow-vs-skill` |
| `workflow-resume` | 長時間 workflow 的暫停、恢復與重用。 / 邊界：不使用語意過寬的 resume。 | 1；0 | 2.50%；0.00% | no；5.321928；— | 0 | workflow:1 | `unattended-workflow-resume` |

## 可能近義碎裂候選

門檻固定為 tag neighbor set 的 `intersection ≥ 2` 且 `Jaccard ≥ 2/3`。命中只標「可能近義碎裂」，不判定合併。

| tag pair | intersection / union | Jaccard | shared articles | 標記 |
|---|---:|---:|---|---|
| `code-search` ↔ `mcp` | 2/3 | 0.666667 | `agent-tool-reach`, `code-search-adoption` | 可能近義碎裂 |
| `llm` ↔ `vendor-swap` | 4/6 | 0.666667 | `cc-vendor-swap`, `gpt-in-cc`, `gpt-in-cc-performance`, `vendor-benefit` | 可能近義碎裂 |

- `llm` ↔ `vendor-swap` 語意反證：registry 把 `llm` 定義為模型相容性、部署、能力與供應商的共同父層；`vendor-swap` 則限定 Claude Code 更換模型供應商時的協議、功能、生態與韌性。高重疊可能來自父子層級共標，不足以證明同義。
- `code-search` ↔ `mcp` 語意反證：registry 把 `code-search` 定義為工具用途與 agent 採用，把 `mcp` 定義為介面、server 或工具交付型態；兩者是「主題」與「介面」的正交共標，不足以證明同義。

## Article layer（40 篇）

每篇列出 current tags、all degree、meaningful degree、meaningful neighbors 與 generic-only neighbors。鄰居格式為 `slug[tag+tag;wN]`；degree 0 只記錄，不判錯。

### `absorb-awesome-list` — 抄 awesome 清單不難，難的是決定不抄什麼
- current tags：`claude-code`, `tool-evaluation`, `methodology`, `workflow`
- all degree：37/39；meaningful degree：9/39
- meaningful neighbors：`agent-tool-reach[tool-evaluation;w1]`, `check-my-stack[tool-evaluation;w1]`, `deep-research-rate-limit[workflow;w1]`, `one-model-not-enough[workflow;w1]`, `prose-exams[workflow;w1]`, `token-saving-tools[tool-evaluation;w1]`, `trial-review-system[workflow;w1]`, `unattended-workflow-resume[workflow;w1]`, `workflow-vs-skill[workflow;w1]`
- generic-only neighbors：`ai-report-two-lies[methodology;w1]`, `cc-vendor-swap[claude-code;w1]`, `checker-layoff[claude-code;w1]`, `code-search-adoption[claude-code;w1]`, `dcg-safety-lock[claude-code;w1]`, `exit-0-illusion[claude-code;w1]`, `gpt-in-cc[claude-code;w1]`, `gpt-in-cc-performance[claude-code;w1]`, `gpt-review-tunnel-vision[claude-code+methodology;w2]`, `hook-watchdog[claude-code+methodology;w2]`, `inline-the-rules[claude-code+methodology;w2]`, `keep-the-wiki-alive[claude-code;w1]`, `local-llm-hook-judge[claude-code;w1]`, `matt-philosophy[claude-code;w1]`, `measure-revealed-adoption[claude-code+methodology;w2]`, `memory-cap-reframe[claude-code;w1]`, `model-routing[claude-code+methodology;w2]`, `protocol-model-dependency[claude-code;w1]`, `proxy-warmup-cost[claude-code;w1]`, `retire-vector-memory[claude-code;w1]`, `rule-ladder[claude-code+methodology;w2]`, `sem-blast-radius[claude-code;w1]`, `sol-overimplementation[claude-code+methodology;w2]`, `spec-review-round[claude-code+methodology;w2]`, `steal-determinism-layer[claude-code+methodology;w2]`, `subagent-boot-cost[claude-code;w1]`, `vendor-benefit[claude-code;w1]`, `websearch-misses-official-docs[claude-code;w1]`

### `agent-tool-reach` — codebase 工具數據很強，到我 agent 手上剩不到一成
- current tags：`claude-code`, `mcp`, `code-search`, `tool-evaluation`, `FFF`
- all degree：36/39；meaningful degree：4/39
- meaningful neighbors：`absorb-awesome-list[tool-evaluation;w1]`, `check-my-stack[tool-evaluation;w1]`, `code-search-adoption[code-search+mcp;w2]`, `token-saving-tools[mcp+tool-evaluation;w2]`
- generic-only neighbors：`cc-vendor-swap`, `checker-layoff`, `dcg-safety-lock`, `deep-research-rate-limit`, `exit-0-illusion`, `gpt-in-cc`, `gpt-in-cc-performance`, `gpt-review-tunnel-vision`, `hook-watchdog`, `inline-the-rules`, `keep-the-wiki-alive`, `local-llm-hook-judge`, `matt-philosophy`, `measure-revealed-adoption`, `memory-cap-reframe`, `model-routing`, `one-model-not-enough`, `prose-exams`, `protocol-model-dependency`, `proxy-warmup-cost`, `retire-vector-memory`, `rule-ladder`, `sem-blast-radius`, `sol-overimplementation`, `spec-review-round`, `steal-determinism-layer`, `subagent-boot-cost`, `trial-review-system`, `unattended-workflow-resume`, `vendor-benefit`, `websearch-misses-official-docs`, `workflow-vs-skill`（全為 `claude-code;w1`）

### `ai-report-two-lies` — AI 報表會說兩次謊：查詢欄位是假的，解讀數字也可能是假的
- current tags：`ai-workflow`, `data-quality`, `methodology`
- all degree：13/39；meaningful degree：1/39
- meaningful neighbors：`spec-review-round[ai-workflow;w1]`
- generic-only neighbors：`absorb-awesome-list`, `check-my-stack`, `gpt-review-tunnel-vision`, `hook-watchdog`, `inline-the-rules`, `measure-revealed-adoption`, `model-routing`, `prose-exams`, `rule-ladder`, `sol-overimplementation`, `steal-determinism-layer`, `trial-review-system`（全為 `methodology;w1`）

### `bumblebee-still-on-disk` — 下架八個月的惡意 extension 還躺在我硬碟，bumblebee 抓到了
- current tags：`security`, `supply-chain`, `vscode-extension`, `bumblebee`, `tool-adoption`
- all degree：8/39；meaningful degree：8/39
- meaningful neighbors：`code-search-adoption[tool-adoption;w1]`, `dcg-safety-lock[security+tool-adoption;w2]`, `measure-revealed-adoption[tool-adoption;w1]`, `retire-vector-memory[tool-adoption;w1]`, `sem-blast-radius[tool-adoption;w1]`, `steal-determinism-layer[tool-adoption;w1]`, `token-saving-tools[tool-adoption;w1]`, `trial-review-system[tool-adoption;w1]`
- generic-only neighbors：—

### `cc-vendor-swap` — Claude Code 換第三方模型的踩坑指南
- current tags：`claude-code`, `vendor-swap`, `llm`
- all degree：36/39；meaningful degree：5/39
- meaningful neighbors：`checker-layoff[llm;w1]`, `gpt-in-cc[llm+vendor-swap;w2]`, `gpt-in-cc-performance[llm+vendor-swap;w2]`, `local-llm-hook-judge[llm;w1]`, `vendor-benefit[llm+vendor-swap;w2]`
- generic-only neighbors：`absorb-awesome-list`, `agent-tool-reach`, `check-my-stack`, `code-search-adoption`, `dcg-safety-lock`, `deep-research-rate-limit`, `exit-0-illusion`, `gpt-review-tunnel-vision`, `hook-watchdog`, `inline-the-rules`, `keep-the-wiki-alive`, `matt-philosophy`, `measure-revealed-adoption`, `memory-cap-reframe`, `model-routing`, `one-model-not-enough`, `prose-exams`, `protocol-model-dependency`, `proxy-warmup-cost`, `retire-vector-memory`, `rule-ladder`, `sem-blast-radius`, `sol-overimplementation`, `spec-review-round`, `steal-determinism-layer`, `subagent-boot-cost`, `token-saving-tools`, `trial-review-system`, `unattended-workflow-resume`, `websearch-misses-official-docs`, `workflow-vs-skill`（全為 `claude-code;w1`）

### `check-my-stack` — 你已經有的越多，新工具能給的越少
- current tags：`claude-code`, `tool-evaluation`, `methodology`
- all degree：37/39；meaningful degree：3/39
- meaningful neighbors：`absorb-awesome-list[tool-evaluation;w1]`, `agent-tool-reach[tool-evaluation;w1]`, `token-saving-tools[tool-evaluation;w1]`
- generic-only neighbors：`ai-report-two-lies[methodology;w1]`, `gpt-review-tunnel-vision[claude-code+methodology;w2]`, `hook-watchdog[claude-code+methodology;w2]`, `inline-the-rules[claude-code+methodology;w2]`, `measure-revealed-adoption[claude-code+methodology;w2]`, `model-routing[claude-code+methodology;w2]`, `prose-exams[claude-code+methodology;w2]`, `rule-ladder[claude-code+methodology;w2]`, `sol-overimplementation[claude-code+methodology;w2]`, `spec-review-round[claude-code+methodology;w2]`, `steal-determinism-layer[claude-code+methodology;w2]`, `trial-review-system[claude-code+methodology;w2]`；其餘 `cc-vendor-swap`, `checker-layoff`, `code-search-adoption`, `dcg-safety-lock`, `deep-research-rate-limit`, `exit-0-illusion`, `gpt-in-cc`, `gpt-in-cc-performance`, `keep-the-wiki-alive`, `local-llm-hook-judge`, `matt-philosophy`, `memory-cap-reframe`, `one-model-not-enough`, `protocol-model-dependency`, `proxy-warmup-cost`, `retire-vector-memory`, `sem-blast-radius`, `subagent-boot-cost`, `unattended-workflow-resume`, `vendor-benefit`, `websearch-misses-official-docs`, `workflow-vs-skill` 為 `claude-code;w1`

### `checker-layoff` — 我裁掉了兩個 AI 檢查員，留下的那個能者過勞
- current tags：`claude-code`, `hook`, `llm`, `evaluation`
- all degree：36/39；meaningful degree：12/39
- meaningful neighbors：`cc-vendor-swap[llm;w1]`, `dcg-safety-lock[hook;w1]`, `gpt-in-cc[llm;w1]`, `gpt-in-cc-performance[llm;w1]`, `hook-watchdog[hook;w1]`, `inline-the-rules[hook;w1]`, `local-llm-hook-judge[hook+llm;w2]`, `prose-exams[hook;w1]`, `protocol-model-dependency[hook;w1]`, `rule-ladder[hook;w1]`, `sem-blast-radius[hook;w1]`, `vendor-benefit[llm;w1]`
- generic-only neighbors：`absorb-awesome-list`, `agent-tool-reach`, `check-my-stack`, `code-search-adoption`, `deep-research-rate-limit`, `exit-0-illusion`, `gpt-review-tunnel-vision`, `keep-the-wiki-alive`, `matt-philosophy`, `measure-revealed-adoption`, `memory-cap-reframe`, `model-routing`, `one-model-not-enough`, `proxy-warmup-cost`, `retire-vector-memory`, `sol-overimplementation`, `spec-review-round`, `steal-determinism-layer`, `subagent-boot-cost`, `token-saving-tools`, `trial-review-system`, `unattended-workflow-resume`, `websearch-misses-official-docs`, `workflow-vs-skill`（全為 `claude-code;w1`）

### `code-search-adoption` — 裝了一堆 codebase 搜尋工具，agent 幾乎都不用
- current tags：`claude-code`, `mcp`, `code-search`, `tool-adoption`
- all degree：37/39；meaningful degree：9/39
- meaningful neighbors：`agent-tool-reach[code-search+mcp;w2]`, `bumblebee-still-on-disk[tool-adoption;w1]`, `dcg-safety-lock[tool-adoption;w1]`, `measure-revealed-adoption[tool-adoption;w1]`, `retire-vector-memory[tool-adoption;w1]`, `sem-blast-radius[tool-adoption;w1]`, `steal-determinism-layer[tool-adoption;w1]`, `token-saving-tools[mcp+tool-adoption;w2]`, `trial-review-system[tool-adoption;w1]`
- generic-only neighbors：`absorb-awesome-list`, `cc-vendor-swap`, `check-my-stack`, `checker-layoff`, `deep-research-rate-limit`, `exit-0-illusion`, `gpt-in-cc`, `gpt-in-cc-performance`, `gpt-review-tunnel-vision`, `hook-watchdog`, `inline-the-rules`, `keep-the-wiki-alive`, `local-llm-hook-judge`, `matt-philosophy`, `memory-cap-reframe`, `model-routing`, `one-model-not-enough`, `prose-exams`, `protocol-model-dependency`, `proxy-warmup-cost`, `rule-ladder`, `sol-overimplementation`, `spec-review-round`, `subagent-boot-cost`, `unattended-workflow-resume`, `vendor-benefit`, `websearch-misses-official-docs`, `workflow-vs-skill`（全為 `claude-code;w1`）

### `dcg-safety-lock` — 防得了失誤，防不住意圖：給 AI 的 shell 裝一把鎖
- current tags：`claude-code`, `hook`, `security`, `tooling`, `tool-adoption`
- all degree：37/39；meaningful degree：15/39
- meaningful neighbors：`bumblebee-still-on-disk[security+tool-adoption;w2]`, `checker-layoff[hook;w1]`, `code-search-adoption[tool-adoption;w1]`, `hook-watchdog[hook;w1]`, `inline-the-rules[hook;w1]`, `local-llm-hook-judge[hook;w1]`, `measure-revealed-adoption[tool-adoption;w1]`, `prose-exams[hook;w1]`, `protocol-model-dependency[hook;w1]`, `retire-vector-memory[tool-adoption;w1]`, `rule-ladder[hook;w1]`, `sem-blast-radius[hook+tool-adoption+tooling;w3]`, `steal-determinism-layer[tool-adoption;w1]`, `token-saving-tools[tool-adoption;w1]`, `trial-review-system[tool-adoption;w1]`
- generic-only neighbors：`absorb-awesome-list`, `agent-tool-reach`, `cc-vendor-swap`, `check-my-stack`, `deep-research-rate-limit`, `exit-0-illusion`, `gpt-in-cc`, `gpt-in-cc-performance`, `gpt-review-tunnel-vision`, `keep-the-wiki-alive`, `matt-philosophy`, `memory-cap-reframe`, `model-routing`, `one-model-not-enough`, `proxy-warmup-cost`, `sol-overimplementation`, `spec-review-round`, `subagent-boot-cost`, `unattended-workflow-resume`, `vendor-benefit`, `websearch-misses-official-docs`, `workflow-vs-skill`（全為 `claude-code;w1`）

### `deep-research-rate-limit` — 官方 deep-research workflow，我用 Opus 跑一次掛一次
- current tags：`claude-code`, `workflow`, `deep-research`
- all degree：36/39；meaningful degree：6/39
- meaningful neighbors：`absorb-awesome-list`, `one-model-not-enough`, `prose-exams`, `trial-review-system`, `unattended-workflow-resume`, `workflow-vs-skill`（全為 `workflow;w1`）
- generic-only neighbors：`agent-tool-reach`, `cc-vendor-swap`, `check-my-stack`, `checker-layoff`, `code-search-adoption`, `dcg-safety-lock`, `exit-0-illusion`, `gpt-in-cc`, `gpt-in-cc-performance`, `gpt-review-tunnel-vision`, `hook-watchdog`, `inline-the-rules`, `keep-the-wiki-alive`, `local-llm-hook-judge`, `matt-philosophy`, `measure-revealed-adoption`, `memory-cap-reframe`, `model-routing`, `protocol-model-dependency`, `proxy-warmup-cost`, `retire-vector-memory`, `rule-ladder`, `sem-blast-radius`, `sol-overimplementation`, `spec-review-round`, `steal-determinism-layer`, `subagent-boot-cost`, `token-saving-tools`, `vendor-benefit`, `websearch-misses-official-docs`（全為 `claude-code;w1`）

### `exit-0-illusion` — 為什麼我不再相信 Explore Agent 說他做完了
- current tags：`claude-code`, `subagent`, `fabrication`, `verify`
- all degree：36/39；meaningful degree：3/39
- meaningful neighbors：`hook-watchdog[verify;w1]`, `measure-revealed-adoption[subagent;w1]`, `subagent-boot-cost[subagent;w1]`
- generic-only neighbors：其餘 33 個 `claude-code` node，完整清單與 `claude-code;w1` 在 JSON `nodes[].generic_only_neighbors`

### `gpt-in-cc-performance` — 聽話，不代表懂你：GPT 接進 Claude Code 第二週的性格觀察
- current tags：`claude-code`, `vendor-swap`, `gpt`, `llm`, `model-behavior`
- all degree：36/39；meaningful degree：8/39
- meaningful neighbors：`cc-vendor-swap[llm+vendor-swap;w2]`, `checker-layoff[llm;w1]`, `gpt-in-cc[gpt+llm+vendor-swap;w3]`, `gpt-review-tunnel-vision[gpt;w1]`, `local-llm-hook-judge[llm;w1]`, `protocol-model-dependency[model-behavior;w1]`, `sol-overimplementation[gpt;w1]`, `vendor-benefit[llm+vendor-swap;w2]`
- generic-only neighbors：完整 28 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `gpt-in-cc` — 接得上，不代表合得來：把 GPT 接進 Claude Code 的三顆雷
- current tags：`claude-code`, `vendor-swap`, `gpt`, `llm`
- all degree：36/39；meaningful degree：7/39
- meaningful neighbors：`cc-vendor-swap[llm+vendor-swap;w2]`, `checker-layoff[llm;w1]`, `gpt-in-cc-performance[gpt+llm+vendor-swap;w3]`, `gpt-review-tunnel-vision[gpt;w1]`, `local-llm-hook-judge[llm;w1]`, `sol-overimplementation[gpt;w1]`, `vendor-benefit[llm+vendor-swap;w2]`
- generic-only neighbors：完整 29 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `gpt-review-tunnel-vision` — GPT 不是停不下來，是看不見停止線：Review 隧道視野與停止條件治理
- current tags：`claude-code`, `gpt`, `code-review`, `methodology`
- all degree：37/39；meaningful degree：6/39
- meaningful neighbors：`gpt-in-cc[gpt;w1]`, `gpt-in-cc-performance[gpt;w1]`, `one-model-not-enough[code-review;w1]`, `sem-blast-radius[code-review;w1]`, `sol-overimplementation[gpt;w1]`, `steal-determinism-layer[code-review;w1]`
- generic-only neighbors：完整 31 個鄰居與 shared generic tags / weight 列於 JSON `nodes[].generic_only_neighbors`

### `hook-watchdog` — AI 說做完不算數：拿證據來
- current tags：`claude-code`, `hook`, `automation`, `methodology`, `verify`
- all degree：37/39；meaningful degree：9/39
- meaningful neighbors：`checker-layoff[hook;w1]`, `dcg-safety-lock[hook;w1]`, `exit-0-illusion[verify;w1]`, `inline-the-rules[hook;w1]`, `local-llm-hook-judge[hook;w1]`, `prose-exams[hook;w1]`, `protocol-model-dependency[hook;w1]`, `rule-ladder[automation+hook;w2]`, `sem-blast-radius[hook;w1]`
- generic-only neighbors：完整 28 個鄰居與 shared generic tags / weight 列於 JSON `nodes[].generic_only_neighbors`

### `inline-the-rules` — 規則寫下來了，agent 真的有收到嗎
- current tags：`claude-code`, `memory`, `hook`, `methodology`
- all degree：37/39；meaningful degree：11/39
- meaningful neighbors：`checker-layoff[hook;w1]`, `dcg-safety-lock[hook;w1]`, `hook-watchdog[hook;w1]`, `keep-the-wiki-alive[memory;w1]`, `local-llm-hook-judge[hook;w1]`, `memory-cap-reframe[memory;w1]`, `prose-exams[hook;w1]`, `protocol-model-dependency[hook;w1]`, `retire-vector-memory[memory;w1]`, `rule-ladder[hook;w1]`, `sem-blast-radius[hook;w1]`
- generic-only neighbors：完整 26 個鄰居與 shared generic tags / weight 列於 JSON `nodes[].generic_only_neighbors`

### `keep-the-wiki-alive` — wiki 蓋好之後，讓它繼續活著才是真正的問題
- current tags：`claude-code`, `memory`, `knowledge-management`, `retrospective`
- all degree：36/39；meaningful degree：4/39
- meaningful neighbors：`inline-the-rules[memory;w1]`, `memory-cap-reframe[memory;w1]`, `retire-vector-memory[memory+retrospective;w2]`, `websearch-misses-official-docs[retrospective;w1]`
- generic-only neighbors：完整 32 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `local-llm-hook-judge` — 雲端太遠，hook 等不了：低延遲給了本地小模型就業機會
- current tags：`claude-code`, `local-llm`, `hook`, `llm`
- all degree：36/39；meaningful degree：12/39
- meaningful neighbors：`cc-vendor-swap[llm;w1]`, `checker-layoff[hook+llm;w2]`, `dcg-safety-lock[hook;w1]`, `gpt-in-cc[llm;w1]`, `gpt-in-cc-performance[llm;w1]`, `hook-watchdog[hook;w1]`, `inline-the-rules[hook;w1]`, `prose-exams[hook;w1]`, `protocol-model-dependency[hook;w1]`, `rule-ladder[hook;w1]`, `sem-blast-radius[hook;w1]`, `vendor-benefit[llm;w1]`
- generic-only neighbors：完整 24 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `matt-philosophy` — 半年 20 萬星的祕密是「少」：Matt Pocock 的哲學，我信六條、不信一條
- current tags：`claude-code`, `skill`, `matt-pocock`, `philosophy`
- all degree：36/39；meaningful degree：2/39
- meaningful neighbors：`prose-exams[skill;w1]`, `workflow-vs-skill[skill;w1]`
- generic-only neighbors：完整 34 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `measure-revealed-adoption` — 嘴上說想要，但 agent 根本沒在用
- current tags：`claude-code`, `tool-adoption`, `subagent`, `methodology`, `revealed-preference`
- all degree：38/39；meaningful degree：10/39
- meaningful neighbors：`bumblebee-still-on-disk[tool-adoption;w1]`, `code-search-adoption[tool-adoption;w1]`, `dcg-safety-lock[tool-adoption;w1]`, `exit-0-illusion[subagent;w1]`, `retire-vector-memory[tool-adoption;w1]`, `sem-blast-radius[tool-adoption;w1]`, `steal-determinism-layer[tool-adoption;w1]`, `subagent-boot-cost[subagent;w1]`, `token-saving-tools[tool-adoption;w1]`, `trial-review-system[tool-adoption;w1]`
- generic-only neighbors：完整 28 個鄰居與 shared generic tags / weight 列於 JSON `nodes[].generic_only_neighbors`

### `memory-cap-reframe` — MEMORY.md 只有 25KB，要當目錄用、別當倉庫塞
- current tags：`claude-code`, `memory`, `auto-memory`
- all degree：36/39；meaningful degree：3/39
- meaningful neighbors：`inline-the-rules[memory;w1]`, `keep-the-wiki-alive[memory;w1]`, `retire-vector-memory[memory;w1]`
- generic-only neighbors：完整 33 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `model-routing` — 最強模型不是每件事都該用：配額逼我重劃 AI 分工
- current tags：`claude-code`, `model-routing`, `quota`, `methodology`
- all degree：37/39；meaningful degree：1/39
- meaningful neighbors：`subagent-boot-cost[model-routing;w1]`
- generic-only neighbors：完整 36 個鄰居與 shared generic tags / weight 列於 JSON `nodes[].generic_only_neighbors`

### `one-model-not-enough` — 一個模型不夠：五軸交叉審的 code review 工作流
- current tags：`claude-code`, `code-review`, `multi-model`, `workflow`
- all degree：36/39；meaningful degree：9/39
- meaningful neighbors：`absorb-awesome-list[workflow;w1]`, `deep-research-rate-limit[workflow;w1]`, `gpt-review-tunnel-vision[code-review;w1]`, `prose-exams[workflow;w1]`, `sem-blast-radius[code-review;w1]`, `steal-determinism-layer[code-review;w1]`, `trial-review-system[workflow;w1]`, `unattended-workflow-resume[workflow;w1]`, `workflow-vs-skill[workflow;w1]`
- generic-only neighbors：完整 27 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `prose-exams` — skill 也要有考卷：我給 skill 上了回歸測試
- current tags：`claude-code`, `testing`, `workflow`, `methodology`, `skill`, `hook`
- all degree：37/39；meaningful degree：15/39
- meaningful neighbors：`absorb-awesome-list[workflow;w1]`, `checker-layoff[hook;w1]`, `dcg-safety-lock[hook;w1]`, `deep-research-rate-limit[workflow;w1]`, `hook-watchdog[hook;w1]`, `inline-the-rules[hook;w1]`, `local-llm-hook-judge[hook;w1]`, `matt-philosophy[skill;w1]`, `one-model-not-enough[workflow;w1]`, `protocol-model-dependency[hook;w1]`, `rule-ladder[hook;w1]`, `sem-blast-radius[hook;w1]`, `trial-review-system[workflow;w1]`, `unattended-workflow-resume[workflow;w1]`, `workflow-vs-skill[skill+workflow;w2]`
- generic-only neighbors：完整 22 個鄰居與 shared generic tags / weight 列於 JSON `nodes[].generic_only_neighbors`

### `protocol-model-dependency` — 我以為 Opus 沒遇到麻煩，後來發現是它根本沒在報
- current tags：`claude-code`, `hook`, `model-behavior`
- all degree：36/39；meaningful degree：9/39
- meaningful neighbors：`checker-layoff[hook;w1]`, `dcg-safety-lock[hook;w1]`, `gpt-in-cc-performance[model-behavior;w1]`, `hook-watchdog[hook;w1]`, `inline-the-rules[hook;w1]`, `local-llm-hook-judge[hook;w1]`, `prose-exams[hook;w1]`, `rule-ladder[hook;w1]`, `sem-blast-radius[hook;w1]`
- generic-only neighbors：完整 27 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `proxy-warmup-cost` — 省 token 工具說能省多少，扣掉暖機費後才算數
- current tags：`claude-code`, `token-optimization`, `prompt-caching`, `proxy`, `cost-analysis`
- all degree：36/39；meaningful degree：2/39
- meaningful neighbors：`subagent-boot-cost[token-optimization;w1]`, `token-saving-tools[token-optimization;w1]`
- generic-only neighbors：完整 34 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `retire-vector-memory` — 我把自己裝的向量記憶砍掉了——928 次寫入換來 3 次搜尋
- current tags：`claude-code`, `memory`, `vector-db`, `retrospective`, `tool-adoption`
- all degree：37/39；meaningful degree：12/39
- meaningful neighbors：`bumblebee-still-on-disk[tool-adoption;w1]`, `code-search-adoption[tool-adoption;w1]`, `dcg-safety-lock[tool-adoption;w1]`, `inline-the-rules[memory;w1]`, `keep-the-wiki-alive[memory+retrospective;w2]`, `measure-revealed-adoption[tool-adoption;w1]`, `memory-cap-reframe[memory;w1]`, `sem-blast-radius[tool-adoption;w1]`, `steal-determinism-layer[tool-adoption;w1]`, `token-saving-tools[tool-adoption;w1]`, `trial-review-system[tool-adoption;w1]`, `websearch-misses-official-docs[retrospective;w1]`
- generic-only neighbors：完整 25 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `rule-ladder` — 不是每條規矩都要寫成 hook：從一句話到硬攔截的四層階梯
- current tags：`claude-code`, `hook`, `ai-agent`, `automation`, `methodology`
- all degree：37/39；meaningful degree：9/39
- meaningful neighbors：`checker-layoff[hook;w1]`, `dcg-safety-lock[hook;w1]`, `hook-watchdog[automation+hook;w2]`, `inline-the-rules[hook;w1]`, `local-llm-hook-judge[hook;w1]`, `prose-exams[hook;w1]`, `protocol-model-dependency[hook;w1]`, `sem-blast-radius[hook;w1]`, `subagent-boot-cost[ai-agent;w1]`
- generic-only neighbors：完整 28 個鄰居與 shared generic tags / weight 列於 JSON `nodes[].generic_only_neighbors`

### `sem-blast-radius` — AI 只拿得到 diff：我用 sem 補上改動影響面
- current tags：`claude-code`, `hook`, `code-review`, `tooling`, `tool-adoption`
- all degree：37/39；meaningful degree：17/39
- meaningful neighbors：`bumblebee-still-on-disk[tool-adoption;w1]`, `checker-layoff[hook;w1]`, `code-search-adoption[tool-adoption;w1]`, `dcg-safety-lock[hook+tool-adoption+tooling;w3]`, `gpt-review-tunnel-vision[code-review;w1]`, `hook-watchdog[hook;w1]`, `inline-the-rules[hook;w1]`, `local-llm-hook-judge[hook;w1]`, `measure-revealed-adoption[tool-adoption;w1]`, `one-model-not-enough[code-review;w1]`, `prose-exams[hook;w1]`, `protocol-model-dependency[hook;w1]`, `retire-vector-memory[tool-adoption;w1]`, `rule-ladder[hook;w1]`, `steal-determinism-layer[code-review+tool-adoption;w2]`, `token-saving-tools[tool-adoption;w1]`, `trial-review-system[tool-adoption;w1]`
- generic-only neighbors：完整 20 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `sol-overimplementation` — GPT-5.6 Sol 沒做錯，卻做了 7,700 行我不需要的東西
- current tags：`claude-code`, `gpt`, `methodology`
- all degree：37/39；meaningful degree：3/39
- meaningful neighbors：`gpt-in-cc[gpt;w1]`, `gpt-in-cc-performance[gpt;w1]`, `gpt-review-tunnel-vision[gpt;w1]`
- generic-only neighbors：完整 34 個鄰居與 shared generic tags / weight 列於 JSON `nodes[].generic_only_neighbors`

### `spec-review-round` — 工作能外包給 AI，決策不能
- current tags：`claude-code`, `spec-review`, `ai-workflow`, `methodology`
- all degree：37/39；meaningful degree：1/39
- meaningful neighbors：`ai-report-two-lies[ai-workflow;w1]`
- generic-only neighbors：完整 36 個鄰居與 shared generic tags / weight 列於 JSON `nodes[].generic_only_neighbors`

### `steal-determinism-layer` — 偷確定性層：否決整套 AI 工具後，還能帶走什麼
- current tags：`claude-code`, `tool-adoption`, `code-review`, `methodology`
- all degree：38/39；meaningful degree：10/39
- meaningful neighbors：`bumblebee-still-on-disk[tool-adoption;w1]`, `code-search-adoption[tool-adoption;w1]`, `dcg-safety-lock[tool-adoption;w1]`, `gpt-review-tunnel-vision[code-review;w1]`, `measure-revealed-adoption[tool-adoption;w1]`, `one-model-not-enough[code-review;w1]`, `retire-vector-memory[tool-adoption;w1]`, `sem-blast-radius[code-review+tool-adoption;w2]`, `token-saving-tools[tool-adoption;w1]`, `trial-review-system[tool-adoption;w1]`
- generic-only neighbors：完整 28 個鄰居與 shared generic tags / weight 列於 JSON `nodes[].generic_only_neighbors`

### `subagent-boot-cost` — 派一個 agent 出去，先付一筆看不見的開機費
- current tags：`claude-code`, `subagent`, `token-optimization`, `model-routing`, `ai-agent`
- all degree：36/39；meaningful degree：6/39
- meaningful neighbors：`exit-0-illusion[subagent;w1]`, `measure-revealed-adoption[subagent;w1]`, `model-routing[model-routing;w1]`, `proxy-warmup-cost[token-optimization;w1]`, `rule-ladder[ai-agent;w1]`, `token-saving-tools[token-optimization;w1]`
- generic-only neighbors：完整 30 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `test-theater` — AI 寫的測試全綠，但可能什麼都沒測
- current tags：`mutation-testing`, `Stryker`, `ai-testing`, `test-theater`
- all degree：0/39；meaningful degree：0/39；degree 0（只記錄，不判錯）
- meaningful neighbors：—
- generic-only neighbors：—

### `token-saving-tools` — 省 token 工具：省不了多少，但風險不小
- current tags：`claude-code`, `token-optimization`, `mcp`, `tool-evaluation`, `tool-adoption`
- all degree：37/39；meaningful degree：13/39
- meaningful neighbors：`absorb-awesome-list[tool-evaluation;w1]`, `agent-tool-reach[mcp+tool-evaluation;w2]`, `bumblebee-still-on-disk[tool-adoption;w1]`, `check-my-stack[tool-evaluation;w1]`, `code-search-adoption[mcp+tool-adoption;w2]`, `dcg-safety-lock[tool-adoption;w1]`, `measure-revealed-adoption[tool-adoption;w1]`, `proxy-warmup-cost[token-optimization;w1]`, `retire-vector-memory[tool-adoption;w1]`, `sem-blast-radius[tool-adoption;w1]`, `steal-determinism-layer[tool-adoption;w1]`, `subagent-boot-cost[token-optimization;w1]`, `trial-review-system[tool-adoption;w1]`
- generic-only neighbors：完整 24 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `trial-review-system` — 裝工具很容易，結案才是工作：我的 AI 工具試用回顧制度
- current tags：`claude-code`, `methodology`, `tool-adoption`, `workflow`
- all degree：38/39；meaningful degree：14/39
- meaningful neighbors：`absorb-awesome-list[workflow;w1]`, `bumblebee-still-on-disk[tool-adoption;w1]`, `code-search-adoption[tool-adoption;w1]`, `dcg-safety-lock[tool-adoption;w1]`, `deep-research-rate-limit[workflow;w1]`, `measure-revealed-adoption[tool-adoption;w1]`, `one-model-not-enough[workflow;w1]`, `prose-exams[workflow;w1]`, `retire-vector-memory[tool-adoption;w1]`, `sem-blast-radius[tool-adoption;w1]`, `steal-determinism-layer[tool-adoption;w1]`, `token-saving-tools[tool-adoption;w1]`, `unattended-workflow-resume[workflow;w1]`, `workflow-vs-skill[workflow;w1]`
- generic-only neighbors：完整 24 個鄰居與 shared generic tags / weight 列於 JSON `nodes[].generic_only_neighbors`

### `unattended-workflow-resume` — 讓額度不大的帳號，也能掛機過夜跑完大型研究 workflow
- current tags：`claude-code`, `workflow`, `workflow-resume`
- all degree：36/39；meaningful degree：6/39
- meaningful neighbors：`absorb-awesome-list`, `deep-research-rate-limit`, `one-model-not-enough`, `prose-exams`, `trial-review-system`, `workflow-vs-skill`（全為 `workflow;w1`）
- generic-only neighbors：完整 30 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `vendor-benefit` — Claude Code 換第三方模型，換到的是有條件的韌性
- current tags：`claude-code`, `vendor-swap`, `llm`
- all degree：36/39；meaningful degree：5/39
- meaningful neighbors：`cc-vendor-swap[llm+vendor-swap;w2]`, `checker-layoff[llm;w1]`, `gpt-in-cc[llm+vendor-swap;w2]`, `gpt-in-cc-performance[llm+vendor-swap;w2]`, `local-llm-hook-judge[llm;w1]`
- generic-only neighbors：完整 31 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `websearch-misses-official-docs` — AI 說它查過官方文件，但它沒有
- current tags：`claude-code`, `websearch`, `fact-check`, `retrospective`
- all degree：36/39；meaningful degree：2/39
- meaningful neighbors：`keep-the-wiki-alive[retrospective;w1]`, `retire-vector-memory[retrospective;w1]`
- generic-only neighbors：完整 34 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

### `workflow-vs-skill` — ultracode workflow，別跑完就丟
- current tags：`claude-code`, `workflow`, `skill`
- all degree：36/39；meaningful degree：7/39
- meaningful neighbors：`absorb-awesome-list[workflow;w1]`, `deep-research-rate-limit[workflow;w1]`, `matt-philosophy[skill;w1]`, `one-model-not-enough[workflow;w1]`, `prose-exams[skill+workflow;w2]`, `trial-review-system[workflow;w1]`, `unattended-workflow-resume[workflow;w1]`
- generic-only neighbors：完整 29 個 `claude-code;w1` 鄰居列於 JSON `nodes[].generic_only_neighbors`

## Edge manifest 說明

- 完整 687 條 all edge 在 `actual-tag-graph.json` 的 `all_edges`。每條含 `source`、`target`、`shared_tags`、`generic_tags`、`specific_tags`、`classification`、`weight`。
- 完整 144 條 meaningful edge 在同檔的 `meaningful_edges`。每條含只放 specific tag 的 `shared_tags`、完整交集 `all_shared_tags`、`source_classification` 與 meaningful `weight`。
- `classification`：`generic-only` 代表 shared tags 全為 generic；`specific` 代表 shared tags 無 generic；`mixed` 代表兩類都有。
- edge 依來源檔名排序形成無向 pair；陣列與 tag 也固定排序，方便重跑與 diff。
- JSON `nodes` 保存 40 篇 article layer；`tags` 保存 54 個 registry definition 與 tag 指標；`metrics` 保存 receipt、兩張圖、generic 敏感度與來源 digest；`high_overlap_tag_pairs` 保存兩個候選。

## Deterministic 重算

以下唯讀 kernel 從第一手來源重建兩張圖與各層資料，再與 JSON exact assert。它透過 Node `--experimental-strip-types` 載入 TypeScript registry 與 topic groups，不寫入任何檔案。

在 repo root 執行：

```bash
set -o pipefail; python3 -c 'from pathlib import Path; text=Path(".scratch/tag-relationship-audit/actual-tag-graph.md").read_text(); section=text.rsplit("<!-- deterministic-audit-kernel:start -->",1)[1].split("<!-- deterministic-audit-kernel:end -->",1)[0]; print(section.split("```python\n",1)[1].rsplit("\n```",1)[0])' | PYTHONDONTWRITEBYTECODE=1 python3 -
```

<!-- deterministic-audit-kernel:start -->
```python
from collections import Counter, deque
from itertools import combinations
from pathlib import Path
import hashlib
import json
import math
import subprocess

root = Path.cwd()
brief_path = root / ".scratch/tag-relationship-audit/brief.md"
blog_path = root / "src/content/blog"
registry_path = root / "src/data/tag-registry.ts"
topic_groups_path = root / "src/data/topic-groups.ts"
artifact_path = root / ".scratch/tag-relationship-audit/actual-tag-graph.json"
generic_tags = {"claude-code", "methodology"}
required_fields = {"title", "description", "pubDate", "tags"}


def require(condition, message):
  if not condition:
    raise RuntimeError(message)


def canonical(value):
  return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)


def exact(name, actual, expected):
  if canonical(actual) != canonical(expected):
    raise RuntimeError(f"{name} mismatch")


def parse_value(value):
  value = value.strip()
  if value.startswith('"') or value.startswith("["):
    return json.loads(value)
  return value


def parse_frontmatter(path):
  text = path.read_text()
  require(text.startswith("---\n"), f"frontmatter start missing: {path.name}")
  end = text.find("\n---\n", 4)
  require(end != -1, f"frontmatter end missing: {path.name}")
  values = {}
  for line in text[4:end].splitlines():
    key, value = line.split(":", 1)
    values[key] = parse_value(value)
  return values


def load_typescript_sources():
  registry_url = json.dumps(registry_path.as_uri())
  topic_groups_url = json.dumps(topic_groups_path.as_uri())
  source = (
    f'import {{ canonicalTagRegistry }} from {registry_url};'
    f'import {{ topicGroups }} from {topic_groups_url};'
    'process.stdout.write(JSON.stringify({registry:canonicalTagRegistry.entries,topicGroups}));'
  )
  result = subprocess.run(
    ["node", "--experimental-strip-types", "--input-type=module", "-e", source],
    check=True,
    capture_output=True,
    text=True,
  )
  return json.loads(result.stdout)


def topic_ids(tags, topic_groups):
  values = set(tags)
  return [group["id"] for group in topic_groups if values.intersection(group["tags"])]


def component_data(slugs, edges):
  graph = {slug: set() for slug in slugs}
  for edge in edges:
    graph[edge["source"]].add(edge["target"])
    graph[edge["target"]].add(edge["source"])
  seen = set()
  components = []
  for start in slugs:
    if start in seen:
      continue
    queue = deque([start])
    seen.add(start)
    component = []
    while queue:
      node = queue.popleft()
      component.append(node)
      for neighbor in graph[node]:
        if neighbor not in seen:
          seen.add(neighbor)
          queue.append(neighbor)
    components.append(component)
  components.sort(key=lambda values: (-len(values), sorted(values)))
  return [len(values) for values in components], [values[0] for values in components if len(values) == 1]


def graph_metrics(slugs, edges, pair_denominator):
  component_sizes, isolated_nodes = component_data(slugs, edges)
  weights = Counter(edge["weight"] for edge in edges)
  return {
    "edge_count": len(edges),
    "non_edge_count": pair_denominator - len(edges),
    "degree_sum": len(edges) * 2,
    "average_degree": round(len(edges) * 2 / len(slugs), 12),
    "component_count": len(component_sizes),
    "component_sizes": component_sizes,
    "isolated_nodes": isolated_nodes,
    "weight_distribution": {str(weight): weights[weight] for weight in sorted(weights)},
  }


def filtered_graph(articles, excluded_tags):
  edges = []
  for source, target in combinations(articles, 2):
    shared_tags = sorted((set(source["tags"]) & set(target["tags"])) - excluded_tags)
    if shared_tags:
      edges.append({"source": source["slug"], "target": target["slug"], "weight": len(shared_tags)})
  return edges


source_data = load_typescript_sources()
registry_entries = source_data["registry"]
topic_groups = source_data["topicGroups"]
registry = {entry["id"]: entry for entry in registry_entries}
paths = sorted(blog_path.glob("*.md"))
articles = []
missing_required_fields = 0
empty_tags = 0
duplicate_per_article_tags = []
for path in paths:
  frontmatter = parse_frontmatter(path)
  missing_required_fields += len(required_fields - set(frontmatter))
  tags = frontmatter.get("tags", [])
  empty_tags += int(not tags)
  if len(tags) != len(set(tags)):
    duplicate_per_article_tags.append(path.stem)
  articles.append({
    "slug": path.stem,
    "title": frontmatter.get("title"),
    "description": frontmatter.get("description"),
    "pubDate": str(frontmatter.get("pubDate")),
    "tags": tags,
  })

slugs = [article["slug"] for article in articles]
article_by_slug = {article["slug"]: article for article in articles}
used_tags = sorted({tag for article in articles for tag in article["tags"]})
pair_denominator = math.comb(len(articles), 2)
all_edges = []
meaningful_edges = []
all_degrees = Counter()
meaningful_degrees = Counter()
meaningful_neighbors = {slug: [] for slug in slugs}
generic_only_neighbors = {slug: [] for slug in slugs}

for source, target in combinations(articles, 2):
  shared_tags = sorted(set(source["tags"]) & set(target["tags"]))
  if not shared_tags:
    continue
  shared_generic = sorted(set(shared_tags) & generic_tags)
  shared_specific = sorted(set(shared_tags) - generic_tags)
  classification = "mixed" if shared_generic and shared_specific else "generic-only" if shared_generic else "specific"
  edge = {
    "source": source["slug"],
    "target": target["slug"],
    "shared_tags": shared_tags,
    "generic_tags": shared_generic,
    "specific_tags": shared_specific,
    "classification": classification,
    "weight": len(shared_tags),
  }
  all_edges.append(edge)
  all_degrees.update([source["slug"], target["slug"]])
  if shared_specific:
    meaningful_edge = {
      "source": source["slug"],
      "target": target["slug"],
      "shared_tags": shared_specific,
      "all_shared_tags": shared_tags,
      "source_classification": classification,
      "weight": len(shared_specific),
    }
    meaningful_edges.append(meaningful_edge)
    meaningful_degrees.update([source["slug"], target["slug"]])
    meaningful_neighbors[source["slug"]].append({"slug": target["slug"], "shared_tags": shared_specific, "weight": len(shared_specific)})
    meaningful_neighbors[target["slug"]].append({"slug": source["slug"], "shared_tags": shared_specific, "weight": len(shared_specific)})
  else:
    generic_only_neighbors[source["slug"]].append({"slug": target["slug"], "shared_tags": shared_generic, "weight": len(shared_generic)})
    generic_only_neighbors[target["slug"]].append({"slug": source["slug"], "shared_tags": shared_generic, "weight": len(shared_generic)})

for values in meaningful_neighbors.values():
  values.sort(key=lambda value: value["slug"])
for values in generic_only_neighbors.values():
  values.sort(key=lambda value: value["slug"])

nodes = []
for article in articles:
  slug = article["slug"]
  nodes.append({
    "slug": slug,
    "title": article["title"],
    "pub_date": article["pubDate"],
    "current_tags": article["tags"],
    "topic_groups": topic_ids(article["tags"], topic_groups),
    "all_degree": all_degrees[slug],
    "meaningful_degree": meaningful_degrees[slug],
    "meaningful_neighbors": meaningful_neighbors[slug],
    "generic_only_neighbors": generic_only_neighbors[slug],
  })

tag_articles = {
  tag: sorted(article["slug"] for article in articles if tag in article["tags"])
  for tag in used_tags
}
tags = []
for tag in used_tags:
  neighbors = tag_articles[tag]
  residuals = []
  sole_edge_pair_count = 0
  for source_slug, target_slug in combinations(neighbors, 2):
    source_tags = set(article_by_slug[source_slug]["tags"]) - {tag}
    target_tags = set(article_by_slug[target_slug]["tags"]) - {tag}
    union = source_tags | target_tags
    residuals.append(len(source_tags & target_tags) / len(union) if union else 1.0)
    sole_edge_pair_count += int(set(article_by_slug[source_slug]["tags"]) & set(article_by_slug[target_slug]["tags"]) == {tag})
  group_hits = []
  for slug in neighbors:
    remaining_tags = [value for value in article_by_slug[slug]["tags"] if value != tag]
    group_hits.append(topic_ids(remaining_tags, topic_groups))
  topic_group_spread = {}
  for group in topic_groups:
    count = sum(group["id"] in values for values in group_hits)
    if count:
      topic_group_spread[group["id"]] = count
  topic_group_spread["ungrouped"] = sum(not values for values in group_hits)
  count = len(neighbors)
  formed_edge_count = math.comb(count, 2)
  tags.append({
    "id": tag,
    "registry_definition": {
      "meaning": registry[tag]["meaning"],
      "boundary": registry[tag]["boundary"],
    },
    "article_count": count,
    "formed_edge_count": formed_edge_count,
    "coverage": round(count / len(articles), 12),
    "pair_coverage": round(formed_edge_count / pair_denominator, 12),
    "is_generic": tag in generic_tags,
    "information_bits": round(math.log2(len(articles) / count), 12),
    "residual_tag_jaccard": round(sum(residuals) / len(residuals), 12) if residuals else None,
    "sole_edge_pair_count": sole_edge_pair_count,
    "neighbor_articles": neighbors,
    "topic_group_spread": topic_group_spread,
  })

high_overlap_tag_pairs = []
for tag_a, tag_b in combinations(used_tags, 2):
  articles_a = set(tag_articles[tag_a])
  articles_b = set(tag_articles[tag_b])
  shared_articles = sorted(articles_a & articles_b)
  union_count = len(articles_a | articles_b)
  neighbor_set_jaccard = len(shared_articles) / union_count
  if len(shared_articles) >= 2 and neighbor_set_jaccard >= 2 / 3:
    high_overlap_tag_pairs.append({
      "tag_a": tag_a,
      "tag_b": tag_b,
      "intersection_count": len(shared_articles),
      "union_count": union_count,
      "neighbor_set_jaccard": round(neighbor_set_jaccard, 12),
      "shared_articles": shared_articles,
      "status": "可能近義碎裂",
      "merge_decision": "未判定",
    })

unknown_tags = sorted(set(used_tags) - set(registry))
unused_registry_tags = sorted(set(registry) - set(used_tags))
duplicate_slugs = sorted(slug for slug, count in Counter(slugs).items() if count > 1)
duplicate_titles = sorted(title for title, count in Counter(article["title"] for article in articles).items() if count > 1)
receipt = {
  "parsed_articles": len(articles),
  "expected_articles": len(paths),
  "tag_assignments": sum(len(article["tags"]) for article in articles),
  "used_tags": len(used_tags),
  "registry_tags": len(registry),
  "pair_denominator": pair_denominator,
  "all_edges": len(all_edges),
  "all_non_edges": pair_denominator - len(all_edges),
  "meaningful_edges": len(meaningful_edges),
  "meaningful_non_edges": pair_denominator - len(meaningful_edges),
  "missing_required_fields": missing_required_fields,
  "empty_tags": empty_tags,
  "unknown_tags": unknown_tags,
  "unused_registry_tags": unused_registry_tags,
  "duplicate_slugs": duplicate_slugs,
  "duplicate_titles": duplicate_titles,
  "duplicate_per_article_tags": duplicate_per_article_tags,
}
all_graph = graph_metrics(slugs, all_edges, pair_denominator)
meaningful_graph = graph_metrics(slugs, meaningful_edges, pair_denominator)
all_edge_classification = {
  key: Counter(edge["classification"] for edge in all_edges)[key]
  for key in ["generic-only", "mixed", "specific"]
}
generic_sensitivity = []
for excluded in [{"claude-code"}, {"claude-code", "methodology"}]:
  filtered_edges = filtered_graph(articles, excluded)
  component_sizes, isolated_nodes = component_data(slugs, filtered_edges)
  generic_sensitivity.append({
    "excluded_generic_tags": sorted(excluded),
    "edge_count": len(filtered_edges),
    "component_count": len(component_sizes),
    "component_sizes": component_sizes,
  })

normalized_frontmatter = json.dumps(articles, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
source_digests = {
  "brief_sha256": hashlib.sha256(brief_path.read_bytes()).hexdigest(),
  "normalized_frontmatter_sha256": hashlib.sha256(normalized_frontmatter).hexdigest(),
  "normalized_frontmatter_method": "file-name sorted array; each parsed frontmatter adds slug and stringifies pubDate; JSON UTF-8 with sorted keys and compact separators",
  "tag_registry_sha256": hashlib.sha256(registry_path.read_bytes()).hexdigest(),
  "topic_groups_sha256": hashlib.sha256(topic_groups_path.read_bytes()).hexdigest(),
}

expected_receipt = {
  "parsed_articles": 40,
  "expected_articles": 40,
  "tag_assignments": 164,
  "used_tags": 54,
  "registry_tags": 54,
  "pair_denominator": 780,
  "all_edges": 687,
  "all_non_edges": 93,
  "meaningful_edges": 144,
  "meaningful_non_edges": 636,
  "missing_required_fields": 0,
  "empty_tags": 0,
  "unknown_tags": [],
  "unused_registry_tags": [],
  "duplicate_slugs": [],
  "duplicate_titles": [],
  "duplicate_per_article_tags": [],
}
expected_all_graph = {
  "edge_count": 687,
  "non_edge_count": 93,
  "degree_sum": 1374,
  "average_degree": 34.35,
  "component_count": 2,
  "component_sizes": [39, 1],
  "isolated_nodes": ["test-theater"],
  "weight_distribution": {"1": 487, "2": 171, "3": 26, "4": 3},
}
expected_meaningful_graph = {
  "edge_count": 144,
  "non_edge_count": 636,
  "degree_sum": 288,
  "average_degree": 7.2,
  "component_count": 3,
  "component_sizes": [37, 2, 1],
  "isolated_nodes": ["test-theater"],
  "weight_distribution": {"1": 128, "2": 14, "3": 2},
}
expected_all_edge_classification = {"generic-only": 543, "mixed": 136, "specific": 8}
expected_generic_sensitivity = [
  {
    "excluded_generic_tags": ["claude-code"],
    "edge_count": 219,
    "component_count": 2,
    "component_sizes": [39, 1],
  },
  {
    "excluded_generic_tags": ["claude-code", "methodology"],
    "edge_count": 144,
    "component_count": 3,
    "component_sizes": [37, 2, 1],
  },
]
expected_high_overlap_tag_pairs = [
  {
    "tag_a": "code-search",
    "tag_b": "mcp",
    "intersection_count": 2,
    "union_count": 3,
    "neighbor_set_jaccard": 0.666666666667,
    "shared_articles": ["agent-tool-reach", "code-search-adoption"],
    "status": "可能近義碎裂",
    "merge_decision": "未判定",
  },
  {
    "tag_a": "llm",
    "tag_b": "vendor-swap",
    "intersection_count": 4,
    "union_count": 6,
    "neighbor_set_jaccard": 0.666666666667,
    "shared_articles": ["cc-vendor-swap", "gpt-in-cc", "gpt-in-cc-performance", "vendor-benefit"],
    "status": "可能近義碎裂",
    "merge_decision": "未判定",
  },
]
expected_source_digests = {
  "brief_sha256": "e5adf9d4e5dfe6479063e7122abfb038c465070d7f3dfadd1a38ae1c8f2fbe55",
  "normalized_frontmatter_sha256": "37475e86a0caaedd44b8500581942ac87a3a9c4f4bc5643db056fcf057ec54fb",
  "normalized_frontmatter_method": "file-name sorted array; each parsed frontmatter adds slug and stringifies pubDate; JSON UTF-8 with sorted keys and compact separators",
  "tag_registry_sha256": "b040db76033a43a58ccfa3e90c64e4733ae9b2315d4bb73c1e49885d7d17e6ea",
  "topic_groups_sha256": "019ef493099627e2346785977df7acf4da0a6a5fd4b92f7324ae68bb5c078076",
}
formulas = {
  "pair_denominator": "C(40,2) = 40×39÷2 = 780",
  "formed_edge_count": "C(article_count,2)",
  "coverage": "article_count ÷ 40",
  "pair_coverage": "formed_edge_count ÷ 780",
  "information_bits": "log2(40 ÷ article_count)",
  "residual_tag_jaccard": "mean Jaccard of each in-tag article pair after removing the candidate tag",
  "all_edge_weight": "count(shared_tags)",
  "meaningful_edge_weight": "count(shared specific tags), generic tags excluded",
}
edge_policy = {
  "generic_tags": ["claude-code", "methodology"],
  "all_graph": "edge exists when any tag is shared",
  "meaningful_graph": "edge exists only when at least one shared tag is specific",
  "topic_groups": "metadata and diagnostic spread only; never create edges",
}
exact("receipt invariant", receipt, expected_receipt)
exact("all graph invariant", all_graph, expected_all_graph)
exact("meaningful graph invariant", meaningful_graph, expected_meaningful_graph)
exact("classification invariant", all_edge_classification, expected_all_edge_classification)
exact("generic sensitivity invariant", generic_sensitivity, expected_generic_sensitivity)
exact("high overlap invariant", high_overlap_tag_pairs, expected_high_overlap_tag_pairs)
exact("source digest invariant", source_digests, expected_source_digests)
expected_artifact = {
  "schema_version": 1,
  "audit_kind": "actual-tag-graph",
  "edge_policy": edge_policy,
  "nodes": nodes,
  "tags": tags,
  "all_edges": all_edges,
  "meaningful_edges": meaningful_edges,
  "metrics": {
    "formulas": formulas,
    "receipt": expected_receipt,
    "generic_tags": ["claude-code", "methodology"],
    "all_graph": expected_all_graph,
    "meaningful_graph": expected_meaningful_graph,
    "all_edge_classification": expected_all_edge_classification,
    "generic_sensitivity": expected_generic_sensitivity,
    "source_digests": expected_source_digests,
  },
  "high_overlap_tag_pairs": expected_high_overlap_tag_pairs,
}
artifact = json.loads(artifact_path.read_text())
exact("complete artifact", artifact, expected_artifact)
print(
  "ACTUAL_TAG_GRAPH_AUDIT_PASS"
  f" articles={len(articles)}"
  f" assignments={receipt['tag_assignments']}"
  f" used_tags={len(used_tags)}"
  f" registry_tags={len(registry)}"
  f" pairs={pair_denominator}"
  f" all_edges={len(all_edges)}"
  f" meaningful_edges={len(meaningful_edges)}"
  f" generic_only={all_edge_classification['generic-only']}"
  f" unknown={len(unknown_tags)}"
  f" unused={len(unused_registry_tags)}"
  f" brief_sha256={source_digests['brief_sha256']}"
)
```
<!-- deterministic-audit-kernel:end -->
