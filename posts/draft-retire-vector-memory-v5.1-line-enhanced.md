---
title: 自建向量 memory 跑一個半月我拔了 — 6/6 grep 完勝 0/6 vector
slug: retire-vector-memory
date: 2026-05-17
status: experimental-failed (2026-05-17 — user verdict「整體看起來 5.1 沒有比較好，新增的小故事都有點尷尬，看來 V5 那套就夠了」；保留為 anti-pattern reference 不刪)
based_on: ./draft-retire-vector-memory-v5-self-zh.md
enhance_strategy: 從 style/voice-profile-line.md register A 借 5 個 marker，surgical patch 不重寫整篇
enhance_log:
  - patch 1: 「灌進去的是原始 session JSONL 切片，沒整理過」後加比喻「跟把整本筆記本影印件全部塞進搜尋框沒兩樣」（LINE 比喻教學 109 次 marker）
  - patch 2: 「向量在這場景上找不到就業機會」→「向量在這場景吃力不討好，連到底要撈關鍵字還是撈意境都不知道」（LINE 工具擬人化 + 一句斷論）
  - patch 3: 「向量整套變成多餘一層」→ 加「現成的菜不吃，在那邊研究新鍋具」生活比喻（LINE register A 日常比喻 marker）
  - patch 4: 「我自己」→「我這邊」（LINE 核心 marker，全年 83 次）
  - patch 5: 結尾加 callback「反正讀寫比 0.09% 這事我這邊已經幫你試過了」（LINE register A 自指反差 marker）
anti_patterns_avoided:
  - 沒髒話發語（幹/操/靠/媽的）
  - 沒連發爆量斷行
  - 沒 484 / = = / @@ 文字 emoticon
  - 沒 @ 互動
  - 沒群內梗 / 性自爆 / 政治嗆人
保留英文（技術專名沒中文對應）:
  - HNSW / ChromaDB / MCP / Hook / JSONL / CLI / cron / launchd / kill-switch / KAIROS / Stop / PreCompact / token / inject / session / query / drawer / mempalace / Claude Code / Anthropic Dreams API / OpenClaw / GLM / mempalace
---

# 自建向量 memory 跑一個半月我拔了 — 6/6 grep 完勝 0/6 vector

省流：去年底自己蓋了一套 ChromaDB HNSW 本地向量 memory 叫 mempalace，跑了一個半月去看統計——我自己只搜過 3 次、hook 自動寫了 928 次。讀寫比 0.09%。

當場傻眼。

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

mempalace 灌進去的是原始 session JSONL 切片，沒整理過。**這跟把整本筆記本影印件全部塞進搜尋框沒兩樣**——命中是有，每段都還是當下的雜訊，自帶幻覺，根本沒結論。**反觀**我手寫的 MEMORY.md，每條 entry 都是事後蒸過的結論濃縮，自帶答案。

開發工作的 query 多半含實體名稱（套件名 / 工具名 / 專案名）。這種 query 你關鍵字 grep 一定贏向量的語意比對——實體查找是 grep 天下，**向量在這場景吃力不討好，連到底要撈關鍵字還是撈意境都不知道**。

也想過換混合撈取（Mem0、Memori 那類）但這只解一半。語料是原始 session 這件事不會因為撈取引擎換而變。要解就得改挖掘流程，把灌進去的內容變成「LLM 抽精華片段」——但那就是手寫整理 memory 本身啊，**現成的菜不吃，在那邊研究新鍋具**，向量這層純粹是多繞一圈。

整理比撈取演算法重要。

---

拔的方式很乾脆。「強迫我寫 memory」這個強迫機制保留，但寫進手寫整理的 MEMORY.md 結構不是向量資料庫：

- 加 `~/.claude/hooks/checkpoint-judge.sh` 接管 Stop / PreCompact：「告一段落了嗎？是 → 寫 memory；否 → skip」
- 移除 mempalace MCP + 3 個 mempalace hook
- 刪 `~/.local/share/uv/tools/mempalace/`（245 MB）+ `~/.mempalace/`（26 MB）
- 共回收 271 MB + 4 個 hook config

最近強迫機制又演化成兩層 index 結構：MEMORY.md（頂層）+ `_index_<topic>.md`（cluster 二層）。Cluster 化原本是為了繞 MEMORY.md 25 KB hard cap，意外發現比平鋪好查——entry 多了還是好撈。

---

退役 6 週後（5 月中）回頭看業界一輪 memory 蒸餾整合工具浮出來：

- Claude Code binary 內藏 `/dream` skill（ccVersion 2.1.98+，被 kill-switch / KAIROS 擋住未 ship）
- Anthropic Dreams API 進 Managed Agents Research Preview
- OpenClaw Dreaming（v2026.4.5+）走 cron + Light / REM / Deep 三階段
- 社群 `grandamenium/dream-skill` 55★ 走 Stop hook + 24 小時

**沒想到**全部主流都從向量撈取改走排程式蒸餾整合。

業界沒在優化「怎麼讓向量撈更準」——是在優化「怎麼定期把原始 session 蒸成整理過的片段」。剛好是我退役 mempalace 後想通的同一件事。

**我這邊** `social-info/scripts/local-analysis/` 走 launchd cron + `claude -p` 每日跑檢查，方向跟 Anthropic 內部設計同向。也算是老問題了。

---

要不要自建個人向量 memory，**先看你語料性質**：

- 找具體實證 / 結論 → grep 領域
- 跨 session 時間軸聚合 → 向量死角
- 因果 / 為什麼 → 嵌入對「為什麼」跟「事實」沒分別、常**跑偏**
- 環境事實 / 實體查找 → grep 領域
- 純概念連接（少數）→ 向量有點價值

向量適合的場景在個人開發流程是少數派。把挖掘流程改成 LLM 抽精華片段 = 手蒸 memory，向量索引多餘。

省下蓋向量資料庫那兩個下午，先把 MEMORY.md 用 cluster index 結構寫好。**反正讀寫比 0.09% 這事我這邊已經幫你試過了**——一個半月後再回頭問自己需不需要向量。

我這邊答案是不需要🤣
