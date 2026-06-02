---
title: "ultracode 現場生完就丟，才是最大的浪費"
description: "CC v2.1.160 今天把觸發關鍵字從 workflow 改名 ultracode，但更值得講的是：多數人用完就蒸發，沒走到留存復用那步。三個固化實例，加上 6/15 launchd 政策變動的遷移動機。"
voice: v1-threads-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: posts/workflow-vs-skill-MATERIAL.md
---

今天 CC [v2.1.160](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) 把 dynamic workflow 的 prompt 觸發關鍵字從 `workflow` 改名成 `ultracode`。改名本身沒什麼，但趁這個機會想講另一件事：大多數人拿 ultracode 現場生一支腳本、跑完就蒸發——從設計機制來看，這幾乎是預設結局，不是使用者偷懶。

---

## ultracode 一字兩義，先搞清楚

在繼續之前要先說清楚，`ultracode` 這個詞今天起有兩個截然不同的意思：

**①** 在輸入框打 `ultracode + 題目`，CC 會現場生一支 JS 腳本（[dynamic workflow](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code)），調度大量 subagent 在背景隔離環境跑，你只看到最終答案。這是「prompt 關鍵字」，觸發的是現場生一次性腳本，不影響 session effort 等級。

**②** 用 `/effort ultracode` 開啟常駐模式：xhigh effort + 每個實質任務自動編排。這是「effort 檔位」，session-only，關掉就重置，沒法透過 effortLevel 持久化。

同一個詞，行為完全不同。今天 v2.1.160 改名的是第①種的關鍵字，第②、③種觸發方式（自然語句描述 / `/<name>` 點名已存的 workflow）都還在，只是很多人不知道。

順帶一提，[官方文件](https://code.claude.com/docs/en/workflows)今天查下來還寫著舊關鍵字 `workflow`，改名細節目前只在 CHANGELOG。以 CHANGELOG 為準，文件落後了。

---

## workflow 是第三種固化載體

skill、slash command、dynamic workflow，CC 現在有三種「把成功流程存起來復用」的機制。

官方對這兩種的判準講得很直接（[workflows 文件](https://code.claude.com/docs/en/workflows) / [skills 文件](https://code.claude.com/docs/en/skills)）：「Use skills when the know-how should be reusable. Use workflows when the orchestration itself should be repeatable.」

skill 固化的是「Claude 要怎麼做某件事的指令」，結果回進 context window；workflow 固化的是「腳本 runtime 本身」，多個 subagent 並行跑，只回最終答案。

兩者留存路徑也不同：skill 是一份 markdown、workflow 是一支 JS 檔（存在 `.claude/workflows/` 或 `~/.claude/workflows/`，之後用 `/<name>` 呼叫，可以用全域變數 `args` 接參數）。

我原本以為 skill 就夠用了，後來才發現：多 agent 並行的編排邏輯用 skill 根本塞不下，要 workflow 才合理。

---

## 現場生完就蒸發，是機制設計的結果

為什麼從機制推論「多數人現場生完就丟」？四點：

1. 打 `ultracode + 題目` 不點名，CC 預設現場 author 一支客製腳本（tool input 是 `script=`，不是 `name=`），不會自動呼叫你之前存好的 named workflow。
2. 存成 named workflow 要進 `/workflows` 視圖按 `s`，這是額外的刻意動作，預設不發生。
3. `/effort ultracode` 常駐模式 session-only，離開就重置。
4. 就算 workflow 跑到一半離開，下次開 CC 也是從頭重跑——官方文件原文：「the next session starts the workflow fresh」。

這四點疊在一起，「現場生跑完蒸發」是最省力的路徑，沒走到留存那步很正常：機制本來就沒引導你去存。社群上也有人觀察到類似情況：「unless you take a deliberate step to save it, the script Claude generates is essentially thrown away after the session.」

---

## 三個固化實例

我自己目前有三支 named workflow，都存在 `~/.claude/workflows/`。

**local-analysis.js**：原本有 7 個 launchd 排程，分別跑 memory / wiki / codemap 等不同 channel 的每日本機分析，各自獨立、管理麻煩。2026-05-26 完成遷移，整併成單一 named workflow，`args` 傳 date / weekday，按頻率判斷哪些 channel 要跑。原 7 個 plist 備份後停用（放在 `~/Library/LaunchAgents/disabled-local-analysis-2026-05-26/`）。遷移動作完成了，不再是定時推送，改成按需呼叫。

**daily-topic-analysis.js**：社群話題分析，原本是手動下指令 + 分段 prompt 的流程。固化成 3-phase pipeline workflow 後，第一次跑：5.5 分鐘 / 1.10M token / 27 agents / 105 tool calls；第二次跑：6.3 分鐘 / 1.93M token / 48 agents / 208 tool calls。兩次都走 CC 互動訂閱，不抽 automation credit。固化前要自己盯著跑，固化後按需呼叫。

**deep-research-paced.js**：把官方 deep-research workflow fork 出來，把 verify 階段從一次 parallel 改成每批 2 claim（peak 並發 = 2×3 = 6），保留 3-vote / 25 claims 的完整品質，然後綁回 deep-research skill 的 engine routing 當預設。完整的撞限故事留到下一篇細談，這篇只說固化動作：fork + 改 concurrency + 綁 routing。

---

## 6/15 政策，是另一個遷移動機

local-analysis 遷移不只是個人選擇，還有外部壓力：2026-06-15 起，launchd 用 `claude -p` / `--print` headless 呼叫，在訂閱方案下改抽獨立月額度 automation credit，脫離現有訂閱包含的額度。互動 TUI 仍吃訂閱不變。

workflow 走互動訂閱，不在這波政策範圍內。如果你也有用 launchd 排 `claude -p` 的習慣，還有兩週。

---

## 固化判準

整理一下我現在用的判準：

- 單線做法 / Claude 遵循的 know-how → skill
- 多 agent 並行 / 多階段確定性編排 → workflow

兩者不是取代關係，skill 表達不了「N 個 agent 同時跑」這件事，workflow 補上這塊。

ultracode 現場生跑一次沒什麼問題，但真正的價值在於把編排本身存起來，之後 `/<name>` 就能呼叫。這個步驟需要刻意為之。deep-research-paced 是這篇跟下一篇的接點：這篇交代固化動作，下一篇把撞限的完整故事講清楚。
