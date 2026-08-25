---
title: "省 token 工具說能省多少，扣掉暖機費後才算數"
description: "評估省 token 的 proxy 工具時，先扣除新 session 的暖機費，再看工具最後能省下多少，以及 session 規模能否跨過回本門檻。"
pubDate: "2026-08-25"
tags: ["claude-code", "token-optimization", "prompt-caching", "proxy", "cost-analysis"]
---

# 省 token 工具說能省多少，扣掉暖機費後才算數

我這次先算一件容易被忽略的事：把 Claude Code 指到自訂 base URL 的 proxy 後，每一場新 session 可能會先背一筆進場成本。

在這組對照裡，我把這筆進場成本稱為暖機費。工具實際省下的量不夠高，或 session 太短，整場工作到結束都可能還在填這筆費用。

> **省流**
>
> - 拿 [Headroom](https://github.com/chopratejas/headroom) 本機試跑量到的 15.6% token 縮減比例做假設，成功回本的 session，其回本點中位數是累積處理約 323.5K context tokens；541 個 sessions 中有 66.5% 回本。
> - 如果 [pxpipe](https://github.com/teamchong/pxpipe) README 宣稱的 59%／70% 能等比例轉成 prompt 成本節省，回本點中位數約為 103K／76K，約 96% 的 sessions 回本。

## 這組測試的暖機費從哪裡來

先講清楚範圍。以下三回合數字只屬於單一帳號、機器、Claude Code 2.1.241、Sonnet 5 與純轉發 proxy 的對照設定，不代表所有自訂 base URL。

先前實測 Headroom v0.36.4 時，它的 proxy 與關閉壓縮的純轉發模式都重現了同類首回合成本。兩者用量與成本相同，證明差異來自 custom-base 路徑，不是壓縮開關。

但那次沒有量 Headroom 的同 session 三回合。本文的 0.0951 美元不能直接當成 Headroom 的固定費用。pxpipe 則沒有 live 測。

同一個 session 連續送出三次請求，API 用量裡的 `input_tokens` 是：

- 直連：`2 → 2 → 2`
- Proxy：`15,003 → 47 → 47`

這個欄位表示每次請求未命中快取的輸入；它不是整個 context，也不是 proxy 額外增加的 token。數列顯示首回合未快取輸入偏高，完整用量另顯示第二回合有一次快取寫入，第三回合則進入穩定狀態。因此，它是一筆集中在 session 開頭的暖機費，不是每回合固定增加 15K。

三回合合計後，直連按 Sonnet 5 API 牌價換算的 prompt 成本約為 0.2401 美元，proxy 約為 0.3352 美元，差額約 0.0951 美元。依照 2026-08-25 的 [Anthropic 牌價](https://platform.claude.com/docs/en/about-claude/pricing)，一般輸入每百萬 token 2 美元、快取讀取 0.20 美元、5 分鐘快取寫入 2.50 美元、1 小時快取寫入 4 美元；模型排除輸出成本。

這是 API 等值的三回合估算，不是 Max 帳單，也不是通用固定費用。它只提供一條回本線：工具後續省下的 prompt 成本，必須先超過這 0.0951 美元。

## 我自己的 session 有多少能回本

我從自己過去 30 天的紀錄中，篩出 541 個符合條件的 session：至少有三次請求、相鄰中斷不超過一小時、沒有 context 重置，而且快取欄位足以計價。這些不是未整理的全部紀錄，而是篩選後的統計樣本。

每次請求的輸入與快取用量先依 Sonnet 5 牌價換成 prompt 成本，再假設工具能等比例省下其中一部分。在這個假設模型裡，我對每個 session 固定扣一次 0.0951 美元；這不是 541 個 session 各自量到的固定費用。累積省下的成本第一次不再低於暖機費，就是回本點。

第一個假設來自 Headroom 基礎函式庫的本機試跑。它只測試 47 筆工具輸出，共壓掉 15.6% token。我沒有把 Headroom 實際跑在這 541 個 session 上，而是把 15.6% 當成假設省幅。

在這個情境中，360／541，也就是 66.5% 的 session 能在結束前回本。這 360 個回本的 session，其回本點中位數約為累積 323.5K prompt tokens。中位數不是所有 session 共用的門檻：一半較早回本，一半較晚回本，另外 181 個 session 到結束仍沒回本。

第二個假設來自 pxpipe README 自報的端到端省幅。若 59% 能等比例轉成 prompt 成本節省，96.3% 的 session 回本，回本 sessions 的累積 prompt token 中位數約 103K；若省幅是 70%，回本比例為 96.7%，中位數約 76K。

Headroom 本機試跑只量工具輸出，pxpipe 則宣稱端到端省幅，兩個分母不同，不能當成同一套產品實測成績。這裡只是把兩組比例放進同一個假設模型，觀察暖機費在高低省幅下會造成什麼差別。

## 先扣暖機費，再看最後省多少

看到「省 token」的工具時，不用急著全盤否定，也不該直接把宣傳百分比套進自己的帳單。

真正要比較的是：工具實際省下多少 prompt 成本，接 proxy 又新增多少暖機費。只看總 token 也不夠，因為同一段 context 可能被重讀多次，一般輸入、快取讀取與快取寫入的價格也不同。

工具寫省多少，使用者要算扣完暖機費後還剩多少。
