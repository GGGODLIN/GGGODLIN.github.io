---
title: 跑一個半月的向量資料庫 memory 我拔了——整理比演算法重要
slug: retire-vector-memory-zh
date: 2026-05-17
status: draft (v4 — az9713 + anti-Chinglish post-process)
flow: az9713 skill flow + 反晶晶體後處理
based_on: ./draft-retire-vector-memory-v3-az9713.md
fix_log:
  - corpus → 語料
  - algorithm → 演算法
  - curation → 整理 / 蒸餾
  - retrieval → 撈取 / 檢索（保留 RAG 場景）
  - forcing function → 強迫機制
  - consolidation → 蒸餾整合
  - hand-curated → 手蒸 / 手寫整理
  - entity name → 實體名稱
  - default 答案 → 預設答案
  - vector DB → 向量資料庫
  - vector store → 向量資料庫
  - vector search → 向量搜尋
  - raw session → 原始 session（留 session 因為是技術專名）
  - mining pipeline → 挖掘流程
  - keyword grep → 關鍵字 grep
  - retrieval engine → 撈取引擎
---

# 跑一個半月的向量資料庫 memory 我拔了——整理比演算法重要

最近把跑了一個半月的向量資料庫 memory 系統 mempalace 拔了。

省流：6 個 sanity query 對比 mempalace MCP vs grep MEMORY.md，向量 **0/6**、grep **6/6**。HNSW 不是壞、ChromaDB 也不是雷——是 **整理（curation）比撈取演算法重要**這件事，在我自己的語料上被狠狠驗證了一次。

## 我蓋了什麼

mempalace 是我去年底自建的本地向量 memory：

- **後端**：ChromaDB HNSW 跑在 `~/.mempalace/`
- **CLI**：`mempalace status / search / mine / repair`
- **Hook 觸發挖掘**：Claude Code 的 Stop 跟 PreCompact hook 每次 fire 就增量灌 session JSONL 切片進 sessions-only 軟連結目錄
- **MCP server**：給 Claude 直接 query 用

動機很單純：我每天跟 Claude Code 累積大量 session，想要一個撈資料介面把過去的決策、踩坑、結論撈回來。向量搜尋是 LLM 圈過去兩年的預設答案，蕭規曹隨。

啟用後共佔 271 MB（mempalace tool 245 + index 26）+ 4 個 hook config。

## 跑出來是個 dark system

跑了一個半月後我去看監測數據，當場傻眼：

| 指標 | 數字 |
|---|---|
| Drawers（挖進去的 session 片段） | 3456 |
| AUTO-SAVE checkpoint hook 觸發次數 | 928 |
| 真實 `mempalace search` query 次數 | **3** |
| 讀寫比 | **0.09%** |

寫 928 次、讀 3 次。

我以為自己會用，**沒想到**根本沒打開過——hook 自己跑得很勤，撈資料介面我從沒主動觸發。Claude 也沒主動 query，因為它有更直接的方式拿 context（grep MEMORY.md）。

## 6 個 sanity query：向量 0、grep 6

退役前我做最後一次 verify，挑 6 個我這陣子真的會問的 query，分別丟給 mempalace MCP 跟 grep MEMORY.md：

| Query | mempalace MCP | grep MEMORY.md |
|---|---|---|
| ccstatusline cold start benchmark | 0/3（負相似度） | ✅ |
| extra credits 爆 | 0/3（同名詞跨領域撈到無關段） | ✅ |
| 過去一週 project | 0/5（無關來源） | ✅ |
| 為什麼換工具 | 反向命中（撈到不換的紀錄） | ✅ |
| 新 project 命名 | 跨範圍失準 | ✅ |
| memory 系統演進 | 沾邊但沒結論 | ✅ |

不是「向量命中率比較低」——**是向量沒一個答對**。同樣 query，grep 6/6 完勝。

## 整理比演算法重要

冷靜分析，問題不在 HNSW、也不在嵌入模型，**而在語料本身**：

- **mempalace drawers** = 原始 session 對話片段，沒整理過，命中也只是一段沒結論的上下文片段——典型的「**幻覺滿天飛**」
- **MEMORY.md entries** = 我手寫的「結論濃縮」，自帶答案

手寫整理的 memory 同時贏兩層：

1. **撈取層**：dev workflow 的 query 多含實體名稱（套件名 / 工具名 / 專案名），關鍵字 grep 對精確字串比向量強——這是實體查找的天下，**向量在這場景上找不到就業機會**
2. **內容層**：每條 entry 是手動蒸過的 summary，不是原始對話

**反觀**換 hybrid 撈取引擎（Mem0、Memori 那類）也救不了——hybrid 只解撈取那一半問題，語料是原始 session 這件事改不掉。除非挖掘流程改成「LLM 抽精華片段」——但那就是現在手寫整理 memory 本身在做的事，向量資料庫變成多餘一層。

**貴的東西，唯一的問題就只有貴而已。** mempalace 不貴，但它**撐不起**我這語料的 query pattern。

## 拔的方式：保留強迫機制換實作

採 Path 3：「強迫我寫 memory」這件事保留，但寫到手寫整理的結構而不是向量資料庫。

- 加 `~/.claude/hooks/checkpoint-judge.sh`：Stop 跟 PreCompact 時 inject prompt 問「告一段落了嗎？是 → 寫 memory；否 → skip」
- 移除 mempalace MCP + 3 個 mempalace hook
- 刪 `~/.local/share/uv/tools/mempalace/` (245 MB) + `~/.mempalace/` (26 MB)

共回收 271 MB 磁碟 + 4 個 hook config。強迫機制演化成兩層 index 結構（MEMORY.md + `_index_<topic>.md` cluster），不是向量資料庫。

## 業界 6 週後印證同方向

退役 6 週後（2026-05 中）我重看 memory 蒸餾整合圈的動向：

| 方案 | 觸發 | 走向 |
|---|---|---|
| Claude Code 內藏 `/dream` skill（ccVersion 2.1.98+） | cron 排程（被 kill-switch 擋住未 ship） | 蒸餾整合 |
| Anthropic Dreams API（Managed Agents Research Preview） | cron 排程 | 蒸餾整合 |
| OpenClaw Dreaming（v2026.4.5+） | cron + Light/REM/Deep 三階段 | 蒸餾整合 |
| `grandamenium/dream-skill`（社群 55★） | Stop hook + 24 小時 | 蒸餾整合 |

**終究是**主流從向量撈取改走 cron 排程式蒸餾整合。

業界沒在優化「怎麼讓向量撈得更準」，而是優化「怎麼定期把原始 session 蒸餾成整理過的片段」——剛好是我退役 mempalace 後得到的同一個結論：**整理比撈取演算法重要**。我自己的 `social-info/scripts/local-analysis/` 走 launchd cron + `claude -p` daily 跑 audit，方向跟 Anthropic 內部設計、OpenClaw 主流一致。也算是老問題了。

## 你的語料適不適合向量？

不是向量資料庫不好，是「把原始 session 當語料餵給向量資料庫」這件事，在個人 dev workflow 上不適配。

| Query 類型 | grep 強還是向量強 |
|---|---|
| 找具體實證 / 結論 | grep |
| 跨 session 時間軸聚合 | 向量死角 |
| 因果 / 為什麼 | 嵌入對「為什麼」跟「事實」沒分別——常常**跑偏** |
| 環境事實 / 實體查找 | grep |
| 概念連接 | 向量有部分價值 |

向量適合的「語意模糊比對」「概念連接」在我 query pattern 裡只佔少數。

把挖掘流程改成「LLM 抽精華片段」就是直接寫手蒸 memory，向量索引是多餘一層。

如果你也想自建個人 memory，**先確認語料是不是原始 session、query 是不是含實體名稱**。是的話，省下蓋向量資料庫的兩個下午，先把 MEMORY.md 用 cluster index 結構寫好。一個半月後再回頭看你需不需要向量。

我這邊的答案是不需要，選自己喜歡的就好🤣

---

KEY TAKEAWAYS:
1. **向量資料庫退役不是技術問題，是語料問題**——原始 session 當語料餵向量資料庫，撈取跟內容兩層都輸給手寫整理的 MEMORY.md
2. **整理比撈取演算法重要**——HNSW 是業界標準但解決不了「沒蒸過的片段撈出來也沒答案」這件事
3. **業界 2026-05 已轉 cron 排程蒸餾整合**（CC 內藏 dream / Anthropic Dreams API / OpenClaw / dream-skill）印證同方向；個人 setup 的 daily routine + 手寫整理 MEMORY.md 已走在主流前面

SUGGESTED SOCIAL SNIPPETS:
- 「6 個 sanity query，mempalace MCP 拿到 0/6，grep 拿 6/6。HNSW 不是壞，是整理比演算法重要。」
- 「讀寫比 = 0.09%。寫 928 次、讀 3 次。我自建的向量 memory 是個 dark system。」
- 「業界 2026-05 改走 cron 排程蒸餾整合，不是向量撈取。終究是整理比演算法重要。」
