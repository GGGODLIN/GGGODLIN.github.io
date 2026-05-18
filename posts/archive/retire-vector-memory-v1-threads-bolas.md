---
title: 把 mempalace 退役了，928 次寫入換來 3 次搜尋
description: 安裝 mempalace 跑了 2-3 週，hook 自動寫入 928 次，我主動查了 3 次，0.09% 的搜尋/寫入比，6 個對照測試 grep 全勝——最後親手拔掉。
voice: v1-threads-bolas
status: 實驗 draft（第一篇 refresh，從 MATERIAL 重寫，非已發布版）
source: posts/retire-vector-memory-MATERIAL.md
---

# 把 mempalace 退役了，928 次寫入換來 3 次搜尋

前兩天翻了一下 hook.log，22,890 行，然後驚覺自己居然把一個用了快三週的工具拔掉了，還完全不覺得可惜。

---

## 裝的時候覺得很合理

Cursor 2023 爆紅，核心敘事是「AI 第一次真懂整個 repo」，底層據說是 vector embedding 在跑。不管底層對不對，那個「AI 懂我」的體感是真的，然後就有一批人開始把 RAG 這套邏輯帶進個人工作流，想複製同樣感覺。

我也是這批人。

2026-04-07，mempalace 開源上線，作者 Milla Jovovich + Ben Sigman，自帶話題性（好萊塢跨界搞 AI 開源這種事本身就很難不注意）。宣稱 LongMemEval R@5 96.6%，本機跑、原文照存、0 API token，幾週後 star 數衝到 5 萬。當時 Claude Code 的 memory 感覺有點不夠用，時間點剛好。

裝了。然後認真配了 Stop hook + PreCompact hook 讓它自動在每次對話結束後把 session 存進向量資料庫。早期踩到 mining 範圍沒限定的坑——整個 `~/.claude` 目錄都被掃進去，儲存量膨脹到 84GB。寫了一個 `update-symlinks.sh` 只指向主 session jsonl 解決，繼續跑。

---

## 數字出來之前，我以為它在正常運作

hook 每次都有 log，每次對話結束都有觸發，感覺一直在動。直到翻了一下統計才發現：

- AUTO-SAVE 寫入：**928 次**
- 真實搜尋 query：**3 次**（ccstatusline benchmark / extra credits / session 備份 github 各一次）
- 累計 drawers：**3,429 條**
- 搜尋/drawer 比：**0.09%**

3 次除以 3,429 條，等於 0.09%。

204 個 session 全部 mined 完之後，每次觸發 hook 跑出來的結果是 `Files processed: 0 / Drawers filed: 0`，還是會跑，只是什麼都不做。磁碟另外躺了 271 MB（245 MB uv venv + 26 MB 向量資料）。

我以為這個工具在幫我記東西，其實主要在幫我寫東西而已。

---

## 退役前做了 6 個測試，結果讓我有點難受🤣

帶著「說不定 0.09% 只是因為我懶得搜尋，不代表搜起來沒用」的自我安慰，挑了 6 個真實工作查詢，mempalace MCP 對照直接 grep MEMORY.md：

| 查詢 | mempalace | grep |
|---|---|---|
| ccstatusline cold start benchmark | 0/3（負相似度 -0.439） | 命中 |
| extra credits 爆掉原因 | 0/3（同名詞跨領域干擾） | 命中 |
| 過去一週做了哪些 project | 0/5（撈到無關來源） | 命中 |
| 為什麼換工具 | 反向命中（撈到「不換」的紀錄） | 命中 |
| 新 project 命名 | 跨範圍失準 | 命中 |
| memory 系統演進脈絡 | 沾邊但沒結論 | 命中 |

6/6，grep 全對，mempalace 全錯。

不是一題兩題的問題，是系統性的。

---

## 根本原因不是 ChromaDB 爛，是語料性質不對盤

我原本以為向量搜尋失準是 HNSW 參數沒調好，或是 embedding model 的問題，測了才知道根本不是這個層次的事。

問題是 3,429 條 drawers 的內容本質——原始 session 對話片段，未整理，命中了也只有上下文片段，沒有結論。grep MEMORY.md 命中的是什麼？是我手工整理過的結論濃縮，自帶答案。

同時輸兩層：召回層（精確關鍵字 > 向量語意，在「找具體事實」這類查詢特別明顯）+ 內容層（整理過的摘要 >> 原始對話片段）。

要不要把抽取流程換成 LLM 萃取精華片段？那就等於手工整理 memory，向量索引那層反而多餘。也評估過 Mem0、Memori 的混合方案，以及阿里的 ReMe（有趣的事：AgentScope ReMe Light 模式長期記憶檔案名稱就叫 MEMORY.md，和我手工系統完全相同）——結論一樣，替代方案只解召回那一半，語料整理那一半不解。

整理品質決定結果，不是撈取演算法。

---

## 退役執行是幾分鐘的事

決定之後就直接做了：

寫 `checkpoint-judge.sh` 接管 Stop/PreCompact hook，邏輯改成「告一段落了嗎？是→寫 MEMORY.md；否→skip」。移除 mempalace MCP 加上 3 個相關 hook，刪向量資料庫，收回 271 MB 磁碟。

2026-04-28 17:52 執行完畢。

意外的副產品：memory 結構演化成兩層——MEMORY.md（頂層）+ `_index_<topic>.md`（cluster 二層）。本來是為了繞 25KB 限制硬拆的，後來發現比平鋪更好查，留下來了。

---

## 拔掉不到三週，業界跑出了同方向

退役後約 19 天，同期浮現幾個 memory 蒸餾整合方案：

Claude Code binary 2.1.98+ 版本裡藏了 `/dream` skill（Piebald-AI/claude-code-system-prompts 10.1k★ 驗證從 npm bundle 提取）——但被 kill-switch 擋住沒發布；Anthropic Dreams API 進 Managed Agents Research Preview；OpenClaw Dreaming v2026.4.5+ 走 cron + Light/REM/Deep 三階段；社群 `grandamenium/dream-skill`（55★）走 Stop hook + 24 小時條件。

共同方向：從向量撈取移向排程式蒸餾整合，也就是「定期把原始 session 蒸成整理過的片段」。我用 macOS launchd cron + `claude -p` 每日跑的做法，和 Anthropic 內部設計方向相同。

這個不是說自己早，只是確認了退役決策的方向沒錯。

---

## 什麼情況下才需要向量

大部分個人開發查詢屬於「找具體結論、環境事實、實體名稱」，是 grep 的強項。向量語意搜尋的少數優勢（純概念連接）在個人工作流裡是少數派。

先把 MEMORY.md 用 cluster index 結構寫好，不到一個月後再回頭問自己是否需要向量——大多數人那時候應該會發現，根本沒有需要問第二次的機會。

---

*2026-05-17 / 退役後第 19 天*
