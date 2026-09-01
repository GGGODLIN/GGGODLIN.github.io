# Expected article relationships

## 方法與反循環規則

這份圖只回答「從正文與作者意圖看，哪些文章應該互相走得到」。它不比較現有 tag，也不提出 UI 實作。brief 已先把預期關係圖定位成實際 tag 圖之前的獨立基準，且明說 singleton／孤島不必消滅、泛用 tag 不能單獨證明系列關係（`/.scratch/tag-relationship-audit/brief.md:9-16`）。

分組時遵守以下規則：

1. **不能用現有 tag 當分組證據。** 我完整讀過正文，但忽略每篇 frontmatter 的 `tags`；下文沒有任何關係以 tag 共現支撐。
2. **明文優先。** 正文寫出「上一篇／前篇／下一篇／續集／同一家族／系列第幾篇／自然接續」或直接指向另一篇時，記為 `explicit`。
3. **共同問題必須窄到能排除近鄰。** 只有相同工具、同一事故、同一實驗鏈、同一治理機制或互補的前後步驟，才可推成 `strong-inferred`；只共享「AI、Claude Code、review、memory、工具評估」這類大題，不能成線。
4. **時間相近、題目相似、用到同一名詞都不夠。** 例如 codebase 搜尋與改動影響面都碰程式碼理解，但前者研究 agent 會不會主動採用工具，後者刻意不讓 agent 自己查，兩者不能只因主題接近就併成同一系列（`/src/content/blog/code-search-adoption.md:98-108`；`/src/content/blog/sem-blast-radius.md:30-43`）。
5. **工具評估→採用→退役不能自動串線。** 只有同一工具、正文直接引用，或文章明文把它們排成同一套方法的不同尺度，才建立關係；紙上結構推論不能冒充實機試用（`/src/content/blog/agent-tool-reach.md:89-99`）。
6. **一篇可屬多個系列，但主要狀態只能有一個。** 系列是多對多關係；roster 的主要狀態只是方便驗算，不限制文章只能有一條邊。
7. **保留反證。** 若正文主動縮窄外推、說明樣本不相同、或把自己定位成單篇，就不因標題相似硬連。

狀態定義：

- `explicit-series`：目前 40 篇中至少有一篇正文明文指出這篇與另一篇的先後、同族、延伸或具名承接關係。
- `inferred-series`：沒有明文系列宣告，但正文的核心問題、案例或方法步驟足以形成窄而可辯護的關係。
- `intentional-island`：目前沒有必要連線；保留為獨立題材或未成熟系列種子。
- `uncertain`：只有作者本人能決定是否連線，正文不足以判斷。

## 全量 40 篇 roster

<!-- roster:start -->
| 文章 | 主要狀態 | 主要判定依據 |
|---|---|---|
| `absorb-awesome-list.md` | `explicit-series` | 正文把單一工具競合、採用率、抽取碎片與整包消化排成同一條方法尺度（`/src/content/blog/absorb-awesome-list.md:85-92`）。 |
| `agent-tool-reach.md` | `explicit-series` | 開頭直接稱 `code-search-adoption` 為前篇，並區分前篇實機裸測與本篇紙上推論（`/src/content/blog/agent-tool-reach.md:10-12`；`/src/content/blog/agent-tool-reach.md:89-99`）。 |
| `ai-report-two-lies.md` | `intentional-island` | 核心是 ShopifyQL 查詢、資料列登錄與儲存格對位的三層報表架構，正文未指向站內其他文章（`/src/content/blog/ai-report-two-lies.md:14-20`；`/src/content/blog/ai-report-two-lies.md:46-60`）。 |
| `bumblebee-still-on-disk.md` | `inferred-series` | 正文記錄工具接入每日分析、觀察三次掃描，到回顧日判 KEEP，和試用回顧制度形成完整案例關係（`/src/content/blog/bumblebee-still-on-disk.md:46-58`；`/src/content/blog/bumblebee-still-on-disk.md:66-72`）。 |
| `cc-vendor-swap.md` | `explicit-series` | `gpt-in-cc` 明文把它列為模型供應商系列前兩篇之一，`vendor-benefit` 也直接稱它為上一篇代價篇（`/src/content/blog/gpt-in-cc.md:10-16`；`/src/content/blog/vendor-benefit.md:8-12`）。 |
| `check-my-stack.md` | `explicit-series` | 正文直接把 `retire-vector-memory` 稱為這系列第一篇，並把先例帶進工具競合方法（`/src/content/blog/check-my-stack.md:26-40`）。 |
| `checker-layoff.md` | `explicit-series` | 正文直接回指 `local-llm-hook-judge` 的完成宣告判官，並延續同一職位的去留檢查（`/src/content/blog/checker-layoff.md:61-69`）。 |
| `code-search-adoption.md` | `explicit-series` | `agent-tool-reach` 稱它為前篇；`measure-revealed-adoption` 又明說它是系列裡談採用率為真跑分的一篇（`/src/content/blog/agent-tool-reach.md:10-12`；`/src/content/blog/measure-revealed-adoption.md:119-129`）。 |
| `dcg-safety-lock.md` | `explicit-series` | 本文回指 `steal-determinism-layer` 的確定性主張，`rule-ladder` 再把本文列為防線過硬的既有案例（`/src/content/blog/dcg-safety-lock.md:20-28`；`/src/content/blog/rule-ladder.md:8-18`）。 |
| `deep-research-rate-limit.md` | `explicit-series` | 開頭回指 workflow 基礎篇，後段把下一道 5 小時額度牆交給 `unattended-workflow-resume`（`/src/content/blog/deep-research-rate-limit.md:8-10`；`/src/content/blog/deep-research-rate-limit.md:77-95`）。 |
| `exit-0-illusion.md` | `explicit-series` | `protocol-model-dependency` 明文稱兩篇是同一家族，分別處理「報告成功不等於做對」與「沒訊號不等於沒事」（`/src/content/blog/protocol-model-dependency.md:58-68`）。 |
| `gpt-in-cc-performance.md` | `explicit-series` | 開頭直接承接 `gpt-in-cc` 的接入工程，後文又把該篇的 skill 觸發雷重新解釋成模型性格差異（`/src/content/blog/gpt-in-cc-performance.md:8-12`；`/src/content/blog/gpt-in-cc-performance.md:26-30`）。 |
| `gpt-in-cc.md` | `explicit-series` | 正文明說它是模型供應商系列第三篇，前兩篇是 `cc-vendor-swap` 與 `vendor-benefit`（`/src/content/blog/gpt-in-cc.md:10-16`）。 |
| `gpt-review-tunnel-vision.md` | `explicit-series` | 正文直接把 `gpt-in-cc-performance` 的服從性與 `sol-overimplementation` 的需求膨脹當成前情（`/src/content/blog/gpt-review-tunnel-vision.md:14-30`）。 |
| `hook-watchdog.md` | `explicit-series` | 本文回指確定性層，並明文把規則處理不了的剩餘案件交給下一篇 `local-llm-hook-judge`（`/src/content/blog/hook-watchdog.md:70-86`）。 |
| `inline-the-rules.md` | `explicit-series` | 結尾直接把「規則是否送達」與 `protocol-model-dependency` 的「送達後是否遵守」拆成前後兩題（`/src/content/blog/inline-the-rules.md:34-46`）。 |
| `keep-the-wiki-alive.md` | `explicit-series` | 正文稱 `retire-vector-memory` 為前一篇，從退役向量層接到 wiki 維運（`/src/content/blog/keep-the-wiki-alive.md:16-30`）。 |
| `local-llm-hook-judge.md` | `explicit-series` | 開頭明文承接 `hook-watchdog` 剩下的三分之一語意案件（`/src/content/blog/local-llm-hook-judge.md:8-16`）。 |
| `matt-philosophy.md` | `intentional-island` | 本文是對外部作者公開論述與自身九軸立場的比較，還主動揭露取樣污染與推論邊界；目前沒有站內文章承接同一比較案（`/src/content/blog/matt-philosophy.md:18-18`；`/src/content/blog/matt-philosophy.md:86-118`）。 |
| `measure-revealed-adoption.md` | `explicit-series` | 結尾明說本篇只處理怎麼量，並把 `code-search-adoption` 與 `check-my-stack` 放回同一系列分工（`/src/content/blog/measure-revealed-adoption.md:119-129`）。 |
| `memory-cap-reframe.md` | `explicit-series` | 開頭直接稱 `keep-the-wiki-alive` 為上一篇，從撞牆脈絡接到三類解法（`/src/content/blog/memory-cap-reframe.md:8-18`）。 |
| `model-routing.md` | `explicit-series` | 正文把確定性執行原則回指 `steal-determinism-layer`，也把多模型第二意見細節回指 `one-model-not-enough`（`/src/content/blog/model-routing.md:75-81`；`/src/content/blog/model-routing.md:83-91`）。 |
| `one-model-not-enough.md` | `explicit-series` | `spec-review-round` 直接以本文的「多視角找」作為下一步問題的起點（`/src/content/blog/spec-review-round.md:8-10`）。 |
| `prose-exams.md` | `explicit-series` | `rule-ladder` 明文把本文列為「把檢查搬到結案收據」的已結案案例（`/src/content/blog/rule-ladder.md:63-69`）。 |
| `protocol-model-dependency.md` | `explicit-series` | 正文明說它與 `exit-0-illusion` 同一家族，並把本文與另一篇 hook 架構文章刻意區分（`/src/content/blog/protocol-model-dependency.md:58-68`）。 |
| `proxy-warmup-cost.md` | `inferred-series` | 本文把 custom-base proxy 的固定暖機費加入回本計算，和 `token-saving-tools` 對省 token 工具分母與整合代價的追問互補（`/src/content/blog/proxy-warmup-cost.md:8-17`；`/src/content/blog/proxy-warmup-cost.md:38-58`）。 |
| `retire-vector-memory.md` | `explicit-series` | `check-my-stack` 稱它為系列第一篇，`keep-the-wiki-alive` 又稱它為前一篇（`/src/content/blog/check-my-stack.md:26-30`；`/src/content/blog/keep-the-wiki-alive.md:16-22`）。 |
| `rule-ladder.md` | `explicit-series` | 本文直接統整 `dcg-safety-lock`、`checker-layoff`、`test-theater` 與 `prose-exams` 的防線強度與位置（`/src/content/blog/rule-ladder.md:8-18`；`/src/content/blog/rule-ladder.md:63-75`）。 |
| `sem-blast-radius.md` | `inferred-series` | 兩篇都把 sem 當作 review 前的影響面資料層；本文完整展開同一接法與成績單，但兩篇沒有文章互引（`/src/content/blog/one-model-not-enough.md:34-40`；`/src/content/blog/sem-blast-radius.md:30-49`）。 |
| `sol-overimplementation.md` | `explicit-series` | `gpt-review-tunnel-vision` 明文把本文定位成先前談需求膨脹的一篇（`/src/content/blog/gpt-review-tunnel-vision.md:14-22`）。 |
| `spec-review-round.md` | `explicit-series` | 開頭直接承接 `one-model-not-enough`，把問題從「多視角找」推進到「找到後信不信」（`/src/content/blog/spec-review-round.md:8-22`）。 |
| `steal-determinism-layer.md` | `explicit-series` | 結尾明說它是 `measure-revealed-adoption` 的自然接續（`/src/content/blog/steal-determinism-layer.md:94-108`）。 |
| `subagent-boot-cost.md` | `inferred-series` | 開頭明說它在模型路由上線後重算 subagent 固定啟動成本，後段把成本與驗證責任一起收束（`/src/content/blog/subagent-boot-cost.md:8-16`；`/src/content/blog/subagent-boot-cost.md:50-64`）。 |
| `test-theater.md` | `explicit-series` | `rule-ladder` 明文把本文列為把測試品質檢查從 commit 提醒搬到 push 前攔截的已結案案例（`/src/content/blog/rule-ladder.md:63-69`）。 |
| `token-saving-tools.md` | `inferred-series` | 本文逐案追問實際省幅、資訊損失與整合風險，並預告真正省成本的方向是把工作交給便宜模型（`/src/content/blog/token-saving-tools.md:8-14`；`/src/content/blog/token-saving-tools.md:42-46`；`/src/content/blog/token-saving-tools.md:93-99`）。 |
| `trial-review-system.md` | `inferred-series` | 本文把「值不值得試」與「試完是否留下」拆成入口與出口，正好補齊既有工具評估文章的後半段（`/src/content/blog/trial-review-system.md:8-25`）。 |
| `unattended-workflow-resume.md` | `explicit-series` | 正文明說它是 `deep-research-rate-limit` 的續集，前篇節流後才浮出 5 小時額度問題（`/src/content/blog/unattended-workflow-resume.md:8-16`）。 |
| `vendor-benefit.md` | `explicit-series` | 開頭直接稱 `cc-vendor-swap` 為上一篇代價篇，回答「為什麼還換」（`/src/content/blog/vendor-benefit.md:8-18`）。 |
| `websearch-misses-official-docs.md` | `inferred-series` | 核心案例是 AI 把相關來源說成官方文件，最後以獨立工具路徑驗證，與「報告層不等於現實」形成同一窄問題家族（`/src/content/blog/websearch-misses-official-docs.md:8-27`；`/src/content/blog/websearch-misses-official-docs.md:63-73`）。 |
| `workflow-vs-skill.md` | `explicit-series` | 本文把 deep-research paced 列為 workflow 固化實例，`deep-research-rate-limit` 也回指本文的功能說明（`/src/content/blog/workflow-vs-skill.md:28-42`；`/src/content/blog/workflow-vs-skill.md:62-65`；`/src/content/blog/deep-research-rate-limit.md:8-10`）。 |
<!-- roster:end -->

## 預期系列

下列白話名稱只用來讓非工程師理解文章群在談什麼，**不是 tag 命名提案**。

### S01 — 工具不是看起來厲害就裝，要看它在你的環境剩多少價值

**最小必要共同概念**：工具價值必須相對既有工作方式、真實採用與退出結果計算；不能只看 README、星數或口頭意願。

| 文章 | 加入理由 | 正文證據 | 關係強度 |
|---|---|---|---|
| `retire-vector-memory.md` | 用寫入 928 次、搜尋 3 次與六組對照把已安裝工具退役，成為系列最早的行為資料案例。 | `/src/content/blog/retire-vector-memory.md:26-39`、`:43-72`；`/src/content/blog/check-my-stack.md:26-30` | `explicit` |
| `check-my-stack.md` | 把「先盤點自己，再看工具賣點」整理成總綱，並明文稱前者為系列第一篇。 | `/src/content/blog/check-my-stack.md:10-18`、`:26-30` | `explicit` |
| `code-search-adoption.md` | 把工具能力與 agent 是否主動採用拆成兩軸，提供同系列的採用案例。 | `/src/content/blog/code-search-adoption.md:48-58`、`:98-110`；`/src/content/blog/measure-revealed-adoption.md:119-129` | `explicit` |
| `agent-tool-reach.md` | 承接前篇，從「願不願意拿」推進到「即使拿了，宣稱能力實際吃得到多少」。 | `/src/content/blog/agent-tool-reach.md:10-12`、`:24-45` | `explicit` |
| `measure-revealed-adoption.md` | 把口頭偏好與 session 行為拆開，並明文把自身、code search 與總綱放在同一系列。 | `/src/content/blog/measure-revealed-adoption.md:8-18`、`:119-129` | `explicit` |
| `steal-determinism-layer.md` | 明文稱自己是採用率篇的自然接續：整套不裝，仍可抽出不靠模型的確定性層。 | `/src/content/blog/steal-determinism-layer.md:18-27`、`:94-108` | `explicit` |
| `token-saving-tools.md` | 五個工具逐案比較宣稱、實測與代價，與總綱共享 Headroom 案例，但正文沒有系列宣告。 | `/src/content/blog/token-saving-tools.md:16-35`、`:48-69`、`:83-99`；`/src/content/blog/check-my-stack.md:60-67` | `strong-inferred` |
| `absorb-awesome-list.md` | 正文明文把單一工具、採用率、抽取碎片與百條清單列成四個尺度。 | `/src/content/blog/absorb-awesome-list.md:83-92` | `explicit` |
| `trial-review-system.md` | 補上方法的出口：前期評估只決定值不值得試，到期回顧才決定 KEEP／KILL／DEFER。 | `/src/content/blog/trial-review-system.md:8-25`、`:42-60` | `strong-inferred` |

### S02 — codebase 搜尋工具的真正門檻，是 agent 會不會走那條路

**最小必要共同概念**：搜尋品質只是前提；還要量 agent 是否主動選用，以及工具能介入實際搜尋路徑的比例。

| 文章 | 加入理由 | 正文證據 | 關係強度 |
|---|---|---|---|
| `code-search-adoption.md` | 七個前作沒有自然採用，第八個靠「工具＋明確指令」才突破。 | `/src/content/blog/code-search-adoption.md:18-44`、`:62-76`、`:126-130` | `explicit` |
| `agent-tool-reach.md` | 開頭直接承接前篇，改量 Grep tool 與 Bash grep 的可介入上限。 | `/src/content/blog/agent-tool-reach.md:10-12`、`:24-51` | `explicit` |
| `measure-revealed-adoption.md` | 提供從 session log 分離自發採用、使用者點名與污染命中的量法，並明文稱 code search 為系列另一篇。 | `/src/content/blog/measure-revealed-adoption.md:38-56`、`:85-115`、`:119-129` | `explicit` |

### S03 — 個人 memory 從向量倉庫，改成能維護的索引與 wiki

**最小必要共同概念**：原始對話大量自動寫入沒有用，整理後的結論、分層索引與持續健康檢查才構成可用 memory。

| 文章 | 加入理由 | 正文證據 | 關係強度 |
|---|---|---|---|
| `retire-vector-memory.md` | 以低搜尋率與六組全敗對照退役向量記憶，改回整理過的 MEMORY.md。 | `/src/content/blog/retire-vector-memory.md:26-39`、`:43-72`、`:76-106` | `explicit` |
| `keep-the-wiki-alive.md` | 直接稱前者為上一篇，接著描述 memory→wiki→CLAUDE.md 的分層與每日健康迴圈。 | `/src/content/blog/keep-the-wiki-alive.md:16-36`、`:63-73`、`:103-113` | `explicit` |
| `memory-cap-reframe.md` | 直接稱 wiki 篇為上一篇，從 25KB 撞牆推導出主索引只留導航、細節下放主題檔。 | `/src/content/blog/memory-cap-reframe.md:8-24`、`:28-50` | `explicit` |

### S04 — 固定 workflow 要先存下來，再處理限流與中斷續跑

**最小必要共同概念**：同一支 deep-research workflow 從「編排可復用」一路遇到 burst 限流與 resume 快取前提，三篇是同一執行鏈的連續工程問題。

| 文章 | 加入理由 | 正文證據 | 關係強度 |
|---|---|---|---|
| `workflow-vs-skill.md` | 說明 workflow 保存的是可重複編排，並把 deep-research-paced 列為固化實例。 | `/src/content/blog/workflow-vs-skill.md:28-42`、`:62-85` | `explicit` |
| `deep-research-rate-limit.md` | 回指前篇的 workflow 功能，記錄 75 個 verify agent 同波撞限與 paced 修法。 | `/src/content/blog/deep-research-rate-limit.md:8-10`、`:24-45`、`:77-104` | `explicit` |
| `unattended-workflow-resume.md` | 明文稱自己是續集；節流後才浮出 5 小時額度與確定性快取問題。 | `/src/content/blog/unattended-workflow-resume.md:8-16`、`:42-67`、`:94-109` | `explicit` |

### S05 — 把其他模型接進 Claude Code，代價、回報與性格都會跟著換

**最小必要共同概念**：模型供應商替換不是只改 endpoint；協議、生態、額度、fallback、規則遵循與 context 行為都要重新驗。

| 文章 | 加入理由 | 正文證據 | 關係強度 |
|---|---|---|---|
| `cc-vendor-swap.md` | 建立協議／功能／生態三層代價，成為後續系列的代價篇。 | `/src/content/blog/cc-vendor-swap.md:8-10`、`:35-47`、`:57-65`；`/src/content/blog/vendor-benefit.md:8-12` | `explicit` |
| `vendor-benefit.md` | 直接承接代價篇，回答換 vendor 得到的有條件韌性與 fallback 風險。 | `/src/content/blog/vendor-benefit.md:8-22`、`:38-57`、`:77-79` | `explicit` |
| `gpt-in-cc.md` | 明文稱自己是系列第三篇，從中國模型跨到 OpenAI 訂閱，檢查生態、設定與 context 三顆雷。 | `/src/content/blog/gpt-in-cc.md:8-16`、`:18-46` | `explicit` |
| `gpt-in-cc-performance.md` | 直接承接接入篇，從能不能接改看第二週的規則遵循、話多與壓縮事故。 | `/src/content/blog/gpt-in-cc-performance.md:8-18`、`:26-56` | `explicit` |

### S06 — GPT 很會深挖，但要替它畫出範圍與停止線

**最小必要共同概念**：同一種服從與深挖能力，在規則清楚時有利；缺少成本、範圍與停止條件時，會把推演風險變成額外需求或程式碼。

| 文章 | 加入理由 | 正文證據 | 關係強度 |
|---|---|---|---|
| `gpt-in-cc-performance.md` | 建立 GPT 對明文規則執行徹底、但對規則外訊號遲鈍的行為基準。 | `/src/content/blog/gpt-in-cc-performance.md:14-30`、`:32-40` | `explicit` |
| `sol-overimplementation.md` | 展開需求層過度設計：提醒工具被推成證明與跨機治理系統。 | `/src/content/blog/sol-overimplementation.md:14-28`、`:30-43`、`:55-71` | `explicit` |
| `gpt-review-tunnel-vision.md` | 明文引用前兩篇，補上 review finding 不斷轉成實作目標的第三種偏移，並提出具名停止理由。 | `/src/content/blog/gpt-review-tunnel-vision.md:14-22`、`:34-61` | `explicit` |

### S07 — AI 說成功或沒出聲，都不能直接當成現實

**最小必要共同概念**：報告層訊號必須回到外部可觀察結果；「成功」可能是假成功，「沒有回報」也可能只是不報。

| 文章 | 加入理由 | 正文證據 | 關係強度 |
|---|---|---|---|
| `exit-0-illusion.md` | 把 exit 0、stdout、排程狀態與 subagent 回報統一成「報告層」，要求對結果層驗證。 | `/src/content/blog/exit-0-illusion.md:22-35`、`:39-65`、`:116-128` | `explicit` |
| `protocol-model-dependency.md` | 正文明說兩篇是同一家族，把另一面定義成「沒回報不等於沒問題」。 | `/src/content/blog/protocol-model-dependency.md:14-32`、`:58-68` | `explicit` |
| `websearch-misses-official-docs.md` | AI 聲稱查過官方文件，獨立瀏覽器路徑卻證明它沒有；核心同樣是回報與現實不一致。 | `/src/content/blog/websearch-misses-official-docs.md:8-27`、`:63-73` | `strong-inferred` |

### S08 — 完成宣告監工：程式先篩，模型只判剩下的語意

**最小必要共同概念**：對「AI 說做完」的治理，先由程式拿結構化證據縮小案件，再讓模型只處理無法用規則判斷的殘餘，最後用真實誤報與命中紀錄決定去留。

| 文章 | 加入理由 | 正文證據 | 關係強度 |
|---|---|---|---|
| `exit-0-illusion.md` | 定義問題：完成宣告不能取代結果層驗證，並預告另篇實作。 | `/src/content/blog/exit-0-illusion.md:102-128` | `weak-inferred` |
| `hook-watchdog.md` | 把完成宣告監工拆成 regex 失敗、零工具閘門成功與剩餘語意案件。 | `/src/content/blog/hook-watchdog.md:20-40`、`:56-86` | `explicit` |
| `local-llm-hook-judge.md` | 明文承接剩餘三分之一，讓本地小模型只判零工具回合是否在喊完成。 | `/src/content/blog/local-llm-hook-judge.md:8-16`、`:44-68` | `explicit` |
| `checker-layoff.md` | 回頭審同一完成宣告判官的生態位，從寬條件收窄到逐張錯誤收據對帳。 | `/src/content/blog/checker-layoff.md:61-81` | `explicit` |

### S09 — 規矩要用多硬，還要放在看得到證據的位置

**最小必要共同概念**：先把可列舉證據交給程式；是否升成 hook、硬攔截或人工放行，取決於復發、誤攔成本與攔截位置，不是焦慮程度。

| 文章 | 加入理由 | 正文證據 | 關係強度 |
|---|---|---|---|
| `steal-determinism-layer.md` | 提出系列共同底層：不靠模型的資料與規則層最容易移植，也最能保證覆蓋與定位。 | `/src/content/blog/steal-determinism-layer.md:18-37`、`:94-106` | `explicit` |
| `hook-watchdog.md` | 明文回指確定性層，並用 regex 失敗與結構化工具證據成功劃出規則邊界。 | `/src/content/blog/hook-watchdog.md:28-52`、`:70-82` | `explicit` |
| `dcg-safety-lock.md` | 把危險 shell 指令升成 PreToolUse hook 與人工放行，並完整揭露繞過面與工具自身失效。 | `/src/content/blog/dcg-safety-lock.md:20-28`、`:40-78`、`:80-96` | `explicit` |
| `checker-layoff.md` | 展示模型檢查員即使夠準，也可能因逐則出勤成本與責任位置不對而被撤出第一線。 | `/src/content/blog/checker-layoff.md:11-39`、`:71-83`；`/src/content/blog/rule-ladder.md:8-18` | `explicit` |
| `test-theater.md` | 溫和提醒 0/5 漏接後，把檢查搬到 push 前硬攔截；共同重點是位置與收據。 | `/src/content/blog/test-theater.md:78-94`；`/src/content/blog/rule-ladder.md:63-69` | `explicit` |
| `prose-exams.md` | 編輯後提醒管不到結案，改在結案時核對改動後的新考卷收據。 | `/src/content/blog/prose-exams.md:53-69`、`:79-93`；`/src/content/blog/rule-ladder.md:63-69` | `explicit` |
| `inline-the-rules.md` | 補上硬攔截前更早的一步：規則躺在檔案裡不等於 agent 收到，必要內容要由 hook 直接送進對話；結尾明文把「是否送達」與 `protocol-model-dependency` 的「送達後是否遵守」拆成前後兩題。 | `/src/content/blog/inline-the-rules.md:14-32`、`:34-46` | `explicit` |
| `protocol-model-dependency.md` | 說明純文字常駐指示會隨模型遵循度失效，有 hook、工具或外部稽核才不依賴自律；`inline-the-rules` 直接把本文列為「送達後，不同模型是否遵守」的對應問題。 | `/src/content/blog/protocol-model-dependency.md:14-26`、`:34-56`；`/src/content/blog/inline-the-rules.md:34-46` | `explicit` |
| `model-routing.md` | 明文回指 `steal-determinism-layer`，把模型路由的結構性參數與 hook 閘門放回「程式保證優於模型自律」的共同原則。 | `/src/content/blog/model-routing.md:75-81` | `explicit` |
| `rule-ladder.md` | 明文綜合前述案例，提出一句話、skill、hook、人工放行四層與換位置的第二維度。 | `/src/content/blog/rule-ladder.md:20-41`、`:51-75`、`:101-110` | `explicit` |

### S10 — review 要靠不同視角找，也要靠證據與影響面驗

**最小必要共同概念**：review 不只要增加視角；還要讓發現接受獨立複查、讓人保留否決權，並在審查前補上 diff 本身看不到的影響面。

| 文章 | 加入理由 | 正文證據 | 關係強度 |
|---|---|---|---|
| `one-model-not-enough.md` | 建立多視角、獨立驗證、程式覆蓋保證與人類拍板的完整 review 架構。 | `/src/content/blog/one-model-not-enough.md:8-22`、`:24-40`、`:66-100` | `explicit` |
| `spec-review-round.md` | 明文承接「多視角找」，把問題推進到 AI 找到問題後是否值得相信與誰拍板。 | `/src/content/blog/spec-review-round.md:8-22`、`:30-48`、`:56-66` | `explicit` |
| `sem-blast-radius.md` | 兩篇共同把 sem 放在 review 前的固定影響面資料層，但沒有文章互引。 | `/src/content/blog/one-model-not-enough.md:34-40`；`/src/content/blog/sem-blast-radius.md:16-43` | `strong-inferred` |
| `model-routing.md` | 明文把手動第二意見的多模型交叉審細節指向 `one-model-not-enough`，補上由誰扣扳機的採用決策。 | `/src/content/blog/model-routing.md:83-91` | `explicit` |

### S11 — review 需要停止線，不能把每條疑慮都做成新需求

**最小必要共同概念**：review finding 與推演風險不是自動的實作需求；原始驗收、最小修正、範圍交還與具名不修理由共同構成停止條件。

| 文章 | 加入理由 | 正文證據 | 關係強度 |
|---|---|---|---|
| `sol-overimplementation.md` | 從規格源頭展示推演風險如何層層變成必做項，並以 YAGNI 審查反轉舉證責任。 | `/src/content/blog/sol-overimplementation.md:30-43`、`:45-65`、`:67-71` | `explicit` |
| `gpt-review-tunnel-vision.md` | 明文引用前篇，將同型偏移放到 review→修正迴圈，提出功能證據、範圍與局部驗證停止線。 | `/src/content/blog/gpt-review-tunnel-vision.md:14-30`、`:34-61` | `explicit` |

### S12 — 真正的 AI 成本，要把固定開機費、快取、配額與單價一起算

**最小必要共同概念**：不能只看總 token 或工具自報省幅；固定啟動成本、prompt cache、proxy 路徑、模型單價與配額權重會改變最後是否划算。

| 文章 | 加入理由 | 正文證據 | 關係強度 |
|---|---|---|---|
| `token-saving-tools.md` | 建立分母紀律：工具縮了多少輸出，不等於帳單省多少；省幅還要對資訊損失與快取風險。 | `/src/content/blog/token-saving-tools.md:16-35`、`:42-46`、`:71-99` | `strong-inferred` |
| `proxy-warmup-cost.md` | 在相同問題上再補一筆 custom-base session 暖機費，重算回本點與可回本 session 比例。 | `/src/content/blog/proxy-warmup-cost.md:8-17`、`:19-36`、`:38-58` | `strong-inferred` |
| `model-routing.md` | 把省成本改成按判斷力分工，並明說帳要用額度而不是 token 算。 | `/src/content/blog/model-routing.md:20-25`、`:51-65`、`:93-103` | `strong-inferred` |
| `subagent-boot-cost.md` | 直接從模型路由後的帳重算 subagent 固定啟動脈絡，將它定義成能力預算。 | `/src/content/blog/subagent-boot-cost.md:8-24`、`:28-38`、`:58-64` | `strong-inferred` |

### S13 — 新工具要有觀察期，到期看真實行為決定留、砍或延後

**最小必要共同概念**：新工具或機制要有觀察窗；到期以真實觸發、命中、誤報、人的介入與故障紀錄，決定保留、移除、收窄或延長。

| 文章 | 加入理由 | 正文證據 | 關係強度 |
|---|---|---|---|
| `trial-review-system.md` | 系統性說明開案、提醒、看行為、裁決、執行與沉澱六步。 | `/src/content/blog/trial-review-system.md:8-25`、`:27-40`、`:74-80` | `strong-inferred` |
| `absorb-awesome-list.md` | 記錄 serena 在安裝當天先訂失敗條件與檢查日期，兩週未達標後完整拆除，並明說這是工具試用制度的一角。 | `/src/content/blog/absorb-awesome-list.md:71-81` | `strong-inferred` |
| `bumblebee-still-on-disk.md` | 從接入每日分析、三次掃描到 GlassWorm 真命中與回顧日 KEEP，是一個正向試用案例。 | `/src/content/blog/bumblebee-still-on-disk.md:46-58`、`:60-72` | `strong-inferred` |
| `dcg-safety-lock.md` | 四週帳本不只數誤攔，改看人的介入、安全退化與任務失敗。 | `/src/content/blog/dcg-safety-lock.md:52-64`、`:90-96` | `strong-inferred` |
| `local-llm-hook-judge.md` | 到期日以同一把尺比較兩名判官，砍掉沒有判別力的模型層、收窄能留下的職位。 | `/src/content/blog/local-llm-hook-judge.md:44-60`、`:62-84` | `strong-inferred` |
| `checker-layoff.md` | 三名同期檢查員到期，依精確率、出勤成本與責任位置作兩退一留。 | `/src/content/blog/checker-layoff.md:11-25`、`:29-39`、`:61-83` | `strong-inferred` |
| `sem-blast-radius.md` | 兩個月試用後分別判讀 PR 接點與計畫接點，保留有實際用途的一支。 | `/src/content/blog/sem-blast-radius.md:45-59`、`:71-77` | `strong-inferred` |
| `prose-exams.md` | 一週多觀察五次真實攔截、零誤擋，同時保留考卷覆蓋與豁免盲點。 | `/src/content/blog/prose-exams.md:71-87` | `strong-inferred` |

## 合理孤島與系列種子

### `ai-report-two-lies.md` — 合理孤島，也是「AI 業務分析可信度」的系列種子

目前不要求連線。它的最小問題不是一般的「AI 要附證據」，而是查詢結構定義、執行期資料列登錄、`sourceId`／`rowIndex`／`field` 到儲存格的可追溯鏈；這是具體資料產品架構（`/src/content/blog/ai-report-two-lies.md:14-20`；`/src/content/blog/ai-report-two-lies.md:46-60`）。在現有 40 篇中，沒有另一篇處理同一資料管線，也沒有正文互引；硬接到完成宣告或 code review，只會因「都談證據」而製造過寬關係。

反證條件：未來若有文章直接承接這套查詢登錄、事實目錄或敘事數字 gate，這篇應從 `intentional-island` 升成系列核心。

### `matt-philosophy.md` — 合理孤島，也是「外部作者方法論對照」的系列種子

目前不要求連線。它不是單一 skill 教學，而是重建 Matt Pocock 的公開立場，再拿作者自己的九軸防污染取樣比較，且主動揭露其中一軸不是獨立收斂（`/src/content/blog/matt-philosophy.md:18-18`；`/src/content/blog/matt-philosophy.md:86-102`）。雖然文章也談 trigger、context、驗證與人類拍板，但這些重疊不足以把它併入 hook 或 review 系列；其最小共同案例是「對某位外部作者做立場重建與自身對照」，目前只有一篇。

反證條件：若後續以相同九軸方法對照另一位作者或另一套公開方法論，應形成新的對照系列。

### `bumblebee-still-on-disk.md` — 已連到試用制度，但供應鏈安全主題仍只是種子

本文可透過「試用→回顧→KEEP」加入 S13，但目前不另建供應鏈安全系列。它的安全核心是 marketplace 下架、本機孤兒版本、catalog 收錄時差與磁碟實際狀態的四段鏈（`/src/content/blog/bumblebee-still-on-disk.md:24-44`；`/src/content/blog/bumblebee-still-on-disk.md:54-64`）；現有其他文章沒有處理同一威脅模型。若只因 `dcg-safety-lock` 也談安全就連線，最小共同概念只剩「安全」，太寬。

反證條件：若後續文章再處理本機套件／extension 殘留、威脅情報 catalog 或 supply-chain 磁碟盤點，才建立安全系列。

### 尚未落到現有文章的三個延伸意圖

- `agent-tool-reach.md` 明說「真正的繞法走另一條路，下篇再說」，但未具名；現有文章也沒有明文自稱兌現這個接續（`/src/content/blog/agent-tool-reach.md:91-99`）。先保留未完成的連線，不把時間上較晚的文章硬指定成下篇。
- `local-llm-hook-judge.md` 把「本地 27–35B 模型當日常主力」明文留作之後的獨立文章，現有 40 篇沒有具名承接（`/src/content/blog/local-llm-hook-judge.md:18-24`）。這是本地模型主力化的系列種子，不併入目前的 hook 判官系列。
- `local-llm-hook-judge.md` 另說「怎麼持續發現下一個需要監工的卡點」是另一篇案子，但現有文章沒有具名承接（`/src/content/blog/local-llm-hook-judge.md:86-100`）。它是未完成系列種子，不影響本文已與 `hook-watchdog`、`checker-layoff` 成線。

## uncertain 清單

主要狀態為 `uncertain` 的文章：**0 篇**。

需要作者判斷的關係共有三條，但都不足以改變文章的主要狀態：

- `agent-tool-reach.md` 的「下篇」究竟指現有哪一篇，或只是尚未發表的題目（`/src/content/blog/agent-tool-reach.md:91-99`）。
- `local-llm-hook-judge.md` 的「另一篇」究竟指現有哪一篇，或只是尚未發表的監工發現機制（`/src/content/blog/local-llm-hook-judge.md:86-100`）。
- `vendor-benefit.md` 把 GLM 套 voice profile 與 Claude 對打的前案連到 `steal-determinism-layer`，但目標文章正文只談從工具抽取確定性層，沒有記錄該場模型對打；作者需要確認原本想指哪篇，或連結與回憶是否寫錯（`/src/content/blog/vendor-benefit.md:59-65`；`/src/content/blog/steal-determinism-layer.md:8-108`）。

## 保留的反證與刻意不連線

| 容易誤連的文章 | 不硬連的理由 | 正文證據 |
|---|---|---|
| `code-search-adoption.md` ↔ `sem-blast-radius.md` | 都碰 codebase 工具，但前者研究 agent 是否主動選工具；後者明文否決讓 agent 自己查，改由固定腳本在 review 前注入。兩者是相鄰問題，不是同一系列。 | `/src/content/blog/code-search-adoption.md:98-108`；`/src/content/blog/sem-blast-radius.md:30-43` |
| `agent-tool-reach.md` ↔ 前篇實測 | 本篇自己說是紙上結構推論，前篇才是實機裸測；因此不能把兩篇數字合併成同一試用成績。 | `/src/content/blog/agent-tool-reach.md:77-89` |
| `token-saving-tools.md` ↔ `proxy-warmup-cost.md` | 兩篇可在成本方法上成線，但不能當同一產品 A/B：暖機篇明說 Headroom 沒量同 session 三回合，pxpipe 也沒 live 測。 | `/src/content/blog/proxy-warmup-cost.md:19-26`、`:44-50` |
| `test-theater.md` ↔ `prose-exams.md` | `rule-ladder` 把兩者並列，是因為 gate 搬位置的形狀相同；前者測產品測試能否抓壞程式，後者測 skill 行為是否退化，不能併成同一種測試。 | `/src/content/blog/rule-ladder.md:63-69`；`/src/content/blog/test-theater.md:49-62`；`/src/content/blog/prose-exams.md:15-35` |
| `gpt-in-cc-performance.md` ↔ 一般模型排名 | 本文明說六場 GPT、兩場 Fable 的任務型態沒有完全對齊，結論不能外推成全面模型排名。 | `/src/content/blog/gpt-in-cc-performance.md:10-12`、`:52-56` |
| `trial-review-system.md` 裡所有零戰功案例 | 同樣零成效可因「全數失敗／需求消失／事件未發生／正常執行但沒真問題／實驗設計有瑕疵」分成 KILL、KEEP、DEFER；不能把系列關係誤讀成相同 verdict。 | `/src/content/blog/trial-review-system.md:27-40` |
| `ai-report-two-lies.md` ↔ S07／S08 | 題目都碰可信度，但本文的負責單位是查詢、資料列、儲存格與敘事數字，不是 session 回報或完成宣告；目前保留孤島。 | `/src/content/blog/ai-report-two-lies.md:14-20`、`:46-64` |
| `matt-philosophy.md` ↔ S09 | 本文的主體是外部作者立場重建與九軸對照，不是某支 hook／gate 的設計或成績單；主題重疊不足以成線。 | `/src/content/blog/matt-philosophy.md:18-18`、`:86-118` |
| `bumblebee-still-on-disk.md` ↔ `dcg-safety-lock.md` | 兩篇都談安全，但一篇是惡意 extension 留在磁碟與威脅情報時差，另一篇是 shell 指令執行前攔截；只共享「安全」不足以成系列。 | `/src/content/blog/bumblebee-still-on-disk.md:24-44`；`/src/content/blog/dcg-safety-lock.md:20-28`、`:66-78` |

## Coverage receipt

分母由 `/src/content/blog/*.md` 的來源 glob 獨立取得，不從 roster 反推。roster 以 basename 為鍵；驗算比較來源 basename 與 roster basename 的雙向差集，再數主要狀態重複與系列標題。

- 來源 glob：**40 篇**
- 實際完整讀取：**40 篇**
- roster：**40 列**
- 來源有、roster 無：**0**
- roster 有、來源無：**0**
- 重複主要狀態：**0**
- 主要狀態總數：`explicit-series` **31**、`inferred-series` **7**、`intentional-island` **2**、`uncertain` **0**；合計 **40**
- 預期系列數：**13**
- frontmatter tag 作為關係證據：**0 次**

驗算口徑：從 glob 取得 `source = {p.name}`；從 `<!-- roster:start -->` 與 `<!-- roster:end -->` 間的表格抽出 `(basename, status)`；計算 `source - roster`、`roster - source`、`Counter(basename)` 中大於 1 的項目、`Counter(status)`，並以 `^### S\d{2} —` 計數系列。
