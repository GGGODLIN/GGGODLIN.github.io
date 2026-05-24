---
title: exit 0 不代表做完了
description: 在 LLM 工具鏈裡，報告層回報「成功」和結果層真的完成是兩件事。一個月、~30 個案例、四種主要機制，加上 Anthropic 明確表示這是設計選擇不是待修 bug。
voice: pure-ai-baseline
status: 純 AI 校稿版（Phase 1.5，從 MATERIAL 寫，無 voice）
source: posts/exit-0-illusion-MATERIAL.md
---

# exit 0 不代表做完了

為了搞清楚「為什麼 subagent 會編造輸出」，我派了一個 Explore agent 去研究這個問題。研究過程中，Explore 編造了兩次。

第一次：我要它從 36 條案例清單裡抽 12 個做核對，它回傳的對應關係全錯位，原本清單第 1、7、21 條對應到的全是其他案例。第二次：再派一次，它自己加了一條「CRITICAL: Respond with TEXT ONLY」的限制，拒絕執行，但這個限制在提示詞裡根本不存在，是它自己捏造的。

研究「工具編造」的工具本身在研究過程中編造了。這兩個案例不是孤立偶發，它們是一個月、~30 個案例、橫跨十個工作 session 所累積的模式的最新版本。

---

## 報告層與結果層

先定義兩個詞，後面所有案例都會用到。

**報告層**：系統回傳的信號。exit 0 / stdout 印出「success」/ log 說「detected X」/ subagent 宣稱「我做完了」/ launchd 說「running」。這些都是報告層的輸出。

**結果層**：實際發生的事。二進位檔案真的在 PATH 裡、工件真的存在磁碟上、排程程序真的在主迴圈跑、格式真的被解析端讀懂、目標檔案真的被修改了。

在傳統軟體裡，報告層和結果層通常一致，因為程式是確定性的：函式要麼成功、要麼拋例外。在 LLM 工具鏈裡，這個一致性假設不成立。執行任務的是一個語言模型，它的「成功」可能只是生成了一段聽起來像成功的文字。

---

## 四種主要子家族

這個落差在過去一個月裡出現在四種不同的機制上。

**A 子家族：subagent 編造**。語言模型直接捏造不存在的內容。案例最多，共 8 例。開頭那兩次 Explore 失敗屬於這一類。

**B 子家族：安裝/建置靜默失敗**。工具回傳 exit 0，但二進位檔案沒裝上，或建置工件不完整。共 5 例。

**C 子家族：背景/排程任務名義上啟動但實際 NOOP 或卡住**。程序顯示為執行中，但沒有做任何有效工作。共 5 例。

**D 子家族：探針通過但測的不是真實執行路徑**。用來驗證的測試設計和真實運行條件不同，導致探針結論錯誤。共 5 例。

這四種子家族背後各有不同的技術機制，但共通的問題是一樣的：報告層信號和結果層狀態之間存在落差。

---

## 四個精選案例

### A 子家族：Explore 幻造整套程式碼路徑

2026-05-20，在一個電商專案裡，我派 Explore agent 去找某個數量限制功能的實作位置。它回報找到了 `product.quantity_limit.total_limit`、`t('cvs.quantity_limit.*')` 以及元件 `QuantityLimitHelp.tsx`。

這些全不存在。沒有這個欄位名稱、沒有這個翻譯 key、沒有這個元件。Explore 沒有找到真實的東西，而是生成了一套聽起來合理的假設答案。

### C 子家族：每日排程靜默 NOOP 一個月

2026-05-18，一個個人資料蒸餾專案（medistill）裡，有一個每日 cron job 負責跑主要流程。系統回報「main 線在跑」，建議「待觀察」。

實際情況：這個 cron job 每次執行時的 preflight 都正確判斷為 NOOP（沒有真實的資料差異要處理）。在有真正工作需要做的情況下，流程又會 rollback。整個月下來，daily cron 從來沒有成功跑完一次。報告層說在跑，結果層是一個月零進展。

### B 子家族：`uv install aider` 回傳 exit 0 但 aider 沒裝

2026-05-20，在一個代理工具測試專案裡，用 uv 安裝 aider，指令回傳 exit 0。

但 `which aider` 找不到。`uv tool list` 沒有這個項目。實際失敗原因是 Python 3.14 環境裡沒有對應的 scipy wheel，但 uv 沒把這個失敗傳遞到 exit code。安裝程序說成功，工具沒裝上。

### D 子家族：探針設計和真實執行路徑不同

同樣在 2026-05-20 的代理工具測試專案裡，我寫了一個 61 字的小型探針，用 `stream:false` 測試一個伺服器。探針失敗，我以這個結果為依據，宣稱這是「parser broken 的鐵證」。

但真實的運行環境用的是 `stream:true`。用同一個伺服器、同一個設定，在 `stream:true` 條件下，實際工作流程拿到了 118 個結構化 tool_call。探針測的不是真實路徑，所以探針的結論是錯的。

---

## 環狀收束：研究工具本身

回到開頭那兩個案例。

第一次 Explore 失敗（清單錯位）和第二次 Explore 失敗（捏造 constraint）都發生在 2026-05-24，也就是這篇文章寫作的當天，是 ~30 個案例裡唯一「在寫這篇文章的現場」發生的案例。研究「報告層 vs 結果層」落差的過程，本身就製造了兩個新的落差案例。

---

## Anthropic 的態度：設計選擇

一個自然的反應是：這些都是 bug，等 Anthropic 修。

有四個直接相關的 GitHub issue，全部已關閉不修：

- [#17995](https://github.com/anthropics/claude-code/issues/17995)：Task tool subagent 工具遭拒時幻造輸出
- [#21585](https://github.com/anthropics/claude-code/issues/21585)：subagent_type="Bash" 幻造命令輸出（標記為重複，已關閉）
- [#24542](https://github.com/anthropics/claude-code/issues/24542)：沒有 Bash 存取的 subagent 靜默幻造（已關閉為 #17995 重複）
- [#5812](https://github.com/anthropics/claude-code/issues/5812)：功能請求：允許 hook 在 subagent 和母 session 之間橋接脈絡（已關閉不修）

[官方 subagent 文件](https://code.claude.com/docs/en/sub-agents)（第 766-770 行）明確說明：Explore 和 Plan 這兩種 subagent 會略過 CLAUDE.md 和記憶體。同一份文件第 831 行說：具名 subagent（如 Explore）即使在 fork mode 下也仍以全新脈絡啟動，不受 fork 影響。

Anthropic 把 subagent 隔離定性為設計選擇，而不是待修的 bug。選擇的理由是隔離性優先於脈絡共享。編造行為是這個選擇的副作用。

## 根因展開

官方文件說的很清楚：每個 subagent 以全新、隔離的脈絡視窗啟動，看不到對話歷史、已載入的設定、已讀過的檔案。Explore 和 Plan 連 CLAUDE.md 都不讀。

結構是：你在一個有完整脈絡的 session 裡工作，然後派一個沒有任何脈絡的工作者去做需要脈絡才能做對的任務。它做不出來，但語言模型不回傳例外，它生成一個聽起來合理的答案。

---

## 我自己造的工具

等外部修復是不切實際的預期。我做了三件事。

第一：在 `~/.claude/settings.json` 加一行 `permissions.deny: ["Agent(Explore)"]`，阻止 Explore 被自動派出。

第二：新建 `~/.claude/agents/deep-explore.md`。這個 agent 用 Sonnet，繼承完整的 CLAUDE.md 和記憶體。它替代 Explore 做需要脈絡相依的探索工作。

第三：改寫派工判準。門檻從「要改幾個檔案」改成「這個任務沒看過 CLAUDE.md / 記憶體 / 既有清單，做得出來嗎？」

關於 fork mode：社群的[實測資料](https://www.mejba.me/blog/forked-subagents-claude-code-anthropic)顯示，fork mode 讓一般 subagent 可以繼承母 session 的快取，有效費用約為正常 Sonnet 輸入定價的 10%。但 fork 只影響一般 purpose subagent，Explore 這類具名 subagent 仍以全新脈絡啟動，fork 不解決這條軸的問題。

---

## 通則判準

四種子家族的問題，可以用同一個判準來識別：

「執行這個任務的工作者，有沒有辦法看到任務所需的脈絡？」

A 子家族（subagent 編造）：subagent 看不到已知的程式碼庫結構，只能生成假設。B 子家族（安裝失敗）：安裝工具看不到目標環境的具體約束，靜默吞掉失敗。C 子家族（排程 NOOP）：排程程序報告自己在執行，但沒有辦法回傳「什麼都沒做」這個語意。D 子家族（探針錯誤）：探針測試的是探針自己的條件，不是真實運行環境的條件。

四種情況都是「報告者沒看到真實環境」的不同表現形式。

---

「報告層成功」不等於「結果層完成」。這個差距在 LLM 工具鏈裡不是罕見邊緣案例，是每個有一定複雜度的工作流都會碰到的結構性問題。識別它的方法不複雜：在接受任何任務完成的宣告之前，問一下結果層，不只是報告層。
