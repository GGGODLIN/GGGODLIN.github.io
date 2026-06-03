---
title: "ultracode workflow，別跑完就丟"
description: "dynamic workflow 是繼 skill 之後第三種「把成功流程固化成可復用資產」的載體。ultracode 的真正價值不在現場生一支腳本跑完，而在把編排本身存下來復用。三個實際遷移案例講怎麼選。"
pubDate: 2026-06-02
tags: ["claude-code", "workflow", "skill"]
---

# ultracode workflow，別跑完就丟

多數人用 ultracode 現場生一支腳本、跑完就關掉了。沒人按 `s` 存。這是從 session-only 設計機制和社群觀察推導出的判斷，不是有統計數字支撐的宣稱。但機制如此，不存下次就要重新來過。

---

## ultracode 一字兩義，要先搞清楚

`ultracode` 這個詞現在同時指兩件不同的事：

一個是 **prompt 關鍵字**：在輸入框打 `ultracode`，CC 會現場生一支 JavaScript 腳本，叫一批 subagent 在背景的隔離環境裡跑，你只收最後的結果。這就是接手 `workflow` 觸發角色的那個，觸發後不會動到 session 的 effort 設定。

另一個是 **`/effort ultracode` 檔位**：等於把 effort 開到最高，再加上每個正經任務都自動編排成 workflow。它只活在當下這個 session，關掉就重置，沒辦法寫進設定檔留著。

同名，但不是同一個東西。

觸發 workflow 的方式有三種，都還在：第一種是 prompt 關鍵字（現在改叫 `ultracode`）、第二種是直接用自然語句描述任務、第三種是用 `/<name>` 點名已經存好的 named workflow。2026-06-02 的 v2.1.160 只動了第一種的關鍵字，把 `workflow` 改名成 `ultracode`，舊的打 `workflow` 已經不會觸發了。這個改名目前只記在 [CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)，[官方文件](https://code.claude.com/docs/en/workflows)截至 2026-06-02 查證仍寫舊關鍵字 `workflow`，以 CHANGELOG 為準。

---

## 第三種固化載體

我原本以為 [dynamic workflow](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code) 只是「ultracode 的底層實現」，後來才發現它其實跟 skill 是平行的東西，各自解決不同問題。

官方對 skill 和 workflow 的分工講得很清楚：

> Use skills when the know-how should be reusable. Use workflows when the orchestration itself should be repeatable.

[Skill](https://code.claude.com/docs/en/skills) 存的是「指令」，Claude 遵循後結果進 context window。Workflow 存的是「編排本身」，runtime 執行 JS 腳本、只回最終答案。兩者留存路徑不同，不是誰取代誰。

這樣算起來，固化的載體有三種：slash command、skill、workflow，各自對應不同需求。你要固化的是一條單線做法或一段知識，那是 skill 的活；是多個 agent 並行、或好幾個階段要照固定順序跑，才輪到 workflow。

存成 named workflow 的方法：`/workflows` 視圖按 `s`，Tab 選存入 `.claude/workflows/`（專案共用）或 `~/.claude/workflows/`（個人全域）。之後 `/<name>` 呼叫，可以透過全域變數 `args` 接收參數復用。

存法簡單，但有幾條硬限制要知道：腳本本身不能太大，一支 workflow 最多開到一千個 agent，能同時並行的數量看你機器有幾顆核心（大概十幾個上限），而且腳本裡不能用會變動的東西，像當下時間或亂數，不然會破壞它續跑時的快取。

---

## 三個固化實例

### local-analysis：7 個排程收成 1 支

我之前在 macOS 的 launchd 上掛了 7 個排程，各自跑不同的分析（記憶、wiki、codemap、每日回顧那些）。每個都獨立設定、維護很散，而且固定時間推給我，但我不一定那個時間要看。

2026-05-26 我把這 7 個整併成一支 named workflow，原本的排程全部停掉，改成我要的時候才呼叫，傳進日期跟星期幾，它自己判斷今天哪幾項要跑。固化到現在跑過很多次了，沒什麼狀況。

會想搬，一半是我本來就習慣主動要、定時推根本多餘；另一半是政策面：2026-06-15 起，用 `claude -p` 這種 headless 方式跑會改抽獨立的 automation 額度、脫離訂閱，但在互動介面裡呼叫 workflow 還是走訂閱、不另外算。

### daily-topic-analysis：手動流程收成一條 pipeline

社群話題分析本來是手動加上一堆 prompt 拼起來的，每次跑都要靠記憶重組步驟。2026-05-26 我把它固化成一支 workflow，分三個階段照順序跑：先確認資料來源，再抽主軸，最後做網址的事實查核。

固化之後跑過兩次，規模給你抓個感覺：一次大概五六分鐘、燒掉一百多萬到接近兩百萬 token。兩次都走 Claude Code 的互動訂閱，沒抽到 automation 額度。

### deep-research-paced：官方版改成限流版

CC 內建了一支官方的 deep-research workflow（編在程式裡，沒有檔案、只能用名字叫出來），它一次並行開太多，會撞到 API 的限流（[撞限的完整過程我另外寫了一篇](https://gggodlin.github.io/blog/deep-research-rate-limit/)）。我把它 fork 出來改了一版：本來驗證階段是一次全部平行跑，我改成一小批一小批來，把同時的並發量壓低，但原本的品質機制（多輪投票、查核的題數）完全保留。改好之後綁回 deep-research 這支 skill，讓它預設就走我這個限流版。

---

## 為什麼多數人都只是現場生一支、跑完就丟

從設計機制看，有四個結構性原因：

1. 你在輸入框打 `ultracode` 加題目、沒點名要哪一支，CC 預設就現場生一支新的客製腳本，不會自動去叫你已經存好的 named workflow。
2. 要復用固化版必須明確輸入 `/<name>` 點名。
3. 按 `s` 存檔是額外刻意的一步，預設不存。
4. `/effort ultracode` 常駐模式 session-only，結束重置，無法持久化。

這不是使用者懶，是設計本身。官方文件也直接說：「If you exit Claude Code while a workflow is running, the next session starts the workflow fresh.」

---

## skill 還是 workflow，怎麼選

一句話分：你要固化的是一條單線做法或一段知識，用 skill；是多個 agent 並行、或多階段要照固定順序跑，用 workflow。兩者不是誰取代誰，skill 寫不出來的「多 agent 並行」就交給 workflow。

ultracode 的真正價值不在「現場生一支、跑完就丟」，而在「把編排本身存成可復用資產」。這個步驟需要刻意為之：按 `s` 存、用 `/<name>` 點名。不做這步，ultracode 永遠只是 session 內的一次性編排，關掉就沒了。
