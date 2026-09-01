# Topic mapping audit

## Executive summary

1. 目前 40 篇文章全部至少命中 1 個首頁寬主題；分布是 0 類 0 篇、1 類 21 篇、2 類 14 篇、3 類 5 篇。計算依 `src/pages/index.astro:91-100` 的小寫化、去頭尾空白與 alias 精確相等規則，總命中數為 `21 + 14×2 + 5×3 = 64`。
2. 多重分類整體沒有失真。19 篇文章命中 2–3 類，多數確實同時跨越流程、模型、工具、驗證或 hook；明確要移除的只有 3 個主題命中：`bumblebee-still-on-disk → Review`、`dcg-safety-lock → Review`、`subagent-boot-cost → 工具`。
3. 六個主題裡最承重的問題是 `Review`：label 只像 code/spec review，alias 卻同時收 testing、fact-check、data-quality、fabrication、security、supply-chain。這是「label 過窄」與「security alias 過寬」兩個問題，不能只改其中一邊。
4. `工具` 的 `token-optimization` alias 過寬，讓一篇談 subagent 開機脈絡與能力預算的文章誤進工具類；反方向，`bumblebee-still-on-disk` 與 `retire-vector-memory` 都有完整試用及留／退裁決，卻因缺少泛用工具 raw tag 而沒進工具類。
5. `Hook` 目前 8 篇都真的以 hook 或 gate 為重要機制，沒有明確 false positive；但 `prose-exams` 的後半與結論直接以改檔提醒、結案收據 gate 為核心，屬明確 false negative。
6. raw tag 點擊不是「同 tag 文章連結」，而是把 tag 字串塞進標題、摘要、tag 的一般 substring 搜尋，並清空主題條件（`src/pages/index.astro:252-266,494-504,585-593`）。實算：點 `hook` 顯示 9 篇，但只有 7 篇真的有 `hook` raw tag；點 `skill` 顯示 4 篇，但只有 1 篇真的有 `skill` raw tag。
7. 現有 frontmatter 有 62 種精確 raw tag 寫法、40 種只出現 1 次；其中 13 種未映射。未映射本身不是錯誤，多數是人物、文章視角、產品名或站台共通標記；明確缺少工具落點的是 `bumblebee-still-on-disk` 與 `retire-vector-memory`，兩篇都應補泛用的 `tool-adoption`，不建議把所有產品名塞進 alias。

## 判讀準據與現行機制

- 分母取實際檔案 `src/content/blog/*.md`，共 40 篇。舊 spec 仍寫 39 篇（`.scratch/article-discovery/spec.md:1-3,29-30`），本次不沿用舊分母。
- 寬主題判定：raw tag 只做 `trim().toLowerCase()`，接著與各主題 alias 做精確相等；不做空白／連字號、單複數或近義詞正規化（`src/pages/index.astro:91-100`）。
- 搜尋判定：標題、摘要與 raw tags 串成一個小寫字串，再做 substring 比對（`src/pages/index.astro:251-266,494-504`）。
- raw tag 點擊：把原 tag 放進同一個搜尋框、清空 active topic，再跑一般搜尋（`src/pages/index.astro:585-593`）。因此 raw tag 與寬主題必須分開裁決。
- 本次只把「內容主軸與顯示 label 明顯不符」列成錯配。只是可再多掛一類、或文章含一節相關內容，不列錯。

## 六個主題逐一稽核

### 1. 工作流

- **目前 label**：工作流
- **目前 alias**：`workflow`、`ai-workflow`、`ai-agents`、`subagent`、`subagents`、`resume`、`deep-research`（`src/pages/index.astro:13-26`）
- **目前文章清單（13）**：`absorb-awesome-list`、`ai-report-two-lies`、`deep-research-rate-limit`、`exit-0-illusion`、`measure-revealed-adoption`、`one-model-not-enough`、`prose-exams`、`rule-ladder`、`spec-review-round`、`subagent-boot-cost`、`trial-review-system`、`unattended-workflow-resume`、`workflow-vs-skill`
- **實際涵蓋語意**：流程設計、agent／subagent 分工、多模型審查編排、deep-research、resume、工具評估與試用流程。
- **明確 false positive**：無。`measure-revealed-adoption` 雖由 `subagent` 命中，但文章有完整段落以 agent spawn 與活路徑決定增強落點，不只是順帶提到（`src/content/blog/measure-revealed-adoption.md:60-82`）。
- **明確 false negative**：無。
- **名稱寬窄**：寬度相符；內容比單純「自動化」更偏流程與編排，`工作流` 能包住。
- **建議**：**維持** label 與 alias。
- **信心**：高。13 篇皆有主軸段落支持；沒有靠標題或單一例句判定。

### 2. 模型

- **目前 label**：模型
- **目前 alias**：`llm`、`gpt`、`model`、`model-routing`、`model-behavior`、`llm-behavior`、`vendor-swap`、`local-llm`、`multi-model`、`quota`（`src/pages/index.astro:27-42`）
- **目前文章清單（12）**：`cc-vendor-swap`、`checker-layoff`、`gpt-in-cc-performance`、`gpt-in-cc`、`gpt-review-tunnel-vision`、`local-llm-hook-judge`、`model-routing`、`one-model-not-enough`、`protocol-model-dependency`、`sol-overimplementation`、`subagent-boot-cost`、`vendor-benefit`
- **實際涵蓋語意**：模型行為、供應商／端點更換、本地模型、模型路由與配額、多模型交叉審查、特定模型在工作席位上的偏差。
- **明確 false positive**：無。`checker-layoff` 與 `subagent-boot-cost` 都不是純模型文章，但模型選型、模型能力或 model-routing 是承重內容（`src/content/blog/checker-layoff.md:13-27,51-59`；`src/content/blog/subagent-boot-cost.md:10-24,58-64`）。
- **明確 false negative**：無。
- **名稱寬窄**：`模型` 略窄於實際涵蓋的供應商、端點與配額，但仍是讀者可理解的上位詞，未造成明確錯配。
- **建議**：**維持**。若未來供應商類文章繼續增加，再評估 `模型與供應商`；目前不需要為 4 篇 `vendor-swap` 文章立即改名。
- **信心**：高。

### 3. 工具

- **目前 label**：工具
- **目前 alias**：`tool-adoption`、`tool-evaluation`、`tooling`、`mcp`、`code-search`、`skills`、`skill`、`fff`、`token-optimization`、`prompt-caching`、`proxy`（`src/pages/index.astro:43-59`）
- **目前文章清單（14）**：`absorb-awesome-list`、`agent-tool-reach`、`check-my-stack`、`code-search-adoption`、`dcg-safety-lock`、`matt-philosophy`、`measure-revealed-adoption`、`proxy-warmup-cost`、`sem-blast-radius`、`steal-determinism-layer`、`subagent-boot-cost`、`token-saving-tools`、`trial-review-system`、`workflow-vs-skill`
- **實際涵蓋語意**：工具採用與評估、MCP／程式碼搜尋、skill 生態、代理服務與 prompt 快取、具名工具的實測與保留／退役。
- **明確 false positive**：`subagent-boot-cost`。它因 `token-optimization` 命中，但主軸是 subagent 固定開機脈絡、能力預算與驗證責任拆分，不是工具採用或工具設計（`src/content/blog/subagent-boot-cost.md:10-26,28-38,42-64`）。
- **明確 false negative**：`bumblebee-still-on-disk` 是兩週試用與 KEEP 裁決的工具採用案例（`src/content/blog/bumblebee-still-on-disk.md:36-50,54-72`）；`retire-vector-memory` 則記錄安裝與 hook 接線、三週試用、928 次寫入、6 項對照測試及完整拆除（`src/content/blog/retire-vector-memory.md:22-80`）。
- **名稱寬窄**：相符。
- **建議**：**調 alias**：移除 `token-optimization`。`proxy-warmup-cost` 仍會由 `prompt-caching`／`proxy` 命中，現有其他文章也不會因此失去工具落點。`bumblebee-still-on-disk` 與 `retire-vector-memory` 都應在 raw tag 層補 `tool-adoption`；不建議把產品名或 `vector-db` 加成全域工具 alias。
- **信心**：高。移除 `token-optimization` 對目前 40 篇的唯一實質移出對象就是 `subagent-boot-cost`；`proxy-warmup-cost` 另有兩個工具 alias。

### 4. 記憶

- **目前 label**：記憶
- **目前 alias**：`memory`、`auto-memory`、`knowledge-management`、`vector-db`（`src/pages/index.astro:60-64`）
- **目前文章清單（4）**：`inline-the-rules`、`keep-the-wiki-alive`、`memory-cap-reframe`、`retire-vector-memory`
- **實際涵蓋語意**：持久記憶、wiki／知識管理、MEMORY.md 容量與索引化、向量記憶退役。
- **明確 false positive**：無。
- **明確 false negative**：無。`gpt-in-cc-performance` 雖談 context 壓縮遺失結論，但主軸仍是模型行為與入口差異，不應把短期對話 context 與持久 memory 混成同一類（`src/content/blog/gpt-in-cc-performance.md:42-56`）。
- **名稱寬窄**：略窄於 wiki 與 knowledge management，但在 AI 工具語境中仍可理解，沒有誤導到需要立即更名。
- **建議**：**維持**。
- **信心**：高。

### 5. Review

- **目前 label**：Review
- **目前 alias**：`code-review`、`testing`、`mutation-testing`、`ai-testing`、`test-theater`、`evaluation`、`spec-review`、`verify`、`data-quality`、`fact-check`、`fabrication`、`security`、`supply-chain`（`src/pages/index.astro:65-83`）
- **目前文章清單（13）**：`ai-report-two-lies`、`bumblebee-still-on-disk`、`checker-layoff`、`dcg-safety-lock`、`exit-0-illusion`、`gpt-review-tunnel-vision`、`one-model-not-enough`、`prose-exams`、`sem-blast-radius`、`spec-review-round`、`steal-determinism-layer`、`test-theater`、`websearch-misses-official-docs`
- **實際涵蓋語意**：code/spec review、測試品質、AI checker 評估、證據與事實查核、資料品質、供應鏈安全與危險指令防護。實際內容已超出 `Review`。
- **明確 false positive**：
  - `bumblebee-still-on-disk`：由 `security`／`supply-chain` 命中，但文章不是 review；它是安全工具實測與採用（`src/content/blog/bumblebee-still-on-disk.md:36-50,66-72`）。
  - `dcg-safety-lock`：由 `security` 命中，但文章主軸是 PreToolUse hook 的安全攔截、誤攔成本與繞過邊界，不是 review（`src/content/blog/dcg-safety-lock.md:20-28,52-78,90-96`）。
- **明確 false negative**：`hook-watchdog`。文章從「完成宣告是否有證據」出發，核心是 verification gate 的設計邊界，卻只命中 Hook（`src/content/blog/hook-watchdog.md:20-38,56-84`）。
- **名稱寬窄**：**明顯過窄**。`Review` 無法自然告訴讀者這裡還有 testing、fact-check、data quality 與 fabrication；同時 `security`／`supply-chain` 又把範圍拉得比可信度驗證更寬。
- **建議**：**待拍板**。建議答案是把 label 改為 `品質與驗證`，保留 review／testing／evaluation／verify／data-quality／fact-check／fabrication，移除 `security`、`supply-chain`。`hook-watchdog` 應在 raw tag 層補 `verify`，不應用更寬的 alias 繞進來。
- **信心**：高。label 與 alias 的語意跨度可直接從 13 篇文章主軸對照，不依賴主觀細分類。

### 6. Hook

- **目前 label**：Hook
- **目前 alias**：`hook`、`hooks`、`automation`（`src/pages/index.astro:84-88`）
- **目前文章清單（8）**：`checker-layoff`、`dcg-safety-lock`、`hook-watchdog`、`inline-the-rules`、`local-llm-hook-judge`、`protocol-model-dependency`、`rule-ladder`、`sem-blast-radius`
- **實際涵蓋語意**：hook、gate、規則送達、自動稽核、安全攔截、模型判官與影響面注入。
- **明確 false positive**：無。雖然 alias 含 `automation`，目前由 `automation` 命中的文章本身也都以 hook 為主要機制。
- **明確 false negative**：`prose-exams`。文章後半把「改檔後提醒」與「結案時查新鮮收據」做成一組 gate，結論也把檔頭標記、考卷與結案收據閘列為三件套（`src/content/blog/prose-exams.md:37-69,79-93`）。
- **名稱寬窄**：`Hook` 略窄於 alias `automation`，但目前文章清單沒有因此誤導；每篇都真的有 hook／gate。
- **建議**：**維持** label 與 alias。若後續修 frontmatter，為 `prose-exams` 補 `hook`；不要為了抓一篇文章擴大 `automation` 的意思。
- **信心**：高。

## 40 篇文章逐篇裁決

「建議主題」以目前六個 topic id 為範圍；`Review` 欄位仍寫現有 label，是否更名見「需要使用者拍板」。raw tag 裁決與寬主題裁決分開。

| # | 文章 | current raw tags | 目前命中 | 內容主軸 | 建議主題 | raw tag 裁決 | 是否錯配 | 證據 file:line |
|---:|---|---|---|---|---|---|---|---|
| 01 | `absorb-awesome-list` | `claude-code`, `tooling`, `methodology`, `workflow` | 工作流、工具 | 百條資源包逐條判決、只吸收殘值與否決紀錄 | 工作流、工具 | 維持 | 否 | `src/content/blog/absorb-awesome-list.md:5,15-31,83-92` |
| 02 | `agent-tool-reach` | `Claude Code`, `MCP`, `code-search`, `tool-adoption`, `FFF` | 工具 | 以真實 agent 使用比例評估 code search 工具契合度 | 工具 | 語意正確；`Claude Code` 是格式 variant | 否 | `src/content/blog/agent-tool-reach.md:5,24-45,77-95` |
| 03 | `ai-report-two-lies` | `ai-workflow`, `data-quality`, `methodology` | 工作流、Review | AI 報表的查詢、證據與敘事三層可信度 | 工作流、Review | 維持 | 否 | `src/content/blog/ai-report-two-lies.md:5,14-20,46-60` |
| 04 | `bumblebee-still-on-disk` | `security`, `supply-chain`, `vscode-extension`, `bumblebee` | Review | bumblebee 磁碟掃描命中惡意 extension，並完成工具試用裁決 | 工具 | 語意正確，但缺泛用工具分類 tag | **是：Review false positive；工具 false negative** | `src/content/blog/bumblebee-still-on-disk.md:5,36-50,54-72` |
| 05 | `cc-vendor-swap` | `claude-code`, `vendor-swap`, `llm` | 模型 | Claude Code 換 vendor 的協議、功能與生態層踩坑 | 模型 | 維持 | 否 | `src/content/blog/cc-vendor-swap.md:5,12-21,57-65` |
| 06 | `check-my-stack` | `claude-code`, `tool-evaluation`, `methodology` | 工具 | 先盤點既有 stack，再評估新工具殘值 | 工具 | 維持 | 否 | `src/content/blog/check-my-stack.md:5,14-24,42-69` |
| 07 | `checker-layoff` | `claude-code`, `hook`, `llm`, `evaluation` | 模型、Review、Hook | 比較 AI checker 的精確率、成本與責任位置 | 模型、Review、Hook | 維持 | 否；三類皆有承重內容 | `src/content/blog/checker-layoff.md:5,11-27,29-39,61-79` |
| 08 | `code-search-adoption` | `claude-code`, `mcp`, `code-search` | 工具 | code search 工具的 agent 自發採用率 | 工具 | 維持 | 否 | `src/content/blog/code-search-adoption.md:5,34-58,62-76` |
| 09 | `dcg-safety-lock` | `claude-code`, `hook`, `security`, `tooling` | 工具、Review、Hook | shell 安全攔截器的真攔、誤攔、繞過與能力邊界 | 工具、Hook | raw tags 語意正確；問題在 `security → Review` alias | **是：Review false positive** | `src/content/blog/dcg-safety-lock.md:5,20-28,52-78,90-96` |
| 10 | `deep-research-rate-limit` | `claude-code`, `workflow`, `deep-research` | 工作流 | deep-research workflow 的 burst 限流與 paced fork | 工作流 | 維持 | 否 | `src/content/blog/deep-research-rate-limit.md:5,24-45,77-104` |
| 11 | `exit-0-illusion` | `claude-code`, `subagent`, `fabrication`, `verify` | 工作流、Review | 報告層成功與結果層完成之間的落差 | 工作流、Review | 維持 | 否 | `src/content/blog/exit-0-illusion.md:5,22-35,102-125` |
| 12 | `gpt-in-cc-performance` | `claude-code`, `vendor-swap`, `gpt`, `llm`, `model-behavior` | 模型 | GPT 與 Fable 對規則、skill 與壓縮的行為差異 | 模型 | 維持 | 否 | `src/content/blog/gpt-in-cc-performance.md:5,10-30,42-56` |
| 13 | `gpt-in-cc` | `claude-code`, `vendor-swap`, `gpt`, `llm` | 模型 | GPT 接進 Claude Code 的生態、設定與 context 邊界 | 模型 | 維持 | 否 | `src/content/blog/gpt-in-cc.md:5,18-46,56-64` |
| 14 | `gpt-review-tunnel-vision` | `claude-code`, `gpt`, `code-review`, `methodology` | 模型、Review | GPT review finding 膨脹與停止條件治理 | 模型、Review | 維持 | 否 | `src/content/blog/gpt-review-tunnel-vision.md:5,14-22,34-61` |
| 15 | `hook-watchdog` | `claude-code`, `hook`, `automation`, `methodology` | Hook | 完成宣告的證據 gate，以及 regex／程式／語意判斷邊界 | Review、Hook | 語意正確，但缺 `verify` 類 tag | **是：Review false negative** | `src/content/blog/hook-watchdog.md:5,20-38,56-84` |
| 16 | `inline-the-rules` | `claude-code`, `memory`, `hook`, `methodology` | 記憶、Hook | 記憶規範的送達率與 hook 內嵌 | 記憶、Hook | 維持 | 否 | `src/content/blog/inline-the-rules.md:5,14-32,34-44` |
| 17 | `keep-the-wiki-alive` | `claude-code`, `memory`, `knowledge-management`, `retrospective` | 記憶 | wiki／memory 的生命週期與每日健康度迴圈 | 記憶 | 維持 | 否 | `src/content/blog/keep-the-wiki-alive.md:5,26-37,63-73,103-113` |
| 18 | `local-llm-hook-judge` | `claude-code`, `local-llm`, `hook`, `llm` | 模型、Hook | 本地小模型在低延遲 hook 判官職位的試用與收窄 | 模型、Hook | 維持 | 否 | `src/content/blog/local-llm-hook-judge.md:5,18-35,44-68,86-100` |
| 19 | `matt-philosophy` | `claude-code`, `skills`, `matt-pocock`, `philosophy` | 工具 | Matt Pocock 的 skill 設計哲學與作者自身流程對照 | 工具 | `skills`／`skill` 是單複數 variant；語意不錯 | 否 | `src/content/blog/matt-philosophy.md:5,20-46,48-82,104-132` |
| 20 | `measure-revealed-adoption` | `Claude Code`, `tool-adoption`, `subagent`, `methodology`, `revealed-preference` | 工作流、工具 | 用 session 行為資料判斷工具與 agent 的真實採用 | 工作流、工具 | 語意正確；`Claude Code` 是格式 variant | 否；`subagent` 不是只出現一次的陪襯 | `src/content/blog/measure-revealed-adoption.md:5,18,38-56,60-82,103-129` |
| 21 | `memory-cap-reframe` | `claude-code`, `memory`, `auto-memory` | 記憶 | MEMORY.md 上限、旁路注入與索引化重組 | 記憶 | 維持 | 否 | `src/content/blog/memory-cap-reframe.md:5,16-40,44-50` |
| 22 | `model-routing` | `claude-code`, `model-routing`, `quota`, `methodology` | 模型 | 依任務判斷力分配模型與 effort，管理配額 | 模型 | 維持 | 否 | `src/content/blog/model-routing.md:5,51-81,83-111` |
| 23 | `one-model-not-enough` | `Claude Code`, `code-review`, `multi-model`, `workflow` | 工作流、模型、Review | 多模型、多視角與確定性資料組成的 PR review workflow | 工作流、模型、Review | 語意正確；`Claude Code` 是格式 variant | 否；三類皆是文章主軸 | `src/content/blog/one-model-not-enough.md:5,8-22,24-40,42-95` |
| 24 | `prose-exams` | `claude-code`, `testing`, `workflow`, `methodology` | 工作流、Review | skill 回歸考卷、檔頭入口與結案收據 gate | 工作流、Review、Hook | 語意正確，但缺 `hook` | **是：Hook false negative** | `src/content/blog/prose-exams.md:5,15-35,37-69,79-93` |
| 25 | `protocol-model-dependency` | `Claude Code`, `hook`, `model`, `llm-behavior` | 模型、Hook | 同一常駐指示在不同模型下的遵循差異與 hook 化 | 模型、Hook | 語意正確；`Claude Code` 是格式 variant | 否 | `src/content/blog/protocol-model-dependency.md:5,14-26,28-54,58-68` |
| 26 | `proxy-warmup-cost` | `claude-code`, `token-optimization`, `prompt-caching`, `proxy`, `cost-analysis` | 工具 | 省 token proxy 的暖機費與回本模型 | 工具 | 維持；移除 `token-optimization` alias 後仍由另外兩個 alias 命中 | 否 | `src/content/blog/proxy-warmup-cost.md:5,10-18,27-50,52-58` |
| 27 | `retire-vector-memory` | `claude-code`, `memory`, `vector-db`, `retrospective` | 記憶 | 向量記憶的安裝、試用、低採用、低檢索品質與退役 | 工具、記憶 | 語意正確，但缺 `tool-adoption` | **是：工具 false negative** | `src/content/blog/retire-vector-memory.md:5,22-80,99-108` |
| 28 | `rule-ladder` | `claude-code`, `hooks`, `workflow`, `AI-agents`, `automation` | 工作流、Hook | 從文字規則到人類放行碼的執行強度與位置選擇 | 工作流、Hook | `hooks`／`hook` 是單複數 variant；語意不錯 | 否 | `src/content/blog/rule-ladder.md:5,20-49,63-87,101-110` |
| 29 | `sem-blast-radius` | `claude-code`, `hook`, `code-review`, `tooling` | 工具、Review、Hook | 用 sem 與 hook 把改動影響面送進 review | 工具、Review、Hook | 維持 | 否；三類皆有直接機制 | `src/content/blog/sem-blast-radius.md:5,16-37,45-59,71-77` |
| 30 | `sol-overimplementation` | `claude-code`, `gpt`, `methodology` | 模型 | GPT-5.6 Sol 的需求層過度設計案例與 YAGNI 審查 | 模型 | 維持；`Review` 有次要關聯，但不足以列明確缺漏 | 否 | `src/content/blog/sol-overimplementation.md:5,18-28,30-53,55-71` |
| 31 | `spec-review-round` | `claude-code`, `spec-review`, `ai-workflow`, `methodology` | 工作流、Review | spec 反問、逼證據與人類拍板迴路 | 工作流、Review | 維持 | 否 | `src/content/blog/spec-review-round.md:5,10-22,30-48,50-66` |
| 32 | `steal-determinism-layer` | `Claude Code`, `tool-adoption`, `code-review`, `methodology` | 工具、Review | 否決 AI 工具本體後，吸收確定性工程層 | 工具、Review | 語意正確；`Claude Code` 是格式 variant | 否 | `src/content/blog/steal-determinism-layer.md:5,18-37,39-57,94-108` |
| 33 | `subagent-boot-cost` | `claude-code`, `subagents`, `token-optimization`, `model-routing`, `AI-agents` | 工作流、模型、工具 | subagent 固定開機脈絡、能力預算與驗證責任拆分 | 工作流、模型 | raw tags 語意正確；問題在 `token-optimization → 工具` alias | **是：工具 false positive** | `src/content/blog/subagent-boot-cost.md:5,10-26,28-38,42-64` |
| 34 | `test-theater` | `mutation-testing`, `Stryker`, `AI-testing`, `test-theater`, `Claude Code` | Review | mutation testing 揭露 AI 測試的假綠與 push 前 gate | Review | 語意正確；`Claude Code` 是格式 variant；`Stryker` 不必映射 | 否；Hook 是支持機制，不是必補主題 | `src/content/blog/test-theater.md:5,16-37,49-76,78-106` |
| 35 | `token-saving-tools` | `claude-code`, `token`, `mcp` | 工具 | 五類省 token 工具的實測、資訊損失與整合風險 | 工具 | 維持；`token` 未映射不影響現有工具落點 | 否 | `src/content/blog/token-saving-tools.md:5,16-34,48-69,73-99` |
| 36 | `trial-review-system` | `claude-code`, `methodology`, `tool-adoption`, `workflow` | 工作流、工具 | 工具試用的開案、提醒、裁決、執行與沉澱制度 | 工作流、工具 | 維持 | 否 | `src/content/blog/trial-review-system.md:5,10-25,27-50,52-80` |
| 37 | `unattended-workflow-resume` | `claude-code`, `workflow`, `resume` | 工作流 | workflow pause／resume 的確定性、快取與額度監控 | 工作流 | 維持 | 否 | `src/content/blog/unattended-workflow-resume.md:5,20-48,52-67,70-109` |
| 38 | `vendor-benefit` | `claude-code`, `vendor-swap`, `llm` | 模型 | 換 vendor 帶來的額度韌性、審查與靜默降級代價 | 模型 | 維持 | 否 | `src/content/blog/vendor-benefit.md:5,14-28,38-57,69-79` |
| 39 | `websearch-misses-official-docs` | `claude-code`, `websearch`, `fact-check`, `retrospective` | Review | WebSearch 漏官方文件，以及雙路查證方法 | Review | 維持；`websearch` 未映射不等於錯誤 | 否；工具屬性存在，但 fact-check 是文章收束主軸 | `src/content/blog/websearch-misses-official-docs.md:5,20-31,34-47,63-73` |
| 40 | `workflow-vs-skill` | `claude-code`, `workflow`, `skill` | 工作流、工具 | workflow 與 skill 的固化責任分工 | 工作流、工具 | `skill`／`skills` 是單複數 variant；語意不錯 | 否 | `src/content/blog/workflow-vs-skill.md:5,14-42,46-65,68-85` |

## 多重分類是否失真

### 合理的 2–3 類命中

- **流程 × 工具**：`absorb-awesome-list`、`measure-revealed-adoption`、`trial-review-system`、`workflow-vs-skill`。文章同時談做事流程與工具／skill 的採用或固化。
- **流程 × 驗證**：`ai-report-two-lies`、`exit-0-illusion`、`prose-exams`、`spec-review-round`。流程本身就是可信度或驗收機制。
- **模型 × Hook**：`local-llm-hook-judge`、`protocol-model-dependency`。模型行為與 hook 接線缺一不可。
- **模型 × Review**：`gpt-review-tunnel-vision`。模型行為只在 review 席位上成立。
- **記憶 × Hook**：`inline-the-rules`。記憶規範與送達機制是同一條因果鏈。
- **流程 × Hook**：`rule-ladder`。文章直接比較從規則、skill 到 hook／人工放行的強度。
- **工具 × Review**：`steal-determinism-layer`。工具評估的殘值直接進 code review。
- **三類合理**：
  - `checker-layoff`：模型判官、checker 評估、hook 職位。
  - `one-model-not-enough`：多模型、review、workflow 編排。
  - `sem-blast-radius`：sem 工具、review 輸入、hook 注入。

### alias 過寬造成的明確失真

1. `security`／`supply-chain → Review`
   - `bumblebee-still-on-disk` 因此成為 Review 單類文章，但內容是安全工具採用。
   - `dcg-safety-lock` 因此成為三類文章，但 Review 並非內容主軸。
2. `token-optimization → 工具`
   - `subagent-boot-cost` 因此成為三類文章；其 token 討論是在計算 subagent 能力預算，不是工具類內容。

### 邊界個案，稽核後維持

- `measure-revealed-adoption → 工作流`：`subagent` alias 的確寬，但文章拿 agent spawn 數決定增強應放在哪條活路徑，工作流命中仍合理。
- `checker-layoff → 模型`：文章不是模型排行榜，但模型換考卷後精確率與召回率翻轉，是裁決的重要證據。
- `test-theater → Hook` 未補：push gate 是讓 mutation testing 被採用的支持機制；全文主軸仍是測試品質，未命中 Hook 不構成明確錯配。

## 0／1／2／3 類分布

| 命中主題數 | 文章數 | 計算方式 |
|---:|---:|---|
| 0 | 0 | 40 篇逐篇套用 `getTopicIds` 等價規則，無空集合 |
| 1 | 21 | 逐篇命中 id 數量等於 1 |
| 2 | 14 | 逐篇命中 id 數量等於 2 |
| 3 | 5 | `checker-layoff`、`dcg-safety-lock`、`one-model-not-enough`、`sem-blast-radius`、`subagent-boot-cost` |

驗算：`0 + 21 + 14 + 5 = 40` 篇；總主題命中數 `0×0 + 21×1 + 14×2 + 5×3 = 64`；平均每篇 `64 ÷ 40 = 1.6` 類。

這個分布本身不顯示過度分類。真正有問題的是 5 篇三類文章中的 2 篇：`dcg-safety-lock` 與 `subagent-boot-cost` 各有 1 個 alias 過寬命中；另外 3 篇三類文章合理。

## 未映射 raw tag

目前共有 62 種精確 raw tag 寫法、156 次 tag 指派；13 種未映射。以下不因「未映射」直接判錯。

| 未映射 raw tag | 次數 | 是否應影響寬主題 | 裁決 |
|---|---:|---|---|
| `bumblebee` | 1 | **是，文章應進工具** | 產品 tag 本身可保留；建議文章另補 `tool-adoption`／`tooling`，不要把每個產品名都加成 alias |
| `Claude Code` | 6 | 否 | 與 `claude-code` 同概念但格式不同；共同標記過廣，不應成寬主題。raw tag 詞彙應統一為 `claude-code` |
| `claude-code` | 32 | 否 | 38／40 篇中的站台共通標記，映射後幾乎失去篩選力；維持未映射 |
| `cost-analysis` | 1 | 否 | `proxy-warmup-cost` 已由 `prompt-caching`／`proxy` 進工具；成本分析是文章方法，不需另映射 |
| `matt-pocock` | 1 | 否 | 人物 tag，文章已由 `skills` 進工具 |
| `methodology` | 13 | 否 | 橫跨多類的方法論標記；映射到任一寬主題都會製造大量 false positive |
| `philosophy` | 1 | 否 | 文章視角，不是首頁六類之一 |
| `retrospective` | 3 | 否 | 文體／證據來源標記，不是內容領域 |
| `revealed-preference` | 1 | 否 | 方法論概念，文章已進工作流與工具 |
| `Stryker` | 1 | 否 | 產品 tag；文章已由 testing aliases 進 Review |
| `token` | 1 | 否 | 過廣；`token-saving-tools` 已由 `mcp` 進工具 |
| `vscode-extension` | 1 | 否 | 生態標記，不應把所有 extension 文章一律送進工具；本篇用泛用工具分類修正即可 |
| `websearch` | 1 | 否 | 文章主軸收束在 fact-check；目前進 Review 已足夠，未映射不是缺陷 |

### raw tag 詞彙變體

- `Claude Code` 6 篇與 `claude-code` 32 篇是同一概念、不同分隔符。`normalizeValue` 不會把空白與連字號視為相同（`src/pages/index.astro:91-96`）。
- `hook` 7 篇／`hooks` 1 篇、`skill` 1 篇／`skills` 1 篇、`subagent` 2 篇／`subagents` 1 篇。寬主題 alias 已逐一列出單複數，所以 topic mapping 不受影響；raw tag 點擊仍受 substring 方向影響。
- 大小寫本身會被小寫化，像 `MCP`／`mcp` 不會拆開；空白、連字號與單複數才會。

## raw tag 點擊語意稽核

brainstorm 已拍板 raw tag 的首要用途是串聯同主題文章，搜尋價值其次（`.scratch/tag-governance/brainstorm-2026-08-30.md:3-5`）。目前實作卻是一般搜尋捷徑，不是 tag relation：

1. `data-search` 同時包含 title、description、tags（`src/pages/index.astro:251-266`）。
2. 點 raw tag 後，程式把 tag 填進搜尋框、清空主題、執行 substring 搜尋（`src/pages/index.astro:585-593`）。
3. 因此同 tag 文章一定會出現，但也可能混入只在標題或摘要提到同字串的文章。

實際重算：

| 點擊字串 | 真正帶該 normalized raw tag | 點擊後顯示 | 額外文章 |
|---|---:|---:|---|
| `Claude Code` | 6 | 10 | `cc-vendor-swap`、`gpt-in-cc-performance`、`gpt-in-cc`、`vendor-benefit` |
| `claude-code` | 32 | 32 | 無 |
| `hook` | 7 | 9 | `retire-vector-memory`、`rule-ladder` |
| `hooks` | 1 | 1 | 無 |
| `skill` | 1 | 4 | `matt-philosophy`、`prose-exams`、`rule-ladder` |
| `skills` | 1 | 1 | 無 |
| `subagent` | 2 | 3 | `subagent-boot-cost` |
| `subagents` | 1 | 1 | 無 |
| `websearch` | 1 | 2 | `cc-vendor-swap` |

這不是 topic alias 的錯，而是 raw tag 點擊語意與一般搜尋共用同一條路。若產品定義仍是「raw tag 正式串聯同主題文章」，目前機制不符合該定義；若產品定義改成「點 tag 只是幫你填搜尋字」，目前機制才算相符。

## 需要使用者拍板

| 題目 | 建議答案 | 後果 | 來源 |
|---|---|---|---|
| `Review` 到底是窄的 code/spec review，還是寬的品質可信度入口？ | **改 label 為 `品質與驗證`，並移除 `security`、`supply-chain` aliases。** | label 會符合 testing、fact-check、data-quality、fabrication；`bumblebee-still-on-disk` 改進工具，`dcg-safety-lock` 留工具＋Hook。若維持 `Review`，就必須再移除更多非 review aliases，會讓多篇文章失去現有入口。 | alias 跨度：`src/pages/index.astro:65-83`；security false positives：`src/content/blog/bumblebee-still-on-disk.md:36-50,66-72`、`src/content/blog/dcg-safety-lock.md:20-28,52-78,90-96`；verification false negative：`src/content/blog/hook-watchdog.md:20-38,56-84` |
| raw tag 點擊要表示「同 raw tag 關係」，還是「把 tag 當一般搜尋詞」？ | **採同 raw tag 關係；一般搜尋仍由搜尋框負責。** 同時把 6 篇 `Claude Code` 統一成 `claude-code`，單複數 variant 再按詞彙表決定 canonical 寫法。 | 點擊結果不再混入只在標題／摘要提到字串的文章；`hook`、`skill`、`subagent` 等點擊結果會縮回真正帶 tag 的集合。這會改變全站 raw tag 導覽語意，但不改六個寬主題。 | 已拍板用途：`.scratch/tag-governance/brainstorm-2026-08-30.md:3-5`；現行搜尋與點擊：`src/pages/index.astro:251-266,494-504,585-593`；`Claude Code` 6 篇來源：`agent-tool-reach.md:5`、`measure-revealed-adoption.md:5`、`one-model-not-enough.md:5`、`protocol-model-dependency.md:5`、`steal-determinism-layer.md:5`、`test-theater.md:5` |

## 反證與翻案條件

- **對 `Review` 的反證**：如果站主明文定義 `Review` 就是「所有可信度、安全與品質防線」的品牌名，而不是讀者通常理解的 code/spec review，`bumblebee-still-on-disk` 與 `dcg-safety-lock` 可不算 false positive；但 label 仍需讓讀者知道這個特殊定義。這項定義會推翻「移除 security aliases」的建議。
- **對 raw tag 點擊的反證**：如果產品意圖本來就是搜尋捷徑，不保證只串同 tag 文章，9／7、4／1 這些額外結果不是缺陷，只是現行行為。這會把問題從「機制不符」降成「brainstorm 定義需要改寫」。
- **對 false negative 的反證**：若首頁主題只收文章第一主軸、不收重要支持機制，`prose-exams → Hook` 可以不補；但目前既有多重分類已收次主軸，因此採這個新標準會要求全 40 篇重算，不能只套在單篇。
- **整體信心**：高。40 篇全文、topicGroups、getTopicIds、搜尋與 tag click 邏輯都直接讀取；分類邊界只在上述 3 個可翻案前提下保留。

## Coverage receipt

- **來源文章枚舉數**：40。分母來自 `src/content/blog/*.md` 的檔案清單，不由本報告反推。
- **逐篇裁決列數**：40，表格編號 `01`–`40`。
- **缺漏數**：0。
- **重複數**：0；每個 slug 只出現 1 次逐篇裁決列。
- **六主題覆蓋**：6／6，逐一包含 label、alias、文章清單、涵蓋語意、false positive、false negative、名稱寬窄、建議與信心。
- **主題文章數驗算**：工作流 13、模型 12、工具 14、記憶 4、Review 13、Hook 8；合計 64 次主題命中，與 0／1／2／3 類分布的 `21 + 28 + 15 = 64` 相符。
- **raw tag 覆蓋**：62 種精確寫法中，13 種未映射已逐一裁決；未映射不等於錯配。
