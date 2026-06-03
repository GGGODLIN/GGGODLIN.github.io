---
title: "Claude Code 動態工作流（dynamic workflows / ultracode）生產復盤"
description: "6 天、122 次編排、9 個 scope 的第一手使用數據：腳本確定性解決不了 server-side burst 限流，以及作者如何 fork 出一支批次節流版才跑完整。"
voice: pure-ai-baseline
status: "純 AI 校稿版（Phase 1.5，從 MATERIAL 寫，無 voice）"
source: "posts/dynamic-workflow-MATERIAL.md"
---

# Claude Code 動態工作流（dynamic workflows / ultracode）生產復盤

## 功能是什麼

Claude Code 在 2026-05-28 隨 Opus 4.8 正式 GA（research preview 階段）推出了「動態工作流」（dynamic workflows）功能。這個功能讓使用者可以用一個明確的腳本描述整個多 agent 編排流程——哪些 agent、什麼順序、如何彙整——而不是每次讓模型臨場決定。

有三種方式觸發動態工作流：

1. **prompt 含觸發關鍵字**：截至 2026-06-02 的 v2.1.160 版，關鍵字已從原本的 `workflow` 改名為 `ultracode`（官方文件頁當時仍寫舊關鍵字，文件落後於 CHANGELOG，建議以自己的 CC 版本驗證）。輸入 `ultracode` 會讓 CC 現場撰寫一支單次腳本，但不改動 effort 層級。
2. **`/effort ultracode` 檔位**：這是一個 session-only 的設定，啟用後每個實質任務都會自動進行 agent 編排，屬於 xhigh effort 加上自動編排的組合。
3. **點名已存在的 named workflow**：直接叫用 CC binary 內建的或使用者自訂的腳本。

注意「ultracode」一字有兩種意義：當它作為 prompt 關鍵字時，效果是現場生成單一腳本、不改 effort；當它作為 `/effort` 檔位時，效果是每個任務自動編排。兩者同名但行為不同，需要區分。

使用此功能需要 Claude Code v2.1.154 以上，全付費方案可用。官方聲稱可橫跨 10 到 100 個以上的並行 subagent；總 agent 上限 1000；引擎並發上限公式為 `min(16, 核心數-2)`。

和過去讓模型臨場派 agent 相比，動態工作流的關鍵差異在於：決策點從「模型臨場決定」移到「腳本寫死」，帶來可重現性——每次執行的流程結構相同。

## 第一手使用規模

以下數據截止 2026-06-02，來自本機 jsonl 統計的 filesystem ground truth。

最近 6 天共執行了 122 次動態工作流編排，跨越 9 個獨立 scope：根目錄（9 次）、社群資訊兩條路徑（8 次 + 6 次）、記憶待辦研究（8 次）、工作電商專案（3 次）、部落格（3 次），以及其他三個 scope 各 1 次。其中大量集中在記憶研究類的 deep-research 編排；其餘 119 次分佈在日常自動化、工作 repo 等各類任務，成效素材較薄，此處以規模帶過，不個別展開。

## 踩坑一：只說「workflow + 題目」的觸發落差

在實測中，輸入「workflow 深度研究 opus4.8」這類自然語句，CC 並不會去呼叫官方內建的 `deep-research` named workflow，而是現場自行撰寫一支客製腳本——從 tool input 可以看到，呼叫的是 `script=` 而非 `name=`，全程未觸及任何官方腳本。

這是觸發行為的落差：不明確點名 named workflow，CC 會把題目理解為「現場寫一支腳本解決它」，而不是「去找有沒有現成腳本」。

這個觀察來自單一 session（session `2d626635`）實測，有 tool input 直接佐證，但屬於單一來源，宜理解為實測觀察而非通案結論。

## 踩坑二：自寫 skill 和官方 named workflow 撞名不互蓋

作者的 `~/.claude/skills/` 目錄下有自己寫的 `deep-research` skill，和官方內建的 `deep-research` named workflow 同名。

兩者走的是獨立通道，互不感知：

- 官方 named workflow 存在 CC binary 內，透過 `Workflow({name: "deep-research"})` 呼叫，走 Workflow tool 路徑。
- 使用者自寫的 skill 在 `~/.claude/skills/` 下，透過 Skill tool 路徑呼叫。

兩條路徑不會互相覆蓋，也不會有任何衝突提示，就這樣安靜地各自存在。

## 核心代價：官方 deep-research 在 Opus 4.8 端點撞限

以下所有撞限數字，均限定在「官方 `deep-research` workflow + Opus 4.8 端點」這個組合下，並非作者自寫腳本的行為，也不是泛用動態工作流的行為。

### 官方腳本的架構

官方 `deep-research` built-in workflow 的架構大致如下：

- Scope（1 個 agent）：確認研究範圍
- Search（5 個 agent）：搜尋
- Fetch（15 個 agent）：抓取內容
- Verify（25 個 claim × 3 票 = 75 個 agent）：逐一驗證每個主張
- Synthesize（1 個 agent）：彙整

單次執行約 97 到 105 個 agent。其中 Verify 階段是一次性湧入 75 個 agent。

### 首次發現的撞限數字（2026-06-02，session ae6ffbbc）

在跑 LLM 評估框架題的研究時，首次觀察到撞限。以下為逐 agent 核實的數字：

- 單題 agent 總數：101 個
- 撞 429 的 agent 數：**64 / 101**
- 撞限發生視窗：約 13 秒內爆發
- Opus session 執行時間：約 7 分鐘後 fail
- Token 消耗：約 2.09M
- **結果：整支 workflow 直接失敗**

在 15 核機器上，引擎並發上限 = min(16, 15-2) = 13。Verify 階段的 75 個 agent 一次湧入，在 Opus 4.8 端點頂破了 Anthropic 的 server-side acceleration limit（server-side burst 限流），觸發 429 回應。

限流訊息明文為「temporarily limiting requests, not your usage limit」——這是伺服器端的 burst 限流，並非帳號額度耗盡。Anthropic 對組織用量陡增有一個獨立的 acceleration limit 類別，不同於一般的 RPM/ITPM/OTPM rate limit。

### 撞限機制的反直覺本質：端點決定撞不撞

官方腳本沒有任何 model override，所有 agent 都繼承 session 的主模型。這意味著在 Opus session 下跑，全部 101 個 agent 都跑 Opus，burst 密度直接頂到限流線；同一支腳本在其他端點跑，情況完全不同。

對比實驗：同題同腳本在 mimo 端點跑，約 66 分鐘、0 撞限。

「端點決定撞不撞，不是腳本決定撞不撞」——這是這個功能在生產使用上最反直覺的地方。

### 影響性質：正確性無損，完整性重創

撞限的損害不是結果出錯，而是 verify 失敗的 claim 全部被歸為「已反駁」，得票 0-0，假死而非真正被駁回。

具體案例：在 LLM 評估框架 7 方對比的研究中，Phoenix v16.3.0 的功能、Braintrust Pro $249 的定價、Ragas v0.4.3 的指標，這些在 verify 階段因撞限而失敗的 claim，全部被歸進「已反駁」清單——但這些數字是正確的。後來用 paced 版重跑，全部核實為真。

### 撞限是結構性非偶發

同題前後跑了兩次原版 workflow：

- **首次**（session `ae6ffbbc`）：101 agent、**64 個撞 429**
- **第二次**（fork paced 後的原版對照，session `2d626635`）：107 agent、**約 50 個撞 429**，46 個 verify subagent 全滅，只完成 2/6 研究對象

兩次同題都撞、撞限數隨 burst timing 在 50 到 64 間浮動，可判定為結構性問題，並非偶發。

## 解法：fork 一支批次節流版（deep-research-paced）

作者 fork 了官方 `deep-research` workflow，唯一的改動是：verify 階段從一次 parallel(75) 改為每批 2 個 claim 序列跑。

這個改動把 peak 並發從 13 降到 6（2 個 claim × 3 票）。其餘完全保留官方品質：3 票、25 個 claim、不換模型、所有 prompt 和 schema 逐字一致。

實測結果：

- 撞限次數：0
- claim 完成率：25/25 全部足票
- findings 數量：11（原版撞限版只有 8）
- 研究對象完成率：7/7（原版撞限版只完成 2/6）
- 時間代價：約 2.5 倍（20 分鐘 vs 8 分鐘）
- Token 代價：在這個 session 裡實測觀察到約 1.85 倍

`deep-research-paced` 已固化為作者的 global named workflow（`~/.claude/workflows/deep-research-paced.js`）。

關於並發數的設定：此處選 2 是針對 Opus 端點的調整，其他端點的適合值需要視端點特性調整 `VERIFY_CLAIM_CONCURRENCY`，沒有放之四海皆準的最佳解。

## 給想自己寫腳本的讀者：四個實戰踩坑

如果想自己撰寫動態工作流腳本，以下是從實測記錄整理出的四個具體坑：

**1. parallel/pipeline 結果要先篩除 null**
parallel 或 pipeline 執行的結果中可能含有 null，直接使用前要過濾。

**2. budget 迴圈漏寫 guard 會跑到 1000 agent 上限**
budget 迴圈中若漏寫 `budget.total &&` 的 guard，在沒有目標時 `remaining()` 會回傳 Infinity，腳本會持續跑到達 1000 agent 的總上限才停止。

**3. determinism 是字串級靜態檢查**
腳本中只要 prompt 字串字面上含有 `Date.now` 或 `Math.random`，就會被攔下。這是親測觀察到的行為——系統不是在真正執行時才攔截，而是靜態掃描字串就攔。

**4. `meta` 必須是純文字常量**
workflow 的 `meta` 欄位不接受動態值，必須是純文字常量。

## 收尾

動態工作流把「哪些 agent、什麼順序、怎麼彙整」的決策從模型臨場判斷移到腳本層，帶來可重現性。這是這個功能的核心價值。

但腳本確定性解決不了 fan-out 帶來的新問題：burst 密度由腳本決定後，峰值並發的問題也一併被腳本繼承。官方設計的 75 個 agent 一次湧入，在 Opus 4.8 端點直接頂破 server-side burst 限流。

解法的方向不是降低品質（砍驗證票數或砍 claim 數量），而是把峰值並發壓在限流線以下；品質一票不少，只是時間變長。

功能目前處於 research preview 階段（截至本文的時間點：功能 GA 於 2026-05-28，本文撞限實測於 2026-06-02），生產可用，但需要自備限流處理，不能假設官方腳本在任何端點下都能跑完整。
