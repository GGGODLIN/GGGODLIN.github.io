---
title: 自建向量 memory 跑不到一個月我拔了 — 6/6 grep 完勝 0/6 vector
slug: retire-vector-memory
date: 2026-05-17
status: v5.2 fact-corrected + 反晶晶體 sweep (2026-05-17 — 4 處 user feedback 修 + 13 處該翻沒翻的英文詞修；待 user review)
based_on: ./draft-retire-vector-memory-v5-self-zh.md
enhance_log:
  - patch 1 [feedback #1 / hallucination 修]: 「自己蓋了一套 ChromaDB HNSW 本地向量 memory 叫 mempalace」→「裝了 Milla Jovovich + Ben Sigman 開源的 mempalace」+ github URL；user 真實角色是早期使用者 + hook 整合 + 寫 symlink script 解 84GB 膨脹，不是自製
  - patch 1b [feedback #1 時間修]: 「去年底」→「2026 年 4 月」（mempalace 4/7 才 ship）；「跑了一個半月」→「跑了不到一個月」（實際 2-3 週）；「退役 6 週後」→「退役後不到三週」（04-28 退役距今天 05-17 是 19 天）
  - patch 2 [feedback #2 alternatives]: 補阿里 ReMe 那條 path 一段（同方向確認，連 MEMORY.md 檔名都跟手寫的一樣，發現自己已在跑 ReMe 的「人工版」）
  - patch 3 [feedback #3 cross-post rule]: 全 post 抽象化具體路徑（拔 hooks bullet / social-info 路徑等），按 feedback_blog_writing_no_overspecific_paths_2026_05_17 對照表
  - patch 4 [feedback #4 心得風]: 新增 Cursor backstory 段「為什麼會跑去裝 vector memory」— 採 Agent Y partially confirmed narrative（Cursor 爆紅靠 AI 真懂整個 repo / 底層是 vector embedding 但反正能 work）；不教學介紹技術
保留英文（技術專名沒中文對應）:
  - HNSW / ChromaDB / MCP / Hook / JSONL / CLI / cron / launchd / kill-switch / KAIROS / Stop / PreCompact / token / inject / session / query / mempalace / Claude Code / Anthropic Dreams API / OpenClaw / Cursor / GitHub / star / RAG / vector / embedding / LongMemEval / R@5 / Mem0 / Memori / ReMe
---

# 自建向量 memory 跑不到一個月我拔了 — 6/6 grep 完勝 0/6 vector

省流：2026 年 4 月看到 Milla Jovovich + Ben Sigman 的 [mempalace](https://github.com/MemPalace/mempalace) 一上線就裝了，配了 Stop / PreCompact 兩個 hook 自動寫 memory，跑了不到一個月去看統計——我自己只搜過 3 次、hook 自動寫了 928 次。讀寫比 0.09%。

當場傻眼。

---

往回說一點。2023 年 Cursor 爆紅，靠的是「AI 第一次真的懂整個 repo」——你問它「auth 邏輯在哪」它能跨檔回答你。底層就是 vector embedding，但反正能用。Cursor 之後一堆人開始把 RAG / 向量資料庫 抓進個人工作流，想複製那個「AI 懂我」的體感。

我也是。Claude Code memory 系統一直有點不夠用。mempalace 一上線好萊塢跨界 AI 開源這事自帶話題、本地跑、原文照存、LongMemEval 96.6% R@5——看起來剛好是 Claude Code memory 的下一塊拼圖，star 數短短幾週衝到 5 萬。我又寫了個 symlink script 解掉 Claude Code 整個 session 目錄被掃進去導致儲存量膨脹到 84GB 的問題。

退役前做最後一次核對，挑 6 個我這陣子真的會問的 query，分別丟給 mempalace MCP 跟直接 grep MEMORY.md，看哪邊撈得到。

| Query | mempalace | grep |
|---|---|---|
| ccstatusline cold start benchmark | 0/3（負相似度） | ✅ |
| extra credits 爆 | 0/3（同名詞跨領域撈到無關段） | ✅ |
| 過去一週 project | 0/5（無關來源） | ✅ |
| 為什麼換工具 | 反向命中（撈到不換的紀錄） | ✅ |
| 新 project 命名 | 跨範圍失準 | ✅ |
| memory 系統演進 | 沾邊但沒結論 | ✅ |

向量 6 個 query 全錯，grep 全對。

不是 HNSW 爛、也不是 ChromaDB 雷——是語料性質本身就不對盤。

mempalace 灌進去的是原始 session JSONL 切片，沒整理過。命中也只是一段對話內容，自帶幻覺，根本沒結論。**反觀**我手寫的 MEMORY.md，每條都是事後蒸過的結論濃縮，自帶答案。

開發工作的 query 多半含實體名稱（套件名 / 工具名 / 專案名）。這種 query 你關鍵字 grep 一定贏向量的語意比對——實體查找是 grep 天下，**向量在這場景上找不到就業機會**。

也想過換混合撈取（Mem0、Memori 那類），甚至看了阿里的 ReMe——但這只解一半。語料是原始 session 這件事不會因為撈取引擎換而變。要解就得改挖掘流程，把灌進去的內容變成「LLM 抽精華片段」——但那就是手寫整理 memory 本身啊，向量整套變成多餘一層。

ReMe 那條路線比較有意思，它直接走檔案系統，連 MEMORY.md 檔名都跟我手寫的一樣，6 欄位（Goal / Constraints / Progress / Key Decisions / Next Steps / Critical Context）。看完發現我這邊已經在跑 ReMe 的「人工版」了。

整理比撈取演算法重要。

---

拔的方式很乾脆。「強迫我寫 memory」這個強迫機制保留，但寫進手寫整理的 MEMORY.md 結構不是向量資料庫：

- 寫一個 hook 接管 session 結束 + compact 前事件：「告一段落了嗎？是 → 寫 memory；否 → skip」
- 移除 mempalace MCP + 3 個相關 hook
- 刪整套向量資料庫 + 本地儲存（共 271 MB）

回收 271 MB + 4 個 hook 設定，幾分鐘的事。

最近強迫機制又演化成兩層 index 結構：MEMORY.md（頂層）+ `_index_<topic>.md`（cluster 二層）。Cluster 化原本是為了繞 MEMORY.md 25 KB 硬上限，意外發現比平鋪好查——條目多了還是好撈。

---

退役後不到三週（5 月中）回頭看業界一輪 memory 蒸餾整合工具浮出來：

- Claude Code 執行檔內藏 `/dream` skill（ccVersion 2.1.98+，被 kill-switch / KAIROS 擋住未發布）
- Anthropic Dreams API 進 Managed Agents Research Preview
- OpenClaw Dreaming（v2026.4.5+）走 cron + Light / REM / Deep 三階段
- 社群 `grandamenium/dream-skill` 55★ 走 Stop hook + 24 小時

**沒想到**全部主流都從向量撈取改走排程式蒸餾整合。

業界沒在優化「怎麼讓向量撈更準」——是在優化「怎麼定期把原始 session 蒸成整理過的片段」。剛好是我退役 mempalace 後想通的同一件事。

我自己 macOS launchd cron + `claude -p` 每日跑檢查，方向跟 Anthropic 內部設計同向。也算是老問題了。

---

要不要自建個人向量 memory，**先看你語料性質**：

- 找具體實證 / 結論 → grep 領域
- 跨 session 時間軸聚合 → 向量死角
- 因果 / 為什麼 → 嵌入對「為什麼」跟「事實」沒分別、常**跑偏**
- 環境事實 / 實體查找 → grep 領域
- 純概念連接（少數）→ 向量有點價值

向量適合的場景在個人開發流程是少數派。把挖掘流程改成 LLM 抽精華片段 = 手蒸 memory，向量索引多餘。

省下蓋向量資料庫那兩個下午，先把 MEMORY.md 用 cluster index 結構寫好。**不到一個月後再回頭問自己需不需要向量。**

我這邊答案是不需要🤣
