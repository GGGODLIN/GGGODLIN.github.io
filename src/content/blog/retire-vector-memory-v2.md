---
title: "退役向量記憶——928 次寫入、3 次讀取"
description: "跑了 2-3 週，3429 個 drawer、6/6 測試全輸給 grep MEMORY.md。數據出來就退役，順帶把根本原因想清楚。"
pubDate: 2026-05-18
tags: ["claude-code", "memory", "vector-db", "retrospective"]
---

# 退役向量記憶——928 次寫入、3 次讀取

Cursor 爆紅之後一批人的直覺反應是：把向量撈取帶進個人工作流。底層邏輯是「AI 之所以懂整個 repo，是因為 embedding 把程式碼語意都抓起來了，那記憶系統也應該這樣搞」。我原本也這樣想。

後來發現根本原因不在撈取演算法。

---

## 怎麼裝起來的

2026 年 4 月 7 號，mempalace 開源上線——Milla Jovovich 跟 Ben Sigman 一起做的，好萊塢跨界 AI 開源那種話題性。宣稱 LongMemEval R@5 96.6%，本地跑、原文照存、不送 API token，幾週後 star 數衝到 5 萬。加上我自己感覺 Claude Code 原生的 MEMORY.md 25KB 上限不太夠用，就裝了。

實際裝起來是：把 Stop hook 跟 PreCompact hook 接進 mempalace，每次對話結束自動把 session 存進向量資料庫。還遇到一個坑：mining 範圍沒設好，整個 `~/.claude` 目錄都被掃進去，磁碟膨脹到 84GB。自己寫了 `update-symlinks.sh` 只指向主 session jsonl 解掉。

---

## 數字出來了

跑了兩三週，到 2026-04-28 退役前統計：

- **AUTO-SAVE 寫入：928 次**（每次對話結束自動觸發）
- **真實搜尋：3 次**（cmux 問題、TanStack Start 用法、session 備份方案）
- **drawer 累積：3429 個**
- **讀寫比：0.09%**

3 次搜尋都沒有用 mempalace 的 MCP search 撈到想要的東西。每次都是改去 grep MEMORY.md。

hook 那邊也開始空轉：全部 204 個 session 都被 mine 過了，之後每次 Stop 觸發是 `Files processed: 0 / Drawers filed: 0`，hook 還是跑。hook.log 累積到 22,890 行。

---

## 退役前做了一個測試

退役之前挑了 6 個真實工作查詢，同時送 mempalace MCP 跟直接 grep MEMORY.md，看哪個撈得到：

| 查詢 | mempalace | grep |
|---|---|---|
| ccstatusline cold start 基準測試 | 0/3（負相似度 -0.439） | 命中 |
| extra credits 爆了那件事 | 0/3（同名詞跨領域混淆） | 命中 |
| 上週做了哪些 project | 0/5（全是不相干來源） | 命中 |
| 為什麼換這個工具 | 撈到「不換的紀錄」（反向命中）| 命中 |
| 新 project 命名脈絡 | 跨範圍失準 | 命中 |
| memory 系統演進過程 | 沾邊但沒有結論 | 命中 |

6/6，向量全錯，grep 全對。

---

## 根本原因不是 HNSW 的問題

一開始以為是向量引擎選得不好，試著評估 Mem0、Memori 這些混合撈取方案。評估完發現問題不在這。

真正的根本原因是**語料性質不對盤**。

drawer 是什麼？原始 session 對話片段，3429 條，沒整理過。向量搜尋命中一個 drawer，你只拿到一段舊對話的 snippet，沒有結論，沒有判斷，就是一段脈絡。

MEMORY.md 裡面是什麼？手工寫的結論濃縮。我去找「為什麼換工具」，MEMORY.md 裡有一條「為什麼換 X：因為 Y，後來改成 Z」，grep 直接命中答案。同樣的查詢在 drawer 裡是命中 5 段討論過換工具的對話片段，結論要自己去讀再重新判斷。

所以 file-based memory 同時贏兩層：
1. **召回層**：精確關鍵字 grep 對特定 token 比語意向量強
2. **內容層**：手工整理的摘要本身就是答案，原始 session 只有脈絡

也評估過阿里 AgentScope 子專案 ReMe（`github.com/agentscope-ai/ReMe`，2,824 星）。Light 模式直接走檔案系統、長期記憶檔名就叫 MEMORY.md——跟我手工在跑的架構完全一樣。看完 ReMe 的設計瞬間意識到：我已經是 ReMe 路徑的人工版了，再裝一層向量索引是多餘的。

大道至簡。效果都不如讓 Claude 自己 grep。🤣

---

## 退役執行

2026-04-28 執行：

- 寫了 `checkpoint-judge.sh` 接管 Stop / PreCompact，改成 Claude judge 判斷「這段夠不夠告一段落」，是才寫 MEMORY.md，否則 skip
- 移除 mempalace MCP 跟 3 個相關 hook
- 刪向量資料庫跟本地儲存

回收：271 MB 磁碟（245 MB uv venv + 26 MB 向量資料），幾分鐘的事。

退役後反而發現 MEMORY.md 的結構在演化：從一層平鋪改成兩層索引，頂層 MEMORY.md 加上 `_index_<topic>.md` 二層分群。本來是為了繞 25KB 上限，結果意外比平鋪好查。

---

## 退役後不到三週，業界方向確認

退役後約 19 天（2026-05-17 寫這篇），同期浮現的幾個 memory 方案方向全部轉向同一條路：

1. **Claude Code 執行檔內藏 `/dream` skill**（ccVersion 2.1.98+），被 kill-switch 擋住未發布。Piebald-AI（`github.com/Piebald-AI/claude-code-system-prompts`，10.1k 星）從編譯後的 npm bundle 驗證了這件事。
2. **Anthropic Dreams API**，進了 Managed Agents Research Preview，beta header `dreaming-2026-04-21`。
3. **OpenClaw Dreaming**（v2026.4.5+），cron + Light/REM/Deep 三階段。
4. **社群 `grandamenium/dream-skill`**（55 星），走 Stop hook + 24 小時條件。

共同方向：**從向量撈取轉向排程式蒸餾整合**。都是「怎麼定期把原始 session 蒸成整理過的片段」，不是「怎麼把更多原始片段塞進向量索引、搜尋時再撈」。

我自己後來用的是 macOS launchd cron 定時跑 `claude -p` 做每日整理，跟 Anthropic 內部設計方向一致。

---

## 要不要裝，先看語料性質

| 查詢類型 | 適合向量？ | 說明 |
|---|---|---|
| 找具體結論 / 實證 | 否 | grep 強項 |
| 跨 session 時間軸聚合 | 否 | 向量死角 |
| 因果 / 為什麼 | 否 | 向量不區分原因跟事實 |
| 環境事實 / 實體名稱 | 否 | grep 強項 |
| 純概念連接（少數） | 有限 | 向量的少數適用場景 |

大部分個人開發流程的查詢屬於前四類。向量真正能用的場景是少數派。

如果把 mining pipeline 改成 LLM 抽取精華片段再存入，那就等於是手工整理 MEMORY.md 在做的事——向量索引多一層，多餘。**整理品質決定結果，不是撈取演算法。**

建議路徑：先把 MEMORY.md 用分群索引結構寫好，不到一個月之後再回頭問自己是不是還需要向量。我的答案是不需要。

供大家參考。
