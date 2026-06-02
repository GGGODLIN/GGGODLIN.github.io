---
title: "ultracode 改名背後，你的 workflow 存了嗎"
description: "dynamic workflow 是繼 skill / command 之後第三種固化載體，但多數人用完就丟，沒走到留存復用那步。三個實際案例，加一條判準。"
voice: v2-threads-line-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: posts/workflow-vs-skill-MATERIAL.md
---

今天 v2.1.160 把 dynamic workflow 的 prompt 觸發關鍵字從 `workflow` 改名成 `ultracode`，順便把官方文件跟 [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) 打了個時差（文件截至今天 2026-06-02 查證仍寫舊關鍵字，改名細節目前只在 CHANGELOG，以 CHANGELOG 為準）。

改名本身不是大事。大事是：你用 ultracode 讓 CC 現場生了一支 workflow，跑完，然後它消失了。

---

`ultracode` 這個詞有兩個截然不同的意思，先講清楚。

第一個：prompt 關鍵字。在輸入框打 `ultracode` + 題目，CC 就現場生一支 JS 腳本，呼叫大量 subagent 並行跑，最後回給你最終結果。輸入框會有紫色標示，你看得到腳本在跑。這就是今天改名的角色，原本叫 `workflow`，改叫 `ultracode`。

第二個：`/effort ultracode` 檔位。這個是 session 常駐模式，xhigh effort + 每個實質任務自動編排成 workflow 跑。session-only，下次開新 session 就重置。

同一個詞，一個是「現場生一次性腳本」，一個是「常駐編排模式」。行為截然不同。

[dynamic workflow 官方公告](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code) 跟 [官方文件](https://code.claude.com/docs/en/workflows) 把這個分別說得算清楚，但實際使用時很容易混在一起。

---

回到主題：workflow 現場生跑完，然後呢？

機制上，三件事決定了大部分人停在「現場生、跑完、蒸發」這個階段：

一、打 `ultracode` + 題目，CC 預設是現場 author 一支客製腳本（tool input 是 `script=` 而非 `name=`），不會去呼叫你之前存好的 named workflow，即使題目完全一樣。

二、要把這支腳本存起來，要進 `/workflows` 視圖，按 `s`，Tab 選存入 `.claude/workflows/`（專案共用）或 `~/.claude/workflows/`（個人全域），之後以 `/<name>` 呼叫。這是額外的刻意動作，預設不發生。

三、官方文件原話：「If you exit Claude Code while a workflow is running, the next session starts the workflow fresh.」session 邊界就是 workflow 邊界，不存就消失。

從設計機制來看，不是使用者習慣問題，是結構本身讓「現場用完就丟」成為預設路徑。（這邊是機制推論，沒有實測的比例數字，只有上述機制 + 社群觀察「Most runs are one-off, on-the-fly generations」。）

---

那存起來，能幹嘛？

我自己跑了三個案例，給個具體感：

**local-analysis.js**：我本來有 7 個 launchd plist 分別跑每日本機分析，memory / wiki / codemap / recap 等等各自獨立排程。2026-05-26 把它們整併成單一 named workflow，傳 `args` 指定日期跟星期幾，讓 workflow 按頻率判斷哪些 channel 跑。原 7 個 plist 備份停用在 `~/Library/LaunchAgents/disabled-local-analysis-2026-05-26/`。

遷移動機有兩個：一是我每天本來就主動要求本機分析，launchd 的定時推送反而冗餘；二是 2026-06-15 起 launchd 的 `claude -p` 改抽獨立 automation credit，脫離訂閱（workflow 走互動訂閱不抽，訂閱安全替代路）。

要注意：完成的是遷移動作本身（停用了原 7 個 plist、按需呼叫取代定時推送），端到端跑的品質驗證是另一件事。

**daily-topic-analysis.js**：把每日社群話題分析從手動 + prompt-driven 流程改成 workflow 固化。2026-05-26 上線，首份完整跑的 digest 33KB。兩次跑的數字：第 1 次 5.5 分鐘 / 1.10M token / 27 agents / 105 tool calls，第 2 次 6.3 分鐘 / 1.93M token / 48 agents / 208 tool calls。都走互動訂閱，不抽 automation credit。

**deep-research-paced.js**：[官方 deep-research workflow](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code) 一次並行量很大，容易撞 API 限流。我把它 fork 出來改成限流版（每批 2 claim 的 concurrency-paced 設計，peak 並發 = 2×3 = 6），保留 3-vote / 25 claims 完整品質，然後綁回 [deep-research skill](https://code.claude.com/docs/en/skills) 的 engine routing 當預設。固化動作完成了，撞限的完整故事留下一篇細談。

---

這三個案例讓我整理出一個對我自己有用的判準：

單線的做法、know-how、Claude 遵循的指令，放 skill（結果進 context window，可以跟其他工具串）。

多 agent 並行、多階段確定性編排，放 workflow（腳本 runtime 跑，只回最終答案，資源消耗高但不佔 context）。

官方原話是：「Use skills when the know-how should be reusable. Use workflows when the orchestration itself should be repeatable.」兩者不是取代關係，是各自有適合的使用場景。

---

ultracode / dynamic workflow 真正有價值的部分，不在「現場生跑一次」，在「把編排本身存成可復用資產」。按 `s` 存檔、之後用 `/<name>` 點名呼叫，這兩步要刻意為之，不是自動發生的。

也算是老問題了，好工具藏在刻意的那一步後面。
