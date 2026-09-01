# Tag vocabulary audit

> 稽核範圍：40 篇 `src/content/blog/*.md`、`src/content.config.ts`、文章探索 spec、tag governance brainstorm，以及 `src/pages/index.astro` 的 `topicGroups`、搜尋與 tag 點擊邏輯。本文只提出語意裁決，不修改文章、code 或設定。
>
> 本文把「標準 tag」定義為穩定的資料 ID；「顯示名稱」另列在標準條目。這兩者目前尚未分層：首頁直接顯示 raw tag，但比對時只做 `trim().toLowerCase()`。因此下方 `current → proposed` 是詞彙層建議，不是可直接套用的遷移清單，必須先拍板 ID／顯示名稱是否分離。

## Executive summary

1. 目前共有 **40 篇文章、156 次 tag 指派、62 種精確 raw tag 字串，其中 40 種只出現一次**。singleton 沒有被當成缺陷；專名與邊界清楚的窄題大多保留為系列種子。計數方法與輸出見 [Coverage receipt](#coverage-receipt)。
2. 最大的閱讀路徑問題不是 tag 太多，而是 **tag 點擊其實是文字搜尋**：按下 tag 會把 raw 值塞進搜尋框，再對標題、摘要與 tag 做子字串比對。62 個 raw tag 中有 15 個的點擊結果不等於實際掛載文章，例如 `token` 是 1 篇指派卻命中 6 篇；`Claude Code` 是 6 篇指派卻命中 10 篇。來源：[index.astro:252-266](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L252-L266)、[index.astro:494-504](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L494-L504)、[index.astro:585-593](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L585-L593) 與 Evidence 的唯讀重算輸出。
3. 大小寫與資料正規化必須分開看。`MCP`／`mcp` 只有大小寫差，現有搜尋會合流；`Claude Code`／`claude-code` 還有空格與連字號差，現有正規化不會合流。建議資料 ID 用 `claude-code`、`mcp`，顯示名稱用 `Claude Code`、`MCP`。來源：[index.astro:91-100](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L91-L100)、[index.astro:288-298](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L288-L298)。
4. 可直接收斂的語意家族是 `hook/hooks`、`skill/skills`、`subagent/subagents`、`model-behavior/llm-behavior/model`、`token-optimization/token`；正文證明它們各自共享閱讀路徑。[rule-ladder.md:20-29](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L20-L29)、[workflow-vs-skill.md:28-40](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/workflow-vs-skill.md#L28-L40)、[protocol-model-dependency.md:22-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/protocol-model-dependency.md#L22-L42)、[token-saving-tools.md:16-48](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L16-L48)。`AI-agents`、`AI-testing`、`FFF`、`Stryker` 的小寫 ID 則是治理提案，必須等 ID／顯示名稱分離拍板後才遷移。
5. `methodology`、`retrospective`、`workflow`、`ai-workflow` 應保留，但必須縮清楚邊界：方法、事後回看、執行編排、AI／程式／人類的責任分配是四條不同路徑。`workflow` 的明確錯配是 `absorb-awesome-list.md` 與 `rule-ladder.md`；`prose-exams.md` 有考卷、gate 與收據流程，應保留 `workflow` 並新增 `skill`。來源：[absorb-awesome-list.md:23-35](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/absorb-awesome-list.md#L23-L35)、[rule-ladder.md:20-41](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L20-L41)、[prose-exams.md:45-69](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/prose-exams.md#L45-L69)。
6. `tooling`、`tool-evaluation`、`tool-adoption` 不應合併：`tooling` 串具名工具的接線與限制；`tool-evaluation` 串引入前的 stack-fit 與紙上否決；`tool-adoption` 串真實使用後的採用、留用或淘汰。現有錯配是 `absorb-awesome-list`、`agent-tool-reach`；dcg 與 sem 可同時帶 `tooling` 與 `tool-adoption`。來源：[absorb-awesome-list.md:23-35](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/absorb-awesome-list.md#L23-L35)、[agent-tool-reach.md:77-99](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L77-L99)、[dcg-safety-lock.md:20-28](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L20-L28)、[sem-blast-radius.md:16-51](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/sem-blast-radius.md#L16-L51)。
7. 六個首頁寬主題目前覆蓋 40／40 篇，沒有未分組文章，所以不建議重設分類。唯一明顯的顯示語意問題是 `Review`：其 13 篇還包含 `data-quality`、`security`、`supply-chain`、`fact-check` 與 `fabrication`，建議拍板是否改成「品質」。來源：[index.astro:13-89](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L13-L89) 與 Evidence 的全量歸屬輸出。

## 命名層級問題

### 大小寫

| 問題 | 實際 tag 與文章 | 判斷 | 來源 |
|---|---|---|---|
| 同一產品有兩種 raw 值 | `Claude Code`：`agent-tool-reach`、`measure-revealed-adoption`、`one-model-not-enough`、`protocol-model-dependency`、`steal-determinism-layer`、`test-theater`；`claude-code`：另 32 篇 | 資料 ID 統一為 `claude-code`，顯示名稱保留 `Claude Code`。`test-theater` 的正文不是 Claude Code 專屬，該篇直接移除，不做格式合併。 | 完整 file:line 見全量表；語意反例見 [test-theater.md:33-47](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L33-L47)、[test-theater.md:78-88](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L78-L88)。 |
| 同一縮寫大小寫不同 | `MCP`：[agent-tool-reach.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L5)；`mcp`：[code-search-adoption.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/code-search-adoption.md#L5)、[token-saving-tools.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L5) | 資料 ID 用 `mcp`，顯示名稱用 `MCP`。現有搜尋已因小寫化而合流，這是詞彙庫與可讀性問題，不是現行搜尋斷裂。 | [index.astro:91-100](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L91-L100)、Evidence 的點擊命中輸出。 |
| AI 前綴沒有一致政策 | `AI-agents`：[rule-ladder.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L5)、[subagent-boot-cost.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L5)；`AI-testing`：[test-theater.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L5)；`ai-workflow`：[ai-report-two-lies.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/ai-report-two-lies.md#L5)、[spec-review-round.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/spec-review-round.md#L5) | 三者語意不同，不合併；只統一 ID 為小寫 kebab-case，顯示名稱分別是 `AI agent`、`AI testing`、`AI workflow`。 | [rule-ladder.md:20-31](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L20-L31)、[test-theater.md:10-47](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L10-L47)、[ai-report-two-lies.md:16-20](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/ai-report-two-lies.md#L16-L20)。 |
| 專名與資料 ID 混用 | `FFF`：[agent-tool-reach.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L5)；`Stryker`：[test-theater.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L5) | 正文只能證明它們是專名；若拍板 ID／顯示名稱分離，才建議 ID 用 `fff`、`stryker`，顯示名稱保留官方大小寫。 | 專名語意：[agent-tool-reach.md:14-24](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L14-L24)、[test-theater.md:64-76](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L64-L76)；命名政策待 [需要使用者拍板](#需要使用者拍板)。 |

### 空格／連字號

- `Claude Code`／`claude-code` 是唯一同時跨空格與連字號的專名變體。首頁只小寫化，不會把空格與 `-` 視為同一字元；按 `Claude Code` 目前命中 10 篇，按 `claude-code` 命中 32 篇。這是實際閱讀路徑分裂，不只是格式偏好。來源：[index.astro:91-100](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L91-L100)、[index.astro:585-593](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L585-L593)。
- 其餘複合詞多採 kebab-case，先保留資料 ID 慣例，不做全站表面改名。若要讓讀者看到 `model behavior`、`tool adoption` 等自然文字，應由活詞彙表提供顯示名稱，而不是把資料 ID 與介面文案綁在同一字串。

### 單複數

| raw 家族 | 文章 | 裁決 | 來源 |
|---|---|---|---|
| `hook`／`hooks` | `hook` 7 篇；`hooks` 只在 [rule-ladder.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L5) | 合併到單數 `hook` | `rule-ladder` 把 hook 定義為規則階梯中的程式攔截層，與其他文章的 hook 是同一機制：[rule-ladder.md:20-29](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L20-L29)。 |
| `skill`／`skills` | [workflow-vs-skill.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/workflow-vs-skill.md#L5)、[matt-philosophy.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L5) | 合併到單數 `skill`；`prose-exams` 也加入此路徑 | 兩篇都討論 skill 作為可重用知識與流程載體：[workflow-vs-skill.md:28-40](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/workflow-vs-skill.md#L28-L40)、[matt-philosophy.md:20-46](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L20-L46)。 |
| `subagent`／`subagents` | `subagent`：[exit-0-illusion.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L5)、[measure-revealed-adoption.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L5)；`subagents`：[subagent-boot-cost.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L5) | 合併到單數 `subagent` | 三篇都以委派子 agent 的可靠性、採用率或成本為主線；複數沒有額外語意。[exit-0-illusion.md:10-18](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L10-L18)、[measure-revealed-adoption.md:22-32](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L22-L32)、[subagent-boot-cost.md:18-58](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L18-L58) |

現行子字串搜尋讓單數點擊常會吃到複數，反向卻不成立：`hook` 命中 9 篇、`hooks` 只命中 1 篇；`skill` 命中 4 篇、`skills` 只命中 1 篇；`subagent` 命中 3 篇、`subagents` 只命中 1 篇。這個不對稱來自搜尋實作，不應被誤認為詞彙設計。來源：Evidence 的 tag 點擊路徑重算。

### 近義詞

| 詞組 | 裁決 | 理由與反證 | 來源 |
|---|---|---|---|
| `model-behavior`／`llm-behavior`／`model` | 合併到 `model-behavior` | 前兩篇都在談不同模型如何執行同一治理層；`protocol-model-dependency` 的泛稱 `model` 沒有另開閱讀路徑。 | [gpt-in-cc-performance.md:16-30](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc-performance.md#L16-L30)、[protocol-model-dependency.md:22-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/protocol-model-dependency.md#L22-L42)。 |
| `token`／`token-optimization` | 合併到 `token-optimization` | `token-saving-tools`、proxy 暖機費與 subagent 開機費都在回答「怎麼計算 token 節省與代價」；泛稱 `token` 沒有較清楚邊界。 | [token-saving-tools.md:16-48](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L16-L48)、[proxy-warmup-cost.md:27-50](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L27-L50)、[subagent-boot-cost.md:18-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L18-L42)。 |
| `tooling`／`tool-evaluation`／`tool-adoption` | 三者不合併 | `tooling` 是具名工具的接線、操作與限制；`tool-evaluation` 是引入前的 stack-fit、殘值與可達上限；`tool-adoption` 是進入真實使用後的採用、留用、降級或淘汰。它們可在同篇跨維度共存。 | [dcg-safety-lock.md:20-28](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L20-L28)、[check-my-stack.md:14-24](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/check-my-stack.md#L14-L24)、[measure-revealed-adoption.md:38-56](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L38-L56)。 |
| `methodology`／`retrospective` | 不合併 | methodology 要求文章交付可重複的方法、量尺或決策框架；retrospective 要求文章以使用後證據重看原判斷。文章可以同時成立，但不能互當 alias。 | [model-routing.md:51-65](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/model-routing.md#L51-L65)、[retire-vector-memory.md:26-62](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/retire-vector-memory.md#L26-L62)。 |
| `workflow`／`ai-workflow` | 不合併 | workflow 是可重複的步驟與編排；ai-workflow 更窄，指 AI 參與資料或決策流程。現行搜尋因 `workflow` 是子字串而自動混在一起，但詞彙表仍應分開。 | [workflow-vs-skill.md:28-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/workflow-vs-skill.md#L28-L42)、[ai-report-two-lies.md:16-20](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/ai-report-two-lies.md#L16-L20)、[spec-review-round.md:30-48](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/spec-review-round.md#L30-L48)。 |
| `evaluation`／`tool-evaluation` | 不合併 | `checker-layoff` 評的是 LLM 判官的精確率、召回率、出勤成本與責任位置，不是外部工具競合。 | [checker-layoff.md:17-39](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/checker-layoff.md#L17-L39)、[checker-layoff.md:79-83](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/checker-layoff.md#L79-L83)。 |

### 粒度混雜

目前 raw tag 同時包含三種維度；混合本身不是錯，沒有邊界才是問題：

- **主題**：`code-review`、`memory`、`security`、`workflow`。
- **文章角度**：`methodology`、`retrospective`、`cost-analysis`、`philosophy`、`revealed-preference`。
- **專名**：`Claude Code`／`claude-code`、`MCP`／`mcp`、`FFF`、`Stryker`、`bumblebee`、`matt-pocock`。

同篇文章可以跨維度。例如 `test-theater.md` 的 `mutation-testing` 是方法主題、`Stryker` 是工具專名、`test-theater` 是失效型態；三者不能因只出現在同一篇就壓成一個 tag。來源：[test-theater.md:16-31](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L16-L31)、[test-theater.md:49-76](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L49-L76)。

### 首頁寬主題

| topicGroup | 現況 | 語意裁決 | 來源 |
|---|---:|---|---|
| 工作流 | 13 篇 | 保留。`workflow`、`ai-workflow`、agent、subagent、resume、deep research 的寬入口。 | [index.astro:13-26](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L13-L26) |
| 模型 | 12 篇 | 保留。模型、供應商、routing、quota 與行為相容性形成一致路徑。 | [index.astro:27-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L27-L42) |
| 工具 | 14 篇 | 保留。採用、評估、MCP、code search、skill、token／proxy 工具都在工具生命週期內。 | [index.astro:43-59](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L43-L59) |
| 記憶 | 4 篇 | 保留。四篇都直接處理 memory、auto memory、knowledge management 或 vector DB。 | [index.astro:60-64](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L60-L64) |
| Review | 13 篇 | membership 保留，顯示名稱待拍板改為「品質」。`Review` 無法預告 security、supply chain、data quality、fact check 等文章。 | [index.astro:65-83](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L65-L83) |
| Hook | 8 篇 | 保留。現有 8 篇都有 hook／hooks 或 automation 的執行機制。 | [index.astro:84-88](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L84-L88) |

目前 40 篇全部至少落入一個寬主題；19 篇同時落入兩個以上。標準 ID 若改成 `ai-agent`、`workflow-resume`，`topicGroups` 必須先新增這兩個別名，否則文章遷移會讓主題歸屬靜默消失。現有 `ai-agents`、`resume` 可暫留為舊別名。來源：Evidence 的 topic 別名重算輸出。

## 全量活詞彙表候選

下表逐字覆蓋 62 種 raw tag。每個 raw tag 只有一個主要裁決；「系列種子」表示目前語意成立，但未假設未來一定有第二篇。

| raw tag | 建議標準 tag | 維度 | 目前文章 | 裁決 | 理由 | 信心 | 來源 |
|---|---|---|---|---|---|---|---|
| `AI-agents` | `ai-agent` | 主題 | [rule-ladder.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L5)、[subagent-boot-cost.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L5) | 改名 | 兩篇都在談 agent 層級的治理或能力成本；改成小寫、單數 ID，不併入較窄的 `subagent`。 | 高 | [rule-ladder.md:20-31](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L20-L31)、[subagent-boot-cost.md:18-58](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L18-L58) |
| `AI-testing` | `ai-testing` | 主題 | [test-theater.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L5) | 改名 | AI 產生測試的失效風險是主線；只統一 ID 大小寫，不與一般 testing 或 mutation testing 合併。 | 高 | [test-theater.md:10-47](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L10-L47) |
| `ai-workflow` | `ai-workflow` | 主題 | [ai-report-two-lies.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/ai-report-two-lies.md#L5)、[spec-review-round.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/spec-review-round.md#L5) | 保留 | 兩篇都把 AI 嵌入資料或決策流程；它比一般 `workflow` 更窄。 | 中高 | [ai-report-two-lies.md:16-20](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/ai-report-two-lies.md#L16-L20)、[spec-review-round.md:30-48](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/spec-review-round.md#L30-L48) |
| `auto-memory` | `auto-memory` | 主題 | [memory-cap-reframe.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/memory-cap-reframe.md#L5) | 系列種子 | 文章直接處理 MEMORY.md 容量與 auto memory 的目錄化策略；singleton 不影響語意成立。 | 中 | [memory-cap-reframe.md:8-50](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/memory-cap-reframe.md#L8-L50) |
| `automation` | `automation` | 主題 | [hook-watchdog.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/hook-watchdog.md#L5)、[rule-ladder.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L5) | 保留 | 兩篇都處理把文字期待升級為自動檢查或攔截；與 `workflow` 的步驟編排不同。 | 中高 | [hook-watchdog.md:20-70](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/hook-watchdog.md#L20-L70)、[rule-ladder.md:20-75](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L20-L75) |
| `bumblebee` | `bumblebee` | 專名 | [bumblebee-still-on-disk.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/bumblebee-still-on-disk.md#L5) | 系列種子 | 工具機制、威脅 catalog 邊界與 KEEP 結論是全文主線。 | 中 | [bumblebee-still-on-disk.md:36-72](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/bumblebee-still-on-disk.md#L36-L72) |
| `Claude Code` | `claude-code` | 專名 | [agent-tool-reach.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L5)、[measure-revealed-adoption.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L5)、[one-model-not-enough.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/one-model-not-enough.md#L5)、[protocol-model-dependency.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/protocol-model-dependency.md#L5)、[steal-determinism-layer.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/steal-determinism-layer.md#L5)、[test-theater.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L5) | 合併 | 前五篇併入 `claude-code`；`test-theater` 不是產品專屬，逐篇移除。 | 高 | [test-theater.md:33-47](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L33-L47)、[test-theater.md:78-88](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L78-L88) |
| `claude-code` | `claude-code` | 專名 | [absorb-awesome-list.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/absorb-awesome-list.md#L5)、[cc-vendor-swap.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/cc-vendor-swap.md#L5)、[check-my-stack.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/check-my-stack.md#L5)、[checker-layoff.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/checker-layoff.md#L5)、[code-search-adoption.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/code-search-adoption.md#L5)、[dcg-safety-lock.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L5)、[deep-research-rate-limit.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/deep-research-rate-limit.md#L5)、[exit-0-illusion.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L5)、[gpt-in-cc-performance.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc-performance.md#L5)、[gpt-in-cc.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc.md#L5)、[gpt-review-tunnel-vision.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-review-tunnel-vision.md#L5)、[hook-watchdog.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/hook-watchdog.md#L5)、[inline-the-rules.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/inline-the-rules.md#L5)、[keep-the-wiki-alive.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/keep-the-wiki-alive.md#L5)、[local-llm-hook-judge.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/local-llm-hook-judge.md#L5)、[matt-philosophy.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L5)、[memory-cap-reframe.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/memory-cap-reframe.md#L5)、[model-routing.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/model-routing.md#L5)、[prose-exams.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/prose-exams.md#L5)、[proxy-warmup-cost.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L5)、[retire-vector-memory.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/retire-vector-memory.md#L5)、[rule-ladder.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L5)、[sem-blast-radius.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/sem-blast-radius.md#L5)、[sol-overimplementation.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/sol-overimplementation.md#L5)、[spec-review-round.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/spec-review-round.md#L5)、[subagent-boot-cost.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L5)、[token-saving-tools.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L5)、[trial-review-system.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/trial-review-system.md#L5)、[unattended-workflow-resume.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/unattended-workflow-resume.md#L5)、[vendor-benefit.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/vendor-benefit.md#L5)、[websearch-misses-official-docs.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/websearch-misses-official-docs.md#L5)、[workflow-vs-skill.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/workflow-vs-skill.md#L5) | 待拍板 | 合併後會是 37／40 篇，今天幾乎等同站台身份；保留有未來擴題價值，但目前辨識力低。 | 中 | [article-discovery/spec.md:29-31](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/.scratch/article-discovery/spec.md#L29-L31)、[index.astro:107](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L107) |
| `code-review` | `code-review` | 主題 | [gpt-review-tunnel-vision.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-review-tunnel-vision.md#L5)、[one-model-not-enough.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/one-model-not-enough.md#L5)、[sem-blast-radius.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/sem-blast-radius.md#L5)、[steal-determinism-layer.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/steal-determinism-layer.md#L5) | 保留 | 四篇分別談停止條件、多模型審查、影響面與確定性資料層，互補而不重複。 | 高 | [gpt-review-tunnel-vision.md:46-69](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-review-tunnel-vision.md#L46-L69)、[one-model-not-enough.md:24-50](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/one-model-not-enough.md#L24-L50) |
| `code-search` | `code-search` | 主題 | [agent-tool-reach.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L5)、[code-search-adoption.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/code-search-adoption.md#L5) | 保留 | 兩篇都比較 codebase 搜尋能力與 agent 實際採用，形成明確路徑。 | 高 | [agent-tool-reach.md:24-53](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L24-L53)、[code-search-adoption.md:48-58](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/code-search-adoption.md#L48-L58) |
| `cost-analysis` | `cost-analysis` | 文章角度 | [proxy-warmup-cost.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L5) | 系列種子 | 全文用暖機費與回本點評估方案，不只是列 token 數量。 | 中 | [proxy-warmup-cost.md:34-50](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L34-L50) |
| `data-quality` | `data-quality` | 主題 | [ai-report-two-lies.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/ai-report-two-lies.md#L5) | 系列種子 | 欄位存在性、資料列來源與儲存格對位都是文章承重內容。 | 中 | [ai-report-two-lies.md:22-60](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/ai-report-two-lies.md#L22-L60) |
| `deep-research` | `deep-research` | 主題 | [deep-research-rate-limit.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/deep-research-rate-limit.md#L5) | 系列種子 | 官方 deep-research workflow 的 agent 展開、rate limit 與節流 fork 是全文主線。 | 中 | [deep-research-rate-limit.md:24-77](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/deep-research-rate-limit.md#L24-L77) |
| `evaluation` | `evaluation` | 文章角度 | [checker-layoff.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/checker-layoff.md#L5) | 系列種子 | 評估的是 LLM 判官的精確率、召回率、出勤成本與責任位置。 | 中 | [checker-layoff.md:17-39](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/checker-layoff.md#L17-L39)、[checker-layoff.md:79-83](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/checker-layoff.md#L79-L83) |
| `fabrication` | `fabrication` | 主題 | [exit-0-illusion.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L5) | 系列種子 | subagent 捏造規則、檔名與輸出是主要失效型態。 | 中 | [exit-0-illusion.md:10-18](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L10-L18)、[exit-0-illusion.md:41-47](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L41-L47) |
| `fact-check` | `fact-check` | 主題 | [websearch-misses-official-docs.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/websearch-misses-official-docs.md#L5) | 系列種子 | 文章核心是驗證 AI 是否真的看過官方來源，而非一般搜尋技巧。 | 中 | [websearch-misses-official-docs.md:20-63](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/websearch-misses-official-docs.md#L20-L63) |
| `FFF` | `fff` | 專名 | [agent-tool-reach.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L5) | 待拍板 | 正文證明 FFF 是具體工具；小寫資料 ID 是條件式治理提案，只有在 ID／顯示名稱分離後才採用。 | 中 | 專名語意：[agent-tool-reach.md:14-24](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L14-L24)；命名政策待 [需要使用者拍板](#需要使用者拍板)。 |
| `gpt` | `gpt` | 專名 | [gpt-in-cc-performance.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc-performance.md#L5)、[gpt-in-cc.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc.md#L5)、[gpt-review-tunnel-vision.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-review-tunnel-vision.md#L5)、[sol-overimplementation.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/sol-overimplementation.md#L5) | 保留 | 四篇從接入、行為、review 到過度實作連續記錄 GPT 實測。 | 高 | [gpt-in-cc.md:10-16](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc.md#L10-L16)、[gpt-in-cc-performance.md:10-30](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc-performance.md#L10-L30) |
| `hook` | `hook` | 主題 | [checker-layoff.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/checker-layoff.md#L5)、[dcg-safety-lock.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L5)、[hook-watchdog.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/hook-watchdog.md#L5)、[inline-the-rules.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/inline-the-rules.md#L5)、[local-llm-hook-judge.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/local-llm-hook-judge.md#L5)、[protocol-model-dependency.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/protocol-model-dependency.md#L5)、[sem-blast-radius.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/sem-blast-radius.md#L5) | 保留 | 七篇共享 hook 的觸發、攔截、送達或判官機制，窄題各自由其他 tag 區分。 | 高 | [dcg-safety-lock.md:20-28](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L20-L28)、[protocol-model-dependency.md:44-56](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/protocol-model-dependency.md#L44-L56) |
| `hooks` | `hook` | 主題 | [rule-ladder.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L5) | 合併 | 單複數沒有內容差異；正文的第三層就是同一 hook 機制。 | 高 | [rule-ladder.md:20-29](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L20-L29) |
| `knowledge-management` | `knowledge-management` | 主題 | [keep-the-wiki-alive.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/keep-the-wiki-alive.md#L5) | 系列種子 | 文章處理 wiki 管線如何持續寫入、整理與被讀，不只是單一 memory 檔。 | 中 | [keep-the-wiki-alive.md:26-103](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/keep-the-wiki-alive.md#L26-L103) |
| `llm` | `llm` | 主題 | [cc-vendor-swap.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/cc-vendor-swap.md#L5)、[checker-layoff.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/checker-layoff.md#L5)、[gpt-in-cc-performance.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc-performance.md#L5)、[gpt-in-cc.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc.md#L5)、[local-llm-hook-judge.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/local-llm-hook-judge.md#L5)、[vendor-benefit.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/vendor-benefit.md#L5) | 保留 | 六篇都把模型相容性、判官能力、在地部署或供應商韌性當主體；雖寬，但仍是一致模型路徑。 | 中高 | [cc-vendor-swap.md:57-63](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/cc-vendor-swap.md#L57-L63)、[local-llm-hook-judge.md:86-100](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/local-llm-hook-judge.md#L86-L100) |
| `llm-behavior` | `model-behavior` | 主題 | [protocol-model-dependency.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/protocol-model-dependency.md#L5) | 合併 | 與 `model-behavior` 都在串同一治理層遇到不同模型時的行為差。 | 高 | [protocol-model-dependency.md:22-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/protocol-model-dependency.md#L22-L42)、[gpt-in-cc-performance.md:54-56](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc-performance.md#L54-L56) |
| `local-llm` | `local-llm` | 主題 | [local-llm-hook-judge.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/local-llm-hook-judge.md#L5) | 系列種子 | 本地小模型的低延遲、常駐與窄職責是全文成立條件。 | 中 | [local-llm-hook-judge.md:86-100](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/local-llm-hook-judge.md#L86-L100) |
| `matt-pocock` | `matt-pocock` | 專名 | [matt-philosophy.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L5) | 系列種子 | Matt Pocock 的 skill 設計哲學是主要比較對象。 | 中 | [matt-philosophy.md:20-84](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L20-L84) |
| `MCP` | `mcp` | 專名 | [agent-tool-reach.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L5) | 合併 | 與小寫 `mcp` 是同一技術縮寫；資料 ID 小寫，顯示名稱大寫。 | 高 | [agent-tool-reach.md:14-24](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L14-L24) |
| `mcp` | `mcp` | 專名 | [code-search-adoption.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/code-search-adoption.md#L5)、[token-saving-tools.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L5) | 保留 | MCP 是工具介面或交付形式，不與 code search 或 token optimization 合併。 | 高 | [code-search-adoption.md:34-56](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/code-search-adoption.md#L34-L56)、[token-saving-tools.md:16-48](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L16-L48) |
| `memory` | `memory` | 主題 | [inline-the-rules.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/inline-the-rules.md#L5)、[keep-the-wiki-alive.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/keep-the-wiki-alive.md#L5)、[memory-cap-reframe.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/memory-cap-reframe.md#L5)、[retire-vector-memory.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/retire-vector-memory.md#L5) | 保留 | 四篇涵蓋規則送達、wiki 管線、容量架構與向量記憶退役，形成完整記憶生命週期。 | 高 | [inline-the-rules.md:10-40](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/inline-the-rules.md#L10-L40)、[retire-vector-memory.md:26-76](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/retire-vector-memory.md#L26-L76) |
| `methodology` | `methodology` | 文章角度 | [absorb-awesome-list.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/absorb-awesome-list.md#L5)、[ai-report-two-lies.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/ai-report-two-lies.md#L5)、[check-my-stack.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/check-my-stack.md#L5)、[gpt-review-tunnel-vision.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-review-tunnel-vision.md#L5)、[hook-watchdog.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/hook-watchdog.md#L5)、[inline-the-rules.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/inline-the-rules.md#L5)、[measure-revealed-adoption.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L5)、[model-routing.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/model-routing.md#L5)、[prose-exams.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/prose-exams.md#L5)、[sol-overimplementation.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/sol-overimplementation.md#L5)、[spec-review-round.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/spec-review-round.md#L5)、[steal-determinism-layer.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/steal-determinism-layer.md#L5)、[trial-review-system.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/trial-review-system.md#L5) | 保留 | 13 篇主題不同，但都交付可重複的方法、量尺或決策規則；它是文章角度，不是假裝同一技術主題。 | 中 | [measure-revealed-adoption.md:103-127](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L103-L127)、[model-routing.md:51-65](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/model-routing.md#L51-L65)、[spec-review-round.md:30-38](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/spec-review-round.md#L30-L38) |
| `model` | `model-behavior` | 主題 | [protocol-model-dependency.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/protocol-model-dependency.md#L5) | 合併 | 泛稱 `model` 在該篇只表示模型遵循行為，已由更精確路徑覆蓋。 | 高 | [protocol-model-dependency.md:22-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/protocol-model-dependency.md#L22-L42) |
| `model-behavior` | `model-behavior` | 主題 | [gpt-in-cc-performance.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc-performance.md#L5) | 保留 | 文章核心是不同模型如何解讀並執行同一治理層。 | 高 | [gpt-in-cc-performance.md:16-30](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc-performance.md#L16-L30)、[gpt-in-cc-performance.md:54-56](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc-performance.md#L54-L56) |
| `model-routing` | `model-routing` | 主題 | [model-routing.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/model-routing.md#L5)、[subagent-boot-cost.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L5) | 保留 | 一篇依任務分配模型與深度，另一篇把開機費納入分派；路徑互補。 | 高 | [model-routing.md:51-65](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/model-routing.md#L51-L65)、[subagent-boot-cost.md:18-58](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L18-L58) |
| `multi-model` | `multi-model` | 主題 | [one-model-not-enough.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/one-model-not-enough.md#L5) | 系列種子 | 核心是用不同模型與 context 製造 review 視角差；不等於 model routing。 | 中 | [one-model-not-enough.md:24-50](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/one-model-not-enough.md#L24-L50) |
| `mutation-testing` | `mutation-testing` | 主題 | [test-theater.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L5) | 系列種子 | 文章完整解釋方法、分數、存活 mutant 與執行 gate。 | 中 | [test-theater.md:49-76](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L49-L76) |
| `philosophy` | `philosophy` | 文章角度 | [matt-philosophy.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L5) | 系列種子 | 文章比較注意力配置、spec 地位與流程主導權等價值立場，不是方法步驟。 | 中 | [matt-philosophy.md:38-132](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L38-L132) |
| `prompt-caching` | `prompt-caching` | 主題 | [proxy-warmup-cost.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L5) | 系列種子 | proxy 暖機費的直接成因是新 session 首回合沒有 prompt cache 命中。 | 中 | [proxy-warmup-cost.md:27-36](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L27-L36) |
| `proxy` | `proxy` | 主題 | [proxy-warmup-cost.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L5) | 系列種子 | 自訂 base URL proxy 是成本差異的技術邊界。 | 中 | [proxy-warmup-cost.md:10-17](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L10-L17) |
| `quota` | `quota` | 主題 | [model-routing.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/model-routing.md#L5) | 系列種子 | 配額是重畫模型分工的起因與成效指標，不與 API rate limit 自動合併。 | 中 | [model-routing.md:12-24](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/model-routing.md#L12-L24)、[model-routing.md:93-103](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/model-routing.md#L93-L103) |
| `resume` | `workflow-resume` | 主題 | [unattended-workflow-resume.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/unattended-workflow-resume.md#L5) | 改名 | `resume` 單獨看有履歷歧義；正文全篇都指長時間 workflow 的暫停、恢復與快取重用。 | 高 | [unattended-workflow-resume.md:34-70](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/unattended-workflow-resume.md#L34-L70)、[unattended-workflow-resume.md:115-127](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/unattended-workflow-resume.md#L115-L127) |
| `retrospective` | `retrospective` | 文章角度 | [keep-the-wiki-alive.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/keep-the-wiki-alive.md#L5)、[retire-vector-memory.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/retire-vector-memory.md#L5)、[websearch-misses-official-docs.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/websearch-misses-official-docs.md#L5) | 保留 | 三篇都用使用後證據重看原本判斷；與交付可重複方法的 methodology 不同。 | 中高 | [keep-the-wiki-alive.md:40-103](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/keep-the-wiki-alive.md#L40-L103)、[retire-vector-memory.md:26-76](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/retire-vector-memory.md#L26-L76)、[websearch-misses-official-docs.md:20-63](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/websearch-misses-official-docs.md#L20-L63) |
| `revealed-preference` | `revealed-preference` | 文章角度 | [measure-revealed-adoption.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L5) | 系列種子 | 文章明文用實際行為對比口頭偏好，且把概念套到工具、agent 與產物。 | 中 | [measure-revealed-adoption.md:18-56](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L18-L56)、[measure-revealed-adoption.md:119-129](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L119-L129) |
| `security` | `security` | 主題 | [bumblebee-still-on-disk.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/bumblebee-still-on-disk.md#L5)、[dcg-safety-lock.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L5) | 保留 | 一篇談供應鏈惡意 extension，一篇談 shell 防線；security 是有效共同入口，窄 tag 仍各自保留。 | 高 | [bumblebee-still-on-disk.md:16-44](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/bumblebee-still-on-disk.md#L16-L44)、[dcg-safety-lock.md:66-88](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L66-L88) |
| `skill` | `skill` | 主題 | [workflow-vs-skill.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/workflow-vs-skill.md#L5) | 保留 | 文章明確定義 skill 與 workflow 的分工；另建議納入 matt 與 prose exams。 | 高 | [workflow-vs-skill.md:28-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/workflow-vs-skill.md#L28-L42)、[prose-exams.md:11-21](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/prose-exams.md#L11-L21) |
| `skills` | `skill` | 主題 | [matt-philosophy.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L5) | 合併 | 正文大部分在談一般 skill 設計，不只是 `mattpocock/skills` repo 名稱。 | 高 | [matt-philosophy.md:20-46](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L20-L46)、[matt-philosophy.md:72-84](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L72-L84) |
| `spec-review` | `spec-review` | 主題 | [spec-review-round.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/spec-review-round.md#L5) | 系列種子 | 三種反問、固定三問與 review-spec 四層都直接圍繞 spec 審查。 | 中 | [spec-review-round.md:12-48](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/spec-review-round.md#L12-L48) |
| `Stryker` | `stryker` | 專名 | [test-theater.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L5) | 待拍板 | 正文證明 Stryker 是具體工具且不併入 mutation testing；小寫資料 ID 只有在 ID／顯示名稱分離後才採用。 | 中 | 專名語意：[test-theater.md:64-76](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L64-L76)；命名政策待 [需要使用者拍板](#需要使用者拍板)。 |
| `subagent` | `subagent` | 主題 | [exit-0-illusion.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L5)、[measure-revealed-adoption.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L5) | 保留 | 兩篇分別處理 subagent 虛構與實際採用率；另併入開機成本篇。 | 高 | [exit-0-illusion.md:10-18](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L10-L18)、[measure-revealed-adoption.md:22-32](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L22-L32) |
| `subagents` | `subagent` | 主題 | [subagent-boot-cost.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L5) | 合併 | 複數沒有不同概念；文章在量單次派工的能力與 token 預算。 | 高 | [subagent-boot-cost.md:18-58](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L18-L58) |
| `supply-chain` | `supply-chain` | 主題 | [bumblebee-still-on-disk.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/bumblebee-still-on-disk.md#L5) | 系列種子 | 惡意套件傳播、市集下架與已安裝檔案殘留構成明確路徑。 | 中 | [bumblebee-still-on-disk.md:16-44](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/bumblebee-still-on-disk.md#L16-L44) |
| `test-theater` | `test-theater` | 主題 | [test-theater.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L5) | 系列種子 | 它指測試全綠卻沒守住行為的失效型態，不是 testing 或 mutation testing 的別名。 | 中 | [test-theater.md:16-31](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L16-L31) |
| `testing` | `testing` | 主題 | [prose-exams.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/prose-exams.md#L5) | 系列種子 | 文章建立純文字行為規則的回歸考卷與改後收據。 | 中 | [prose-exams.md:11-35](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/prose-exams.md#L11-L35) |
| `token` | `token-optimization` | 主題 | [token-saving-tools.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L5) | 合併 | 泛稱 token 沒有獨立邊界；全文評估節省工具、資訊損失與實際 headroom。 | 高 | [token-saving-tools.md:16-48](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L16-L48)、[token-saving-tools.md:73-93](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L73-L93) |
| `token-optimization` | `token-optimization` | 主題 | [proxy-warmup-cost.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L5)、[subagent-boot-cost.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L5) | 保留 | 兩篇分別量 proxy 暖機與 subagent 開機費，與 token-saving-tools 形成成本路徑。 | 高 | [proxy-warmup-cost.md:27-50](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L27-L50)、[subagent-boot-cost.md:18-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L18-L42) |
| `tool-adoption` | `tool-adoption` | 主題 | [agent-tool-reach.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L5)、[measure-revealed-adoption.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L5)、[steal-determinism-layer.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/steal-determinism-layer.md#L5)、[trial-review-system.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/trial-review-system.md#L5) | 保留 | `measure`、`steal`、`trial` 有真實採用、抽件或留／退證據；`agent-tool-reach` 明說未實機跑 FFF，該篇應改到 `tool-evaluation`。建議另納入 code-search、dcg、sem 與實際試用五種工具的 token-saving-tools。 | 高 | [measure-revealed-adoption.md:38-56](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L38-L56)、[agent-tool-reach.md:77-99](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L77-L99)、[trial-review-system.md:42-60](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/trial-review-system.md#L42-L60)、[token-saving-tools.md:10-34](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L10-L34) |
| `tool-evaluation` | `tool-evaluation` | 主題 | [check-my-stack.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/check-my-stack.md#L5) | 保留 | 引入前的 stack-fit 盤點、紙上可達上限與剩餘價值有獨立邊界；建議 absorb-awesome-list、agent-tool-reach、token-saving-tools 加入。 | 中高 | [check-my-stack.md:14-24](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/check-my-stack.md#L14-L24)、[absorb-awesome-list.md:23-35](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/absorb-awesome-list.md#L23-L35)、[agent-tool-reach.md:77-99](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L77-L99) |
| `tooling` | `tooling` | 主題 | [absorb-awesome-list.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/absorb-awesome-list.md#L5)、[dcg-safety-lock.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L5)、[sem-blast-radius.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/sem-blast-radius.md#L5) | 保留 | dcg 與 sem 都把具名工具的接線、操作與限制當正文主體；absorb-awesome-list 評估的是一整包工具，該篇應改到 `tool-evaluation`。 | 中高 | [dcg-safety-lock.md:20-28](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L20-L28)、[sem-blast-radius.md:16-51](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/sem-blast-radius.md#L16-L51)、[absorb-awesome-list.md:23-35](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/absorb-awesome-list.md#L23-L35) |
| `vector-db` | `vector-db` | 主題 | [retire-vector-memory.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/retire-vector-memory.md#L5) | 系列種子 | 寫入／搜尋數據、ChromaDB 適配與退役條件是全文主線。 | 中 | [retire-vector-memory.md:26-62](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/retire-vector-memory.md#L26-L62)、[retire-vector-memory.md:100-110](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/retire-vector-memory.md#L100-L110) |
| `vendor-swap` | `vendor-swap` | 主題 | [cc-vendor-swap.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/cc-vendor-swap.md#L5)、[gpt-in-cc-performance.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc-performance.md#L5)、[gpt-in-cc.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc.md#L5)、[vendor-benefit.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/vendor-benefit.md#L5) | 保留 | 四篇形成明示系列，從接入成本、GPT 個案、行為到額度韌性。 | 高 | [gpt-in-cc.md:14](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc.md#L14)、[cc-vendor-swap.md:57-63](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/cc-vendor-swap.md#L57-L63) |
| `verify` | `verify` | 主題 | [exit-0-illusion.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L5) | 保留 | 完成宣告必須回到真實結果層；建議 `hook-watchdog` 也加入，形成證據驗證路徑。 | 中高 | [exit-0-illusion.md:102-124](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L102-L124)、[hook-watchdog.md:40-70](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/hook-watchdog.md#L40-L70) |
| `vscode-extension` | `vscode-extension` | 主題 | [bumblebee-still-on-disk.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/bumblebee-still-on-disk.md#L5) | 系列種子 | extension 的安裝、版號、下架與更新行為是事件成立條件。 | 中 | [bumblebee-still-on-disk.md:28-34](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/bumblebee-still-on-disk.md#L28-L34) |
| `websearch` | `websearch` | 專名 | [websearch-misses-official-docs.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/websearch-misses-official-docs.md#L5) | 系列種子 | WebSearch 排序與官方文件漏失是具體研究對象；顯示名稱用 `WebSearch`。 | 中 | [websearch-misses-official-docs.md:20-63](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/websearch-misses-official-docs.md#L20-L63) |
| `workflow` | `workflow` | 主題 | [absorb-awesome-list.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/absorb-awesome-list.md#L5)、[deep-research-rate-limit.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/deep-research-rate-limit.md#L5)、[one-model-not-enough.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/one-model-not-enough.md#L5)、[prose-exams.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/prose-exams.md#L5)、[rule-ladder.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L5)、[trial-review-system.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/trial-review-system.md#L5)、[unattended-workflow-resume.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/unattended-workflow-resume.md#L5)、[workflow-vs-skill.md:5](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/workflow-vs-skill.md#L5) | 保留 | deep research、多模型 review、prose 考卷、trial、resume 與 workflow／skill 邊界都有明確編排；absorb 與 rule-ladder 的正文主體分別是工具評估與規則方法，兩篇移除。 | 中高 | [deep-research-rate-limit.md:24-34](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/deep-research-rate-limit.md#L24-L34)、[prose-exams.md:45-69](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/prose-exams.md#L45-L69)、[rule-ladder.md:101-110](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L101-L110) |

## 標準 tag 條目

### Agent、workflow 與自動化

| 標準 ID | 顯示名稱 | 維度 | 建議意思 | 邊界 | 可接受近義詞或舊寫法 | 來源 |
|---|---|---|---|---|---|---|
| `ai-agent` | AI agent | 主題 | agent 層級的架構、治理與能力預算 | 不因文章由 agent 執行就加；委派子 agent 優先用 `subagent` | `AI-agents` | [rule-ladder.md:20-31](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L20-L31) |
| `ai-testing` | AI testing | 主題 | AI 產生或維護測試時的可靠性 | 不等於一般 testing，也不等於 mutation testing | `AI-testing` | [test-theater.md:10-47](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L10-L47) |
| `ai-workflow` | AI workflow | 主題 | AI 直接參與資料、敘事或決策流程 | 不與所有 workflow 合併 | 無 | [ai-report-two-lies.md:16-20](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/ai-report-two-lies.md#L16-L20) |
| `automation` | automation | 主題 | 自動觸發、檢查、攔截或放行 | 單純可重複步驟不算 | 無 | [hook-watchdog.md:20-70](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/hook-watchdog.md#L20-L70) |
| `deep-research` | deep research | 主題 | deep-research workflow 本身與其執行限制 | 一般研究文章不算 | 無 | [deep-research-rate-limit.md:24-77](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/deep-research-rate-limit.md#L24-L77) |
| `hook` | hook | 主題 | hook 的觸發、攔截、注入、判官或限制 | 自動化目的不是 hook 的同義詞 | `hooks` | [dcg-safety-lock.md:20-28](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L20-L28) |
| `skill` | skill | 主題 | skill 作為可重用知識、流程與規則載體 | 特定 skill repo 的專名仍另用專名 tag | `skills` | [workflow-vs-skill.md:28-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/workflow-vs-skill.md#L28-L42) |
| `subagent` | subagent | 主題 | 委派子 agent 的可靠性、採用與成本 | 不等於所有 AI agent | `subagents` | [subagent-boot-cost.md:18-58](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L18-L58) |
| `workflow` | workflow | 主題 | 有明確階段、編排或可重跑入口的流程 | 只有一套方法判準但沒有流程編排時用 `methodology` | 無 | [workflow-vs-skill.md:28-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/workflow-vs-skill.md#L28-L42) |
| `workflow-resume` | workflow resume | 主題 | 長時間 workflow 的暫停、恢復與重用 | 不使用語意過寬的 `resume` | `resume` | [unattended-workflow-resume.md:34-70](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/unattended-workflow-resume.md#L34-L70) |

### 模型與供應商

| 標準 ID | 顯示名稱 | 維度 | 建議意思 | 邊界 | 可接受近義詞或舊寫法 | 來源 |
|---|---|---|---|---|---|---|
| `claude-code` | Claude Code | 專名 | Claude Code 產品專屬行為、設定或生態 | 泛用 coding agent 問題不算；是否繼續當文章 tag 待拍板 | `Claude Code` | [test-theater.md:33-47](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L33-L47) |
| `gpt` | GPT | 專名 | GPT 模型接入與行為實測 | 泛稱模型比較用 `llm` 或更精確 tag | 無 | [gpt-in-cc.md:10-16](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc.md#L10-L16) |
| `llm` | LLM | 主題 | 模型相容性、部署、能力或供應商層面的共同路徑 | 只在正文順帶出現模型不算 | 無 | [cc-vendor-swap.md:57-63](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/cc-vendor-swap.md#L57-L63) |
| `local-llm` | local LLM | 主題 | 本地模型的部署、延遲、限制與適用職位 | 雲端模型比較不算 | 無 | [local-llm-hook-judge.md:86-100](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/local-llm-hook-judge.md#L86-L100) |
| `model-behavior` | model behavior | 主題 | 不同模型執行同一規則、治理層或任務時的行為差 | 不等於 model routing | `llm-behavior`；`model` 僅作一次性舊寫法 | [protocol-model-dependency.md:22-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/protocol-model-dependency.md#L22-L42) |
| `model-routing` | model routing | 主題 | 按任務性質、成本或能力分配模型 | 同一任務並行多模型用 `multi-model` | 無 | [model-routing.md:51-65](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/model-routing.md#L51-L65) |
| `multi-model` | multi-model | 主題 | 同一工作刻意使用多個模型或 context 製造視角差 | 不等於 routing | 無 | [one-model-not-enough.md:24-50](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/one-model-not-enough.md#L24-L50) |
| `quota` | quota | 主題 | 帳號或模型用量天花板與資源分配 | API burst rate limit 不自動算 quota | 無 | [model-routing.md:12-24](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/model-routing.md#L12-L24) |
| `vendor-swap` | vendor swap | 主題 | Claude Code 更換模型供應商的協議、功能、生態與韌性 | 模型性格但沒有供應商切換時用 `model-behavior` | 無 | [cc-vendor-swap.md:57-63](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/cc-vendor-swap.md#L57-L63) |

### 工具、採用與成本

| 標準 ID | 顯示名稱 | 維度 | 建議意思 | 邊界 | 可接受近義詞或舊寫法 | 來源 |
|---|---|---|---|---|---|---|
| `bumblebee` | bumblebee | 專名 | bumblebee 掃描工具及其 catalog 能力 | 一般 supply-chain 問題另用主題 tag | 無 | [bumblebee-still-on-disk.md:36-72](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/bumblebee-still-on-disk.md#L36-L72) |
| `code-search` | code search | 主題 | codebase 搜尋工具、品質與 agent 採用 | 一般 MCP 工具不算 | 無 | [code-search-adoption.md:48-58](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/code-search-adoption.md#L48-L58) |
| `fff` | FFF | 專名 | FFF 工具本身 | 這是候選資料 ID；未拍板 ID／顯示名稱分離前，raw 值保留 `FFF` | `FFF` | [agent-tool-reach.md:14-24](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L14-L24) |
| `matt-pocock` | Matt Pocock | 專名 | Matt Pocock 的公開方法、工具或立場 | skill 一般設計另用 `skill` | 無 | [matt-philosophy.md:20-84](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L20-L84) |
| `mcp` | MCP | 專名 | MCP 介面、server 或工具交付型態 | 不與工具用途合併 | `MCP` | [code-search-adoption.md:34-56](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/code-search-adoption.md#L34-L56) |
| `prompt-caching` | prompt caching | 主題 | prompt cache 的命中、暖機與成本效果 | 泛用 token 成本用 `token-optimization` | 無 | [proxy-warmup-cost.md:27-36](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L27-L36) |
| `proxy` | proxy | 主題 | 模型或 API proxy 的路由、暖機與風險 | 一般 vendor swap 不自動加 | 無 | [proxy-warmup-cost.md:10-17](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L10-L17) |
| `stryker` | Stryker | 專名 | Stryker mutation testing 工具 | 這是候選資料 ID；未拍板 ID／顯示名稱分離前，raw 值保留 `Stryker` | `Stryker` | [test-theater.md:64-76](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L64-L76) |
| `token-optimization` | token optimization | 主題 | token 節省、資訊損失、暖機或 agent 開機成本 | 只列 token 數字但不分析取捨時不加 | `token` | [token-saving-tools.md:16-48](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L16-L48) |
| `tool-adoption` | tool adoption | 主題 | 實際安裝、試用、採用率、留下、退役或抽件 | 未實機使用、只做紙上否決時用 `tool-evaluation` | 無 | [trial-review-system.md:10-25](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/trial-review-system.md#L10-L25) |
| `tool-evaluation` | tool evaluation | 主題 | 引入前的 stack-fit、剩餘價值、紙上可達上限與方案比較 | 已進真實 trial 或量實際使用時用 `tool-adoption` | 無 | [check-my-stack.md:42-69](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/check-my-stack.md#L42-L69) |
| `tooling` | tooling | 主題 | 具名工具的接線、操作、能力與限制 | 只評估一包工具但未接線時用 `tool-evaluation`；使用後決策可另加 `tool-adoption` | 無 | [dcg-safety-lock.md:20-28](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L20-L28)、[sem-blast-radius.md:16-51](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/sem-blast-radius.md#L16-L51) |
| `vscode-extension` | VS Code extension | 主題 | VS Code extension 的安裝、更新、版號與市集生命週期 | 一般編輯器工具不算 | 無 | [bumblebee-still-on-disk.md:28-34](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/bumblebee-still-on-disk.md#L28-L34) |
| `websearch` | WebSearch | 專名 | Claude Code WebSearch 的排序、來源覆蓋與限制 | 一般 web research 不算 | 無 | [websearch-misses-official-docs.md:20-63](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/websearch-misses-official-docs.md#L20-L63) |

### 記憶與知識

| 標準 ID | 顯示名稱 | 維度 | 建議意思 | 邊界 | 可接受近義詞或舊寫法 | 來源 |
|---|---|---|---|---|---|---|
| `auto-memory` | auto memory | 主題 | Claude Code auto memory 的容量、載入與目錄化 | 一般手寫記憶不算 | 無 | [memory-cap-reframe.md:8-50](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/memory-cap-reframe.md#L8-L50) |
| `knowledge-management` | knowledge management | 主題 | wiki、知識管線、整理與持續可用性 | 單一 memory 檔技巧不一定算 | 無 | [keep-the-wiki-alive.md:26-103](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/keep-the-wiki-alive.md#L26-L103) |
| `memory` | memory | 主題 | agent／Claude Code 記憶系統的寫入、載入、架構與退役 | 一般文章回憶不算 | 無 | [retire-vector-memory.md:26-76](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/retire-vector-memory.md#L26-L76) |
| `vector-db` | vector DB | 主題 | embedding／vector DB 記憶的適配、搜尋與退役 | 一般 knowledge management 不自動加 | 無 | [retire-vector-memory.md:26-62](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/retire-vector-memory.md#L26-L62) |

### 品質、驗證與安全

| 標準 ID | 顯示名稱 | 維度 | 建議意思 | 邊界 | 可接受近義詞或舊寫法 | 來源 |
|---|---|---|---|---|---|---|
| `code-review` | code review | 主題 | code review 的視角、停止條件、影響面與資料層 | spec review 另用 `spec-review` | 無 | [one-model-not-enough.md:24-50](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/one-model-not-enough.md#L24-L50) |
| `data-quality` | data quality | 主題 | 欄位、資料列、儲存格與查詢結果的真實性 | 外部來源真偽用 `fact-check` | 無 | [ai-report-two-lies.md:22-60](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/ai-report-two-lies.md#L22-L60) |
| `evaluation` | evaluation | 文章角度 | 對模型、判官或機制的精確率、召回率、成本與責任評估 | 外部工具競合用 `tool-evaluation` | 無 | [checker-layoff.md:17-39](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/checker-layoff.md#L17-L39) |
| `fabrication` | fabrication | 主題 | agent 報告、路徑、規則或完成宣告與現實不符 | 測試空洞用 `test-theater` | 無 | [exit-0-illusion.md:10-18](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L10-L18) |
| `fact-check` | fact check | 主題 | 主張是否真的有權威來源與原始證據 | 資料表內部品質用 `data-quality` | 無 | [websearch-misses-official-docs.md:20-63](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/websearch-misses-official-docs.md#L20-L63) |
| `mutation-testing` | mutation testing | 主題 | 用故意改壞程式檢驗測試是否守住行為 | 工具專名另用 `stryker` | 無 | [test-theater.md:49-76](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L49-L76) |
| `security` | security | 主題 | credential、危險指令、惡意套件與安全退化 | supply chain 是更窄子題 | 無 | [dcg-safety-lock.md:66-88](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L66-L88) |
| `spec-review` | spec review | 主題 | spec 的反問、證據追問與人類拍板 | code diff review 不算 | 無 | [spec-review-round.md:12-48](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/spec-review-round.md#L12-L48) |
| `supply-chain` | supply chain | 主題 | 套件／extension 的惡意傳播、下架與殘留 | 一般 shell safety 不算 | 無 | [bumblebee-still-on-disk.md:16-44](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/bumblebee-still-on-disk.md#L16-L44) |
| `test-theater` | test theater | 主題 | 測試全綠但沒守住行為的失效型態 | 不等於測試領域本身 | 無 | [test-theater.md:16-31](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L16-L31) |
| `testing` | testing | 主題 | 測試策略、回歸考卷與可觀察驗收 | AI testing 與 mutation testing 可另加窄 tag | 無 | [prose-exams.md:11-35](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/prose-exams.md#L11-L35) |
| `verify` | verify | 主題 | 完成宣告、證據與真實結果層的核對 | fact check 側重外部事實來源 | 無 | [exit-0-illusion.md:102-124](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L102-L124) |

### 文章角度

| 標準 ID | 顯示名稱 | 維度 | 建議意思 | 邊界 | 可接受近義詞或舊寫法 | 來源 |
|---|---|---|---|---|---|---|
| `cost-analysis` | cost analysis | 文章角度 | 用成本模型、回本點或機會成本裁決方案 | 只提「很貴」不算 | 無 | [proxy-warmup-cost.md:34-50](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L34-L50) |
| `methodology` | methodology | 文章角度 | 文章主要交付可重複的方法、量尺、判準或流程原則 | 只有經驗敘事或單次結果不算 | 無；不要拿 `retrospective` 當 alias | [measure-revealed-adoption.md:103-127](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L103-L127) |
| `philosophy` | philosophy | 文章角度 | 價值排序、主導權、注意力配置與設計立場 | 可操作步驟優先用 `methodology` | 無 | [matt-philosophy.md:38-132](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L38-L132) |
| `retrospective` | retrospective | 文章角度 | 用使用後證據重看原本假設、架構或工具決定 | 只介紹方法不算；可與 methodology 同時成立 | 無 | [retire-vector-memory.md:26-76](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/retire-vector-memory.md#L26-L76) |
| `revealed-preference` | revealed preference | 文章角度 | 用實際行為而非口頭偏好判斷需求與採用 | 一般 usage metric 不一定算 | 無 | [measure-revealed-adoption.md:18-56](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L18-L56) |

## 逐篇文章的初步 tag 建議

`proposed` 原則上使用上節的標準 ID；`FFF`、`Stryker` 因 ID／顯示名稱尚未拍板，暫時保留可讀 raw 值。若寫「維持」，表示正文與目前閱讀路徑沒有足夠證據支持變更；這不等於 tag 已完成 ID／顯示名稱遷移。

| 文章 | current | proposed | 來源 |
|---|---|---|---|
| `absorb-awesome-list.md` | `claude-code, tooling, methodology, workflow` | `claude-code, tool-evaluation, methodology` | 文章逐條判決一整包資源，且明文把自己放進工具評估系列；沒有具名工具接線，也沒有 runtime 編排，因此 `tooling → tool-evaluation` 並移除 `workflow`。[23-35](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/absorb-awesome-list.md#L23-L35)、[83-90](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/absorb-awesome-list.md#L83-L90) |
| `agent-tool-reach.md` | `Claude Code, MCP, code-search, tool-adoption, FFF` | `claude-code, mcp, code-search, tool-evaluation, FFF` | 正規化已有變體的 ID，並把 `tool-adoption → tool-evaluation`：文章明說沒有實機跑 FFF，只用既有 session 推估介入上限。`FFF → fff` 等 ID／顯示名稱拍板後再決定。[14-24](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L14-L24)、[77-99](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/agent-tool-reach.md#L77-L99) |
| `ai-report-two-lies.md` | `ai-workflow, data-quality, methodology` | 維持 | 查詢、證據、敘事三層與可回溯方法都由正文支撐。[14-20](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/ai-report-two-lies.md#L14-L20)、[46-74](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/ai-report-two-lies.md#L46-L74) |
| `bumblebee-still-on-disk.md` | `security, supply-chain, vscode-extension, bumblebee` | 維持 | 四個 tag 分別是共同安全入口、供應鏈子題、載體與工具專名。[16-44](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/bumblebee-still-on-disk.md#L16-L44)、[36-72](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/bumblebee-still-on-disk.md#L36-L72) |
| `cc-vendor-swap.md` | `claude-code, vendor-swap, llm` | 維持 | 協議、功能與生態三層相容性形成 vendor swap 主線。[57-63](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/cc-vendor-swap.md#L57-L63) |
| `check-my-stack.md` | `claude-code, tool-evaluation, methodology` | 維持 | 引入前先盤點既有能力，再算剩餘價值；不改成 tool-adoption。[14-18](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/check-my-stack.md#L14-L18)、[42-69](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/check-my-stack.md#L42-L69) |
| `checker-layoff.md` | `claude-code, hook, llm, evaluation` | 維持 | 模型判官、hook 職位與精確率／召回率評估都是主線。[17-39](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/checker-layoff.md#L17-L39)、[79-83](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/checker-layoff.md#L79-L83) |
| `code-search-adoption.md` | `claude-code, mcp, code-search` | `claude-code, mcp, code-search, tool-adoption` | 新增 `tool-adoption`：文章把採用率定義為 agent 工具的真跑分，並與同系列文章互指。[48-58](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/code-search-adoption.md#L48-L58)、[98-110](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/code-search-adoption.md#L98-L110) |
| `dcg-safety-lock.md` | `claude-code, hook, security, tooling` | `claude-code, hook, security, tooling, tool-adoption` | 保留 `tooling`：正文有具體 hook 接線與繞行面；新增 `tool-adoption`：四週試用後有明確驗收與留用判斷。[20-28](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L20-L28)、[66-96](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/dcg-safety-lock.md#L66-L96) |
| `deep-research-rate-limit.md` | `claude-code, workflow, deep-research` | 維持 | 官方 workflow 的 agent 展開、server 差異、rate limit 與節流 fork 都由正文支撐。[24-77](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/deep-research-rate-limit.md#L24-L77) |
| `exit-0-illusion.md` | `claude-code, subagent, fabrication, verify` | 維持 | subagent 虛構與結果層驗證是全文主線。[10-18](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L10-L18)、[102-124](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/exit-0-illusion.md#L102-L124) |
| `gpt-in-cc-performance.md` | `claude-code, vendor-swap, gpt, llm, model-behavior` | 維持 | 接入後的模型規則遵循與治理校準，五個 tag 各有不同維度。[10-30](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc-performance.md#L10-L30)、[54-56](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc-performance.md#L54-L56) |
| `gpt-in-cc.md` | `claude-code, vendor-swap, gpt, llm` | 維持 | GPT 接入與 Claude Code 生態相容性是 vendor 系列第三篇。[10-16](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc.md#L10-L16)、[62-64](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-in-cc.md#L62-L64) |
| `gpt-review-tunnel-vision.md` | `claude-code, gpt, code-review, methodology` | 維持 | GPT review 迴圈與四項停止判準都是主要內容。[10-20](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-review-tunnel-vision.md#L10-L20)、[46-69](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/gpt-review-tunnel-vision.md#L46-L69) |
| `hook-watchdog.md` | `claude-code, hook, automation, methodology` | `claude-code, hook, automation, methodology, verify` | 新增 `verify`：文章直接把完成宣告改成可列舉證據與語意判定。[40-70](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/hook-watchdog.md#L40-L70) |
| `inline-the-rules.md` | `claude-code, memory, hook, methodology` | 維持 | memory 是案例流程，hook 是送達機制，methodology 是固定樣本與量尺。[10-40](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/inline-the-rules.md#L10-L40) |
| `keep-the-wiki-alive.md` | `claude-code, memory, knowledge-management, retrospective` | 維持 | 時序重測、wiki 管線與記憶架構回顧都由正文支撐。[26-103](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/keep-the-wiki-alive.md#L26-L103) |
| `local-llm-hook-judge.md` | `claude-code, local-llm, hook, llm` | 維持 | 本地小模型在低延遲 hook 的窄職位是全文核心。[54-60](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/local-llm-hook-judge.md#L54-L60)、[86-100](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/local-llm-hook-judge.md#L86-L100) |
| `matt-philosophy.md` | `claude-code, skills, matt-pocock, philosophy` | `claude-code, skill, matt-pocock, philosophy` | `skills → skill`：正文談一般 skill 設計，Matt 與 philosophy 仍是獨立維度。[20-46](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L20-L46)、[72-84](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/matt-philosophy.md#L72-L84) |
| `measure-revealed-adoption.md` | `Claude Code, tool-adoption, subagent, methodology, revealed-preference` | `claude-code, tool-adoption, subagent, methodology, revealed-preference` | 只做產品 ID 正規化；其餘四條路徑都有主要篇幅。[18-56](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L18-L56)、[103-127](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/measure-revealed-adoption.md#L103-L127) |
| `memory-cap-reframe.md` | `claude-code, memory, auto-memory` | 維持 | MEMORY.md 容量限制與目錄化是精確路徑。[8-50](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/memory-cap-reframe.md#L8-L50) |
| `model-routing.md` | `claude-code, model-routing, quota, methodology` | 維持 | 配額、任務分類與模型分工方法互相支撐。[12-24](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/model-routing.md#L12-L24)、[51-65](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/model-routing.md#L51-L65) |
| `one-model-not-enough.md` | `Claude Code, code-review, multi-model, workflow` | `claude-code, code-review, multi-model, workflow` | 只做產品 ID 正規化；多模型 review workflow 是主線。[24-50](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/one-model-not-enough.md#L24-L50) |
| `prose-exams.md` | `claude-code, testing, workflow, methodology` | `claude-code, testing, workflow, skill, methodology` | 保留 `workflow`：正文有考卷、gate、改後收據與結案流程；新增 `skill`，因 skill 是測試對象與標題主詞。[11-35](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/prose-exams.md#L11-L35)、[45-69](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/prose-exams.md#L45-L69)、[79-93](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/prose-exams.md#L79-L93) |
| `protocol-model-dependency.md` | `Claude Code, hook, model, llm-behavior` | `claude-code, hook, model-behavior` | 合併產品格式與 model behavior 家族；泛稱 model 不另留。[22-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/protocol-model-dependency.md#L22-L42)、[44-56](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/protocol-model-dependency.md#L44-L56) |
| `proxy-warmup-cost.md` | `claude-code, token-optimization, prompt-caching, proxy, cost-analysis` | 維持 | 系統邊界、成本成因、主題與文章角度分工清楚。[10-17](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L10-L17)、[27-50](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/proxy-warmup-cost.md#L27-L50) |
| `retire-vector-memory.md` | `claude-code, memory, vector-db, retrospective` | `claude-code, memory, vector-db, retrospective, tool-adoption` | 新增 `tool-adoption`：文章記錄安裝與 hook 接線、928 次寫入、3 次搜尋、6 項對照測試及完整拆除，符合「試用後留用或退役」的工具生命週期邊界。[22-80](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/retire-vector-memory.md#L22-L80) |
| `rule-ladder.md` | `claude-code, hooks, workflow, AI-agents, automation` | `claude-code, hook, ai-agent, automation, methodology` | 收斂單複數與 AI ID；移除 `workflow`、新增 `methodology`，因正文主體是執行強度、離線處理、攔截位置與六步判斷程序，不是某條 runtime 編排。[20-41](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L20-L41)、[101-110](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/rule-ladder.md#L101-L110) |
| `sem-blast-radius.md` | `claude-code, hook, code-review, tooling` | `claude-code, hook, code-review, tooling, tool-adoption` | 保留 `tooling`：正文有 sem 能力、接點與 hook 整合；新增 `tool-adoption`：兩個月試用與採用條件是明確生命週期證據。[16-51](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/sem-blast-radius.md#L16-L51)、[71-77](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/sem-blast-radius.md#L71-L77) |
| `sol-overimplementation.md` | `claude-code, gpt, methodology` | 維持 | 事故後抽出 YAGNI 審查方法，methodology 比 retrospective 更貼近文章交付。[55-71](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/sol-overimplementation.md#L55-L71) |
| `spec-review-round.md` | `claude-code, spec-review, ai-workflow, methodology` | 維持 | spec 反問、人類拍板與 AI review 流程各有正文證據。[30-48](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/spec-review-round.md#L30-L48)、[60-66](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/spec-review-round.md#L60-L66) |
| `steal-determinism-layer.md` | `Claude Code, tool-adoption, code-review, methodology` | `claude-code, tool-adoption, code-review, methodology` | 只做產品 ID 正規化；否決工具後抽確定性層與 reviewer 落地都屬主線。[28-83](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/steal-determinism-layer.md#L28-L83) |
| `subagent-boot-cost.md` | `claude-code, subagents, token-optimization, model-routing, AI-agents` | `claude-code, subagent, token-optimization, model-routing, ai-agent` | 只收斂單複數與 AI ID；開機費、模型 routing 與能力預算都保留。[18-58](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/subagent-boot-cost.md#L18-L58) |
| `test-theater.md` | `mutation-testing, Stryker, AI-testing, test-theater, Claude Code` | `mutation-testing, Stryker, ai-testing, test-theater` | 正規化 AI ID，移除 `Claude Code`：正文談泛用 coding agent、Stryker 與 git hook。`Stryker → stryker` 等 ID／顯示名稱拍板後再決定。[33-47](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L33-L47)、[64-88](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/test-theater.md#L64-L88) |
| `token-saving-tools.md` | `claude-code, token, mcp` | `claude-code, token-optimization, mcp, tool-evaluation, tool-adoption` | `token → token-optimization`；新增 `tool-evaluation` 與 `tool-adoption`：全文先比較五種省 token 工具的收益與風險，再以實際拔除、dry-run 與留下 semble 的結果裁決。[10-34](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L10-L34)、[48-69](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L48-L69)、[83-93](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/token-saving-tools.md#L83-L93) |
| `trial-review-system.md` | `claude-code, methodology, tool-adoption, workflow` | 維持 | 工具引入、固定六步與裁決方法都是全文主線。[10-25](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/trial-review-system.md#L10-L25)、[74-80](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/trial-review-system.md#L74-L80) |
| `unattended-workflow-resume.md` | `claude-code, workflow, resume` | `claude-code, workflow, workflow-resume` | `resume → workflow-resume`，消除履歷歧義並保留精確執行機制。[34-70](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/unattended-workflow-resume.md#L34-L70)、[115-127](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/unattended-workflow-resume.md#L115-L127) |
| `vendor-benefit.md` | `claude-code, vendor-swap, llm` | 維持 | 第三方模型的額度韌性、審查與靜默降級延續 vendor 系列。[14-22](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/vendor-benefit.md#L14-L22)、[38-55](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/vendor-benefit.md#L38-L55) |
| `websearch-misses-official-docs.md` | `claude-code, websearch, fact-check, retrospective` | 維持 | WebSearch 排序、來源層級與事後修正形成一致路徑。[20-63](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/websearch-misses-official-docs.md#L20-L63) |
| `workflow-vs-skill.md` | `claude-code, workflow, skill` | 維持 | 兩個 tag 正是文章明文對照的兩種固化載體。[28-42](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/workflow-vs-skill.md#L28-L42)、[80-85](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/workflow-vs-skill.md#L80-L85) |

## 需要使用者拍板

只列會改變全站語意、UI 行為或大量文章的問題。

| 題目 | 建議答案 | 後果 | 來源 |
|---|---|---|---|
| 標準 ID 與顯示名稱是否分離？ | **建議分離**：活詞彙表存 `id`、`label`、`aliases`、維度、意思與邊界。 | 可以同時使用 `claude-code`／`mcp` 作穩定 ID，以及 `Claude Code`／`MCP` 作可讀顯示。若不分離，就不應直接把文章 frontmatter 全改成小寫 slug，否則讀者與輔助技術會讀到資料 ID。 | 現在 raw tag 直接顯示：[index.astro:288-298](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L288-L298)；schema 只有自由字串，沒有 label 或 registry：[content.config.ts:7-12](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content.config.ts#L7-L12)。 |
| tag 點擊要繼續當文字搜尋嗎？ | **建議改成標準 tag／alias 路徑；文字搜尋留在輸入框。** | tag 才會穩定串同主題文章，不再因標題、摘要或子字串多命中。若要讓 `testing` 包含 `ai-testing`，應由詞彙表明列關係，不靠字串碰巧包含。 | 目前點擊把 tag 塞進搜尋框：[index.astro:585-593](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L585-L593)；15／62 raw tag 的命中集合不等於指派集合，見 Evidence。 |
| `claude-code` 是站台身份還是文章主題？ | **建議先保留既有指派，但停止把它當每篇預設 tag；等非 Claude Code 文章增加後再重看辨識力。** | 不用立刻改 37 篇，又能避免詞彙表把站台身份誤當永遠必填欄。若選「站台身份、全面移除」，會失去直接篩出產品專屬文章的入口。 | 合併並移除 `test-theater` 後是 37／40 篇；首頁本身已明示站台定位：[index.astro:107](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L107)。 |
| `Review` topicGroup 是否改名？ | **建議改為「品質」**，membership 不變。 | 可涵蓋 code review、testing、data quality、fact check、security 與 supply chain；只改顯示語意，不重分文章。 | aliases 全量見 [index.astro:65-83](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L65-L83)；目前 13 篇 membership 見 Evidence。 |

## Coverage receipt

### 原始枚舉

計數方法：唯讀 glob `src/content/blog/*.md`，用 YAML 解析每篇 frontmatter，按精確字串建立 `Counter`；不做小寫、空格、連字號或單複數正規化。

```text
ARTICLES=40 RAW_TAGS=62 ASSIGNMENTS=156
SINGLETONS=40 REPEATED=22
```

原始 62 tag：

```text
AI-agents
AI-testing
ai-workflow
auto-memory
automation
bumblebee
Claude Code
claude-code
code-review
code-search
cost-analysis
data-quality
deep-research
evaluation
fabrication
fact-check
FFF
gpt
hook
hooks
knowledge-management
llm
llm-behavior
local-llm
matt-pocock
MCP
mcp
memory
methodology
model
model-behavior
model-routing
multi-model
mutation-testing
philosophy
prompt-caching
proxy
quota
resume
retrospective
revealed-preference
security
skill
skills
spec-review
Stryker
subagent
subagents
supply-chain
test-theater
testing
token
token-optimization
tool-adoption
tool-evaluation
tooling
vector-db
vendor-swap
verify
vscode-extension
websearch
workflow
```

### 報告覆蓋驗算

驗算方法：從本檔 `全量活詞彙表候選` 節擷取第一欄 raw tag，與 source Counter 的 key 做集合與重複計數；另擷取 `逐篇文章的初步 tag 建議` 第一欄，與 40 個來源檔名比較；再比較全量表第二欄的標準 ID 與 `標準 tag 條目` 各家族第一欄，並解析所有 file URL，驗證檔案存在與行號範圍。

```text
DECISION_ROWS=62
MISSING_RAW_TAGS=0
DUPLICATE_DECISIONS=0
ARTICLE_SUGGESTION_ROWS=40
MISSING_ARTICLES=0
DUPLICATE_ARTICLES=0
STANDARD_IDS=54
STANDARD_ENTRY_ROWS=54
MISSING_STANDARD_ENTRIES=0
EXTRA_STANDARD_ENTRIES=0
FILE_LINE_LINKS=470 MISSING_FILES=0 OUT_OF_RANGE=0
```

完成宣稱的分母來自 source glob 與 frontmatter Counter，不是從本報告反推。

## Evidence

### 權威來源

- 稽核原則：raw tag 先串同主題文章、搜尋其次；singleton 可作系列種子；活詞彙表不是封閉白名單。[brainstorm-2026-08-30.md:3-13](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/.scratch/tag-governance/brainstorm-2026-08-30.md#L3-L13)
- 文章探索 spec 原始決策：搜尋會比對 title、description、tags；寬主題由 aliases 維護，不把每個 raw tag 都做控制項。[article-discovery/spec.md:24-35](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/.scratch/article-discovery/spec.md#L24-L35)
- schema 只要求 `tags: string[]`，沒有 enum 或封閉白名單。[content.config.ts:7-12](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/content.config.ts#L7-L12)
- `topicGroups` 與 aliases：[index.astro:13-89](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L13-L89)
- raw tag 顯示與按鈕資料：[index.astro:282-303](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L282-L303)
- 搜尋資料與 topic membership 建立：[index.astro:252-266](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L252-L266)
- 搜尋是小寫子字串比對：[index.astro:494-504](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L494-L504)
- tag 點擊把 raw tag 塞進搜尋框：[index.astro:585-593](file:///Users/linhancheng/Desktop/projects/gggodlin-blog/src/pages/index.astro#L585-L593)

### Tag 點擊路徑重算

方法：逐篇建立與首頁相同的 `title + description + tags` 小寫字串，對每個 raw tag 執行相同的 `includes(query)`，再與該 raw tag 的 frontmatter 指派集合比較。

```text
RAW_TAGS=62 ROUTE_MISMATCH_TAGS=15
Claude Code(6->10)
evaluation(1->2)
hook(7->9)
llm(6->9)
MCP(1->3)
mcp(2->3)
model(1->5)
proxy(1->2)
skill(1->4)
subagent(2->3)
testing(1->2)
token(1->6)
verify(1->2)
websearch(1->2)
workflow(8->10)
```

反證也要保留：`MCP`／`mcp` 的多命中是大小寫正規化帶來的有益合流；`testing` 命中 `mutation-testing` 可能符合讀者期待。問題不是所有多命中都錯，而是目前由字串偶然決定，詞彙表無法表達哪些包含關係是刻意的。

### Topic group 全量歸屬

方法：逐篇套用 `index.astro` 現有小寫 exact alias 邏輯。

```text
workflow=13
models=12
tools=14
memory=4
quality=13
automation=8
UNGROUPED=0
MULTI_GROUP=19
```

所有現有 aliases 至少命中一個 raw tag。若採用標準 ID，需新增：

```text
workflow add=['ai-agent', 'workflow-resume'] obsolete_aliases=['ai-agents', 'resume', 'subagents']
models add=[] obsolete_aliases=['llm-behavior', 'model']
tools add=[] obsolete_aliases=['skills']
memory add=[] obsolete_aliases=[]
quality add=[] obsolete_aliases=[]
automation add=[] obsolete_aliases=['hooks']
```

舊 alias 可以暫留，活詞彙表不需要用破壞性 migration 證明整潔。

### 信心、反證與翻案條件

- **高信心**：62／62 覆蓋、tag 點擊機制、`Claude Code`／`claude-code` 的空格／連字號差、MCP 大小寫合流、單複數家族、`model-behavior` 合併、`token → token-optimization`、`test-theater` 移除 `Claude Code`，以及 absorb／agent-tool／rule-ladder 的錯配判斷。這些都有完整枚舉、code 路徑或正文直接證據。
- **中信心**：`methodology`、`retrospective`、`workflow`、`ai-workflow` 的邊界，以及 singleton 是否會長成系列。本文只做文字語意稽核，沒有讀者點擊資料，不能宣稱讀者實際採用這些路徑。
- **反證**：六個寬主題已覆蓋 40／40，現況不是分類崩壞；`tool-evaluation` 與 `tool-adoption` 雖在同一生命週期，正文顯示前後階段不同；只有大小寫差的 MCP 變體沒有造成目前搜尋分裂；40 個 singleton 中多數是精確主題或專名。
- **會推翻本報告的證據**：作者已規劃但未寫入 repo 的系列定義；讀者點擊資料顯示 `methodology` 等角度 tag 沒有串讀價值；使用者明確要 raw tag 同時充當顯示文案而拒絕 ID／顯示名稱分離；tag 點擊被刻意定義為全文搜尋捷徑而不是同 tag 導覽；`workflow` 被正式限定為 Claude Code Workflow 專名。遇到任一項，應重裁受影響家族，不把本報告當封閉白名單。

### 唯讀來源完整性

寫入本報告前，44 個指定來源的聚合 SHA-256 是：

```text
33d9fd9bd0a010c9620baead8007c41cf34fa600a14d827fe4812ed9a40bf2ea
```

寫入後以相同命令重算，結果仍是同一雜湊；tracked source diff 也為空：

```text
SOURCE_HASH_BEFORE=33d9fd9bd0a010c9620baead8007c41cf34fa600a14d827fe4812ed9a40bf2ea
SOURCE_HASH_AFTER=33d9fd9bd0a010c9620baead8007c41cf34fa600a14d827fe4812ed9a40bf2ea
TRACKED_SOURCE_DIFF=0
REPORT_LINES=478
```

本報告本身不納入 source hash。
