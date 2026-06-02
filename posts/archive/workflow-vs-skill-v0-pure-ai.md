---
title: "workflow vs skill：從 skill / 零散排程遷移到 dynamic workflow 的固化復用心得"
description: "dynamic workflow 是繼 skill / command 之後第三種「把成功流程固化成可復用資產」的載體。本文從三個實際遷移案例，說明固化判準與操作細節。"
voice: pure-ai-baseline
status: 純 AI 校稿版（Phase 1.5，從 MATERIAL 寫，無 voice）
source: posts/workflow-vs-skill-MATERIAL.md
---

# workflow vs skill：從 skill / 零散排程遷移到 dynamic workflow 的固化復用心得

## Beat 1：今天發生了什麼

2026-06-02，CC v2.1.160（UTC 02:10:25 釋出）把 dynamic workflow 的 prompt 觸發關鍵字從 `workflow` 改名成 `ultracode`。打 `workflow` 不再觸發；用自然語句描述仍可；輸入框出現紫色 highlight 提示。

但改名只是表象。更值得討論的是一個結構性問題：從機制推論與社群觀察來看，多數使用者的使用模式停在「輸入關鍵字讓 CC 現場生一支 workflow 腳本、跑完結束」，沒有走到「把這支腳本存下來、之後用名稱呼叫」的留存復用。而留存復用，才是 workflow 改變工作流的核心價值所在。

---

## Beat 2：dynamic workflow 是什麼——功能交代

### 基本概念

Dynamic workflow 讓你用 JavaScript 腳本編排大量 subagent，在背景隔離環境中執行，最終只回傳結果，而不是把中間過程塞進 context window。官方公告於 2026-05-28 隨 Opus 4.8 正式發布（research preview），需要 CC v2.1.154 以上，全付費方案可用。

官方文件：
- 公告：[https://claude.com/blog/introducing-dynamic-workflows-in-claude-code](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code)
- 技術文件：[https://code.claude.com/docs/en/workflows](https://code.claude.com/docs/en/workflows)（URL 必須含 `/en/`，不含 `/en/` 回傳 HTTP 404）

### 三種觸發方式

1. **Prompt 關鍵字**（今日 v2.1.160 把關鍵字從 `workflow` 改名成 `ultracode`）：在對話中打 `ultracode`，CC 會現場生成一支客製腳本來處理任務。
2. **自然語言描述**：不打關鍵字，直接描述需要多 agent 並行或多階段的任務，CC 判斷是否用 workflow 處理。
3. **點名呼叫已存 named workflow**：輸入 `/<name>` 直接呼叫已存好的 workflow。

**注意：三種觸發機制今日 v2.1.160 都還在，只有第①種的關鍵字發生改名。**

### 「ultracode」一字兩義——必須分清楚

這個字在 CC 裡有兩個截然不同的意思：

- **(A) prompt 關鍵字 `ultracode`**：今日接手 workflow 觸發角色的那個字。在對話中打它，CC 會現場生成一支客製腳本執行任務，**不改變 session 的 effort 設定**。
- **(B) `/effort ultracode` 模式**：effect 檔位，啟用後每個實質任務都會自動編排，session-only（結束後重置，無法透過 `effortLevel` 或 `--effort` 持久化）。

同名，但行為截然不同。

### 留存機制：從現場生成到 named workflow

現場生成的 workflow 只活在當前 session。要留存復用，需要刻意操作：

1. 跑完後在 `/workflows` 視圖按 `s`
2. Tab 鍵選擇存到 `.claude/workflows/`（專案共用）或 `~/.claude/workflows/`（個人全域）
3. 之後用 `/<name>` 點名呼叫
4. Named workflow 可透過全域變數 `args` 接收參數，實現動態復用

**官方文件落後說明**：查證當下（2026-06-02），官方文件頁 [code.claude.com/docs/en/workflows](https://code.claude.com/docs/en/workflows) 的觸發關鍵字仍寫 `workflow`（舊名），改名細節目前只在 CHANGELOG（[github.com/anthropics/claude-code/blob/main/CHANGELOG.md](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)）。以 CHANGELOG 為準。

### 技術限制（官方 tool schema 確認）

- 腳本大小上限：≤ 512KB（schema maxLength = 524288）
- agent 總上限：1000
- 並行上限：min(16, 核心 - 2)
- 禁用 `Date.now()` / `Math.random()`（會破壞 resume cache key）
- Session 邊界：離開 CC 後下個 session 從頭重跑；resume 只在同 session 內有效

---

## Beat 3：第三種固化載體

Skill、command、workflow——這是 CC 裡把成功流程固化成可復用資產的三條路徑。Workflow 是其中第三種，直接和 skill 競爭，但定位不同。

官方文件給了一個明確判準，原文如下：

> "Use skills when the know-how should be reusable. Use workflows when the orchestration itself should be repeatable."

展開來說：

| 面向 | Skill | Workflow |
|---|---|---|
| 固化對象 | 做法 / know-how（Claude 遵循的指令）| 編排本身（多 agent 並行或多階段腳本）|
| 執行方式 | Claude 讀取後遵循，結果進 context window | Runtime 執行 JS 腳本，只回最終結果 |
| 適合場景 | 單線流程、需要 Claude 判斷與彈性的任務 | 確定性多階段、多 agent 並行、不需 Claude 即時判斷 |

兩者是互補關係，不是取代關係。Skill 無法表達「多 agent 並行流程」，這類任務才交給 workflow。

---

## Beat 4：三個固化實踐案例

以下三個案例，每個都有「問題 → 固化動作 → 結果」的結構，展示「留存復用」具體是怎麼回事。

### 案例 A：local-analysis.js — 7 個 launchd 排程整併為單一 on-demand workflow

**問題**：日常本機分析原本由 7 個獨立 launchd plist 各自排程執行（memory / wiki / codemap / recap / probes / bumblebee / skill-upstream 七個 channel）。各自分散，維護困難，且排程推送的時間不一定是真正需要的時間。

**固化動作**：把 7 個 channel 整合進單一 named workflow `~/.claude/workflows/local-analysis.js`，以 `args` 傳入日期和星期幾，workflow 內部按頻率判斷哪些 channel 該跑。原 7 個 launchd plist 於 2026-05-26 備份停用，移至 `~/Library/LaunchAgents/disabled-local-analysis-2026-05-26/`。其中 probes channel 拆出，移交給 daily-topic-analysis 的 pre-flight 階段。

**結果**：完成了遷移動作，停用了原 7 個 plist。按需呼叫取代定時推送。

**保守說明**：此遷移尚有未端到端驗證點（v3 agent 讀 wrapper 提 prompt 執行流程），不宣稱穩定運作已久。

### 案例 B：daily-topic-analysis.js — 手動流程固化為 3-phase pipeline

**問題**：社群話題分析原本是手動加 prompt-driven 的零散流程，每次跑都要手動組合步驟。

**固化動作**：把整個流程編排為 named workflow `~/.claude/workflows/daily-topic-analysis.js`，固化成 3-phase pipeline。2026-05-26 上線，首份 digest（33KB HTML）走完整 pipeline 產出。

**實際跑的性能數字**（兩次對照）：
- 第 1 次：5.5 分鐘 / 1.10M token / 27 agents / 105 tool calls
- 第 2 次：6.3 分鐘 / 1.93M token / 48 agents / 208 tool calls

兩次皆走 Claude Code 互動訂閱，不抽 automation credit。

**結果**：固化後可按需呼叫，不需每次重組流程。

### 案例 C：deep-research-paced.js — 官方 workflow fork 成限流版，綁回 skill routing

**問題**：官方 deep-research workflow 在執行時會觸及伺服器端的 burst 限流機制。

**固化動作**：把官方 deep-research workflow fork 成限流版，調整並行驗證步驟（verify 從一次全部平行改成每批 2 個 claim，peak 並行 = 2×3 = 6），同時保留原有的品質機制（3-vote / 25 claims）。固化後綁回 deep-research skill routing 當預設路徑，存為 `~/.claude/workflows/deep-research-paced.js`。

**結果**：固化後可按需呼叫。撞限的完整故事（首次發現的 session 編號、agent 數、失敗次數等數字）留給姊妹篇 #61 細談。

---

## Beat 5：遷移政策動機——為什麼現在要考慮從 launchd 遷走

除了使用上的主動需求，還有一個外部政策因素：

**2026-06-15 起**，`claude -p` / `--print` headless 模式以及 Agent SDK，在訂閱方案下改為抽獨立月額度「automation credit」，脫離原本的互動訂閱用量。互動 TUI（包含 workflow）仍吃訂閱，不受影響。

對於有 launchd / cron 跑 `claude -p` 的使用者，這個政策變動讓遷移有了具體的成本動機：繼續用 headless 模式會消耗獨立額度，改用 named workflow（在互動 TUI 下呼叫）則走訂閱不另計。

local-analysis 的遷移同時有兩個動機：(1) 使用者每天主動要求分析，launchd 定時推送是冗餘的；(2) 政策面的 6/15 截點。

---

## Beat 6：為什麼多數人停在「現場生跑一次」——機制拆解

**以下是從機制推論與社群觀察得出的分析，非實測統計比例。**

從設計機制角度分析，有四個結構性原因讓使用者停在現場生成而沒走到留存復用：

**① prompt 關鍵字預設行為是「現場 author 一支腳本」**

使用者輸入 `ultracode`（或過去的 `workflow`）加上任務描述，CC 現場生成一支客製腳本。工具呼叫的 input 是 `script=`（腳本內容本身），不是 `name=`（已存 workflow 的名稱）。換句話說，就算已經存了一個處理相同任務的 named workflow，只說 `ultracode + 描述` 也不會自動呼叫它——必須明確用 `/<name>` 點名。

**② 復用固化版需要明確點名**

要呼叫已存的 named workflow，需要知道它叫什麼名字，並且明確輸入 `/<name>`。這個額外的意識成本讓「直接打 ultracode 現場生」比「點名已存版本」阻力更小。

**③ 存檔是額外的刻意動作，預設不存**

現場生成的 workflow 執行完就結束，不會自動留存。要存下來，需要在 `/workflows` 視圖按 `s`，再選擇存放位置。社群觀察指出這個步驟因為需要「刻意」而使用率偏低：「unless you take a deliberate step to save it, the script Claude generates is essentially thrown away after the session.」

**④ `/effort ultracode` 模式 session-only，結束就重置**

若是用 `/effort ultracode` 啟用常駐模式，這個設定是 session-only——關閉 CC 後就重置。無法透過 `effortLevel` 設定或 `--effort` 旗標持久化。官方文件原文：「lasts for the current session and resets when you start a new one.」

這四點是結構性機制，不是使用者習慣問題。它們共同解釋了為何「留存復用」需要刻意操作，而刻意操作的門檻讓多數使用者停在「跑一次就算了」的模式。

---

## Beat 7：固化判準與收尾

### 判準——skill 還是 workflow？

用一個問題判斷：**你想固化的是「做法 / know-how」，還是「編排本身」？**

- **單線 know-how，需要 Claude 判斷與彈性** → skill / command
- **多 agent 並行，或多階段確定性編排** → workflow

兩者互補。Skill 表達不了「讓 48 個 agent 並行跑，最後收斂結果」這種結構，這類任務才是 workflow 的場域。

### 核心認知

Ultracode / dynamic workflow 的真正價值不在「現場生跑一次」，而在「把編排本身存成可復用資產」。這個步驟需要刻意為之：
1. 跑完後按 `s` 存檔
2. 之後用 `/<name>` 點名呼叫，而不是每次重新 author

### 接點說明

Deep-research-paced 是本篇連接姊妹篇的接點。本篇只交代固化動作（fork 官方 workflow、調整並行設定、綁回 skill routing）；撞限的完整故事——首次發現的 session 紀錄、agent 數量、實際撞限次數及背後機制——另篇細談。
