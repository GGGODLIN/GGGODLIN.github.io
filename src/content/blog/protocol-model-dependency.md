---
title: "我以為 Opus 沒遇到麻煩，後來發現是它根本沒在報"
description: "換 Opus 一個多月沒看到 agent 回報摩擦點，我以為沒問題。grep 一下才發現，是它根本沒在報。"
pubDate: "2026-06-27"
tags: ["Claude Code", "hook", "model", "llm-behavior"]
---

# 我以為 Opus 沒遇到麻煩，後來發現是它根本沒在報

前陣子 Fable 上線，我發現它很強，拿來改進 harness。但 Fable 很快被禁用，我換回 Opus——換回來一個多月，一直沒再看到 agent 回報摩擦點，我以為沒問題。

後來 grep 了一下 session 紀錄，才發現根本不是沒問題，是它沒在報。

## 「沒撞到摩擦點」這個判斷是錯的

先說背景。我在主力工作專案的 CLAUDE.local.md 寫了一條常駐指示（cascading instruction——寫進設定檔、每個 session 自動載入、靠 agent 自律執行）：每個 turn 結束前，agent 要自檢這個 session 對工作流或 harness 有沒有踩到摩擦點，有的話記進清單，等我有空一次處理。Fable 期那陣子，對談裡看得到回報、清單也在累積，我一直以為這條指示「寫了就成立」。

6/13 Fable 被禁用，我換回 Opus。到 6/18 中期 review，我回頭 grep 這段時間的 session jsonl：12 個 Opus session，0 個 turn 末尾報過清單條數。清單從 6/12 之後就 0 新增。

我先前據此判過「Opus 沒撞到摩擦點」。這個判斷是錯的，實際是「Opus 不報」。沒回報不等於沒問題，只是沒人告訴你。

## 同一份指示，不同 model 遵循度天差地別

CLAUDE.local.md 沒改、repo 沒換、harness 還是同一套，我能確認的主要變因是 model。Fable 期至少看得到這條指示被執行；Opus 期嚴重到 12 個 session 全 0。

不像是單純「指示寫錯」。同一份指示 Fable 至少曾經執行。在這組使用情境裡，Opus 對這類「靠 agent 自覺執行、沒有機制檢查做了沒」的文字指示，遵循度明顯偏低。常駐指示的有效性跟 model 綁定，寫了不等於成立。但這個對照不能講成 100% 乾淨：回頭查，Fable 期也有漏記，差別只是 Opus 那側嚴重到 12 個 session 全 0。

## 那到底有沒有摩擦點

先說清楚，這裡的摩擦點指的是 agent 跑一跑讓任務變慢、變錯、需要人救場或改流程的具體卡點。為了確認「沒回報 ≠ 沒問題」到底是哪一邊，我後來跑了一輪 Stage 2 LLM finder 複查：28 個 session 跑 finder、每個發現走 3 vote 對抗式驗證，最後確認 52 條摩擦點、否決 27 條，52 條按根因歸併成 10 個 cluster。這 10 個 cluster 是：默默繞過、Bitbucket auth、CWD 持久化、write-needs-read、codex-rescue、CODEMAPS 重寫、worktree gap、STATE drift、小細節這些。

摩擦點一直都在，只是 Opus 沒報。原判「Opus 沒撞到摩擦點」就此推翻成「Opus 不報」。

## 不是所有常駐指示都失效

要講清楚，不是所有常駐指示都被 Opus 忽略。只有「需 agent 主動、自律執行、無機械強制」那類才會失效。有 hook、工具、外部迴圈強制執行的不會，因為不依賴 agent 乖不乖。

高風險的是「以為寫進 CLAUDE.md 開頭注入、agent 就會整個 session 維持紀律」那類：每 turn 報告條數、自我審計、主動記錄摩擦點——這種「每 turn 自覺做、沒人檢查做了沒」的。

不會失效的：UserPromptSubmit hook 每次開頭硬塞提醒、Stop hook grep 當輪 assistant text 寫進稽核紀錄、cron 排程或人去檢查，這些 agent 乖不乖都會跑。

把範圍講窄，解法才有正當性。失效的是「靠文字指示拜託 agent」那類，不是常駐指示整個機制崩掉。

## hook 化把「請求」變回「指令」

解法是 hook 化。

原本那條「每 turn 報清單條數」是個請求，靠 Opus 自律，Opus 不自律就 0 報。修法是把它升級成 harness 層的提醒與稽核：一支 UserPromptSubmit hook 每 turn 開頭注入軟提醒，一支 Stop hook 不阻塞地 grep 當輪 assistant text，把「報了沒、報了幾條」附加進稽核紀錄。機制從「只靠文字指示自律」變成「hook 強制提醒與稽核」。

兩支 hook 都有退場機制：trial 結案剪掉 active.md 對應條目時，hook 會自動停。regex 先對基準 session 跟模擬紀錄都 dry-run 過才上線。

上線後的稽核數字長這樣（以 Stop hook 的 regex 判定）：hook 前 Opus 12 session「0 個報告」，hook 上線後 14 個 Opus session 有 10 個出現報告、163 個 turn 裡 61 個可判定為已回報，大概 37%。

37% 不是 100%。Opus 對軟提醒還是漏報約 63%，連 hook 都救不回全部，反而坐實「Opus 對這類指示遵循度明顯偏低」。另外稽核是 6/18 才上線、沒有 Fable 期的對照資料，所以保守地說，hook 上線後 Opus 的可觀測回報率從 0% 變成約 37%，但不能講「hook 解決了問題」。

誠實說，hook 化只是把「請求」變回「指令」，不是把 Opus 變乖。Opus 還是那個 Opus，只是現在有不依賴它自律的機制在跑。

## 這是「沒訊號 ≠ 沒事」家族的另一個場景

這篇跟之前寫過的 [exit-0-illusion](/blog/exit-0-illusion) 是同一家族。那篇講「exit 0 不等於做對」（報告層成功、結果層另一回事）；這篇講「沒回報不等於沒問題」（觀察層無訊號、實際層有狀況）：沒訊號不代表沒事（absence of signal ≠ signal of absence）。

把「有沒有摩擦點紀錄」當「有沒有問題」的替代指標，前提是「回報指示有被遵守」。agent 不遵守回報指示時，這個替代指標直接失效，而且失效得無聲無息：沒錯誤、沒警告，清單就是不再長新條目。

這篇跟另一篇講 hook 架構的文章不同：那篇打架構反共識（本地勝雲端），這篇打認知謬誤（這套約定跟 model 綁定）。

## 帶走的東西

常駐指示不是寫進 CLAUDE.md / CLAUDE.local.md 就成立。靠 agent 自律的那一類，會跟 model 綁定；有 hook、工具或外部稽核的那一類，才比較不怕 model 換掉。這次真正的教訓不是「讓 Opus 變乖」，而是別再把沒回報當成沒問題。

也算是老問題了。
