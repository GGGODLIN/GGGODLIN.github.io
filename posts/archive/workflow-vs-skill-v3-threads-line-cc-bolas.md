---
title: ultracode workflow，別跑完就丟
description: dynamic workflow 是繼 skill 之後第三種固化載體，但 ultracode 的真正價值不在現場生一支腳本跑完、而在把編排本身存成可復用資產。三個實際遷移案例說明判準。
voice: v3-threads-line-cc-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: posts/workflow-vs-skill-MATERIAL.md
---

多數人用 ultracode 現場生一支腳本、跑完就關掉了。沒人按 `s` 存。這是從 session-only 設計機制和社群觀察推導出的判斷，不是有統計數字支撐的宣稱。但機制如此，不存就等於從來沒固化過。

---

## ultracode 一字兩義，要先搞清楚

`ultracode` 這個詞現在同時指兩件不同的事：

(A) **prompt 關鍵字**：在輸入框打 `ultracode`，CC 現場生一支 JavaScript 腳本，呼叫 subagent 在背景隔離環境執行，你只收最終結果。這就是接手 `workflow` 觸發角色的那個。觸發後不改 session 的 effort 設定。

(B) **`/effort ultracode` 檔位**：相當於 xhigh + 每個實質任務都自動編排成 workflow。只存在當下 session，結束就重置，無法透過設定檔持久化。

同名，但不是同一個東西。

觸發機制有三種都還在，2026-06-02 的 v2.1.160 只把第①種的 prompt 關鍵字從 `workflow` 改名成 `ultracode`，舊打法打 `workflow` 不再觸發：① prompt 關鍵字（現在叫 `ultracode`）、② 自然語句描述（還是可以）、③ `/<name>` 直接點名已固化的 named workflow。這個改名目前只記在 [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)，[官方文件](https://code.claude.com/docs/en/workflows)截至 2026-06-02 查證仍寫舊關鍵字 `workflow`，以 CHANGELOG 為準。

---

## 第三種固化載體

我原本以為 dynamic workflow 只是「ultracode 的底層實現」，後來才發現它其實跟 skill 是平行的東西，各自解決不同問題。

官方對 skill 和 workflow 的分工講得很清楚：

> Use skills when the know-how should be reusable. Use workflows when the orchestration itself should be repeatable.

[Skill](https://code.claude.com/docs/en/skills) 存的是「指令」，Claude 遵循後結果進 context window。Workflow 存的是「編排本身」，runtime 執行 JS 腳本、只回最終答案。兩者留存路徑不同，不是誰取代誰。

這樣算起來固化載體有三種：slash command / skill / workflow，分別對應不同的需求。單線做法或知識 → skill；多 agent 並行或多階段確定性編排 → workflow。

存成 named workflow 的方法：`/workflows` 視圖按 `s`，Tab 選存入 `.claude/workflows/`（專案共用）或 `~/.claude/workflows/`（個人全域）。之後 `/<name>` 呼叫，可以透過全域變數 `args` 接收參數復用。

存法簡單，限制倒是很硬：script ≤ 512KB、agent 總上限 1000、並行 min(16, 核心-2)、禁 `Date.now()` / `Math.random()`（破壞 resume cache key）。

---

## 三個固化實例

### local-analysis.js：7 支 launchd 整合成 1 支

我之前在 launchd 掛了 7 個排程，各自負責不同分析 channel（memory / wiki / codemap / recap 等）。每個 plist 獨立跑、維護散漫，且每天定時推送但我不一定看。

2026-05-26 完成遷移動作：7 個 plist 備份停用到 `~/Library/LaunchAgents/disabled-local-analysis-2026-05-26/`，整合成單一 `~/.claude/workflows/local-analysis.js`，改成按需呼叫。`args` 接 date / weekday，依頻率判斷哪些 channel 當天要跑。

動機有兩層，使用者主動意願（主動要求才跑、push 模式本就冗餘）加上政策面（2026-06-15 起 `claude -p` headless 方式改抽獨立 automation credit，脫離訂閱；互動 TUI 走訂閱不抽）。

保守說明：遷移動作確認完成，但 v3 agent 透過 wrapper 讀 prompt 再執行這段，尚未端到端完整實跑過，首次跑需留意品質。

### daily-topic-analysis.js：手動流程固化成 3 階段 pipeline

社群話題分析原本是手動加 prompt 驅動，每次跑靠記憶組裝步驟。2026-05-26 固化成 `~/.claude/workflows/daily-topic-analysis.js`，3 階段 pipeline：pre-flight 確認資料源 → 主軸分析 → URL 事實查核。

兩次實跑對照：第 1 次 5.5 分鐘 / 1.10M token / 27 agent / 105 tool call；第 2 次 6.3 分鐘 / 1.93M token / 48 agent / 208 tool call。都走 Claude Code 互動訂閱，不抽 automation credit。首份完整輸出 digest-2026-05-26.html 33KB。

### deep-research-paced.js：官方版 fork 成限流版

官方 [dynamic workflow 公告](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code)附帶的 deep-research workflow 一次並行開太多、會撞 API 限流。我 fork 出 `~/.claude/workflows/deep-research-paced.js`，把 verify 階段從一次 parallel 改成每批 2 個 claim（峰值並行 = 2×3 = 6），保留 3-vote / 25 claims 的完整品質機制。已綁回 deep-research skill 的 engine routing，預設路徑改走 paced 版。

撞限的完整故事（首次發現的 session / agent 數字等）留給姊妹篇 #61，本篇只交代固化動作。

---

## 為什麼多數人停在「現場生跑一次」

從設計機制看，有四個結構性原因：

1. 輸入框打 `ultracode` 加題目、不點名 name → CC 預設現場生一支客製腳本（tool input = `script=`，不是 `name=`），不會自動叫已固化的 named workflow。
2. 要復用固化版必須明確輸入 `/<name>` 點名。
3. 按 `s` 存檔是額外刻意的一步，預設不存。
4. `/effort ultracode` 常駐模式 session-only，結束重置，無法持久化。

這不是使用者懶，是設計本身。官方文件也直接說：「If you exit Claude Code while a workflow is running, the next session starts the workflow fresh.」

---

## 判準

單線做法 / know-how → skill；多 agent 並行或多階段確定性編排 → workflow。workflow 跟 skill 不是取代關係，skill 表達不了的「多 agent 並行流程」交給 workflow。

ultracode / dynamic workflow 的真正價值不在「現場生跑一次」，而在「把編排本身存成可復用資產」。這個步驟需要刻意為之：按 `s` 存、用 `/<name>` 點名。不做這步，ultracode 永遠只是 session 內的一次性編排，關掉就沒了。

deep-research-paced 是本篇與姊妹篇 #61 的接點，#61 細談撞限完整過程。
