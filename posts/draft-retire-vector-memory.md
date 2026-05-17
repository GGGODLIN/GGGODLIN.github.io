---
title: 跑一個半月的 vector DB memory 我拔了——6/6 grep 完勝 vector
slug: retire-vector-memory
date: 2026-05-17
status: draft
tags: [memory, vector-db, claude-code, retrospective]
sources:
  - ~/.claude/wiki/mempalace.md
  - ~/.claude/projects/-Users-linhancheng-Desktop-projects/memory/reference_mempalace_read_write_imbalance.md
  - ~/.claude/projects/-Users-linhancheng-Desktop-projects/memory/_index_auto_memory.md
  - ~/.claude/projects/-Users-linhancheng-Desktop-projects/memory/reference_dream_ecosystem_2026_05_12.md
---

2026-04-28，我把跑了一個半月的 vector DB memory 系統 mempalace 拔了。

理由是 6 query sanity test，vector 0/6，grep 6/6。

不是 retrieval engine 不好——HNSW 是業界標準。是 **curation 比 algorithm 重要**這件事，在我自己的 corpus 上被狠狠驗證了一次。

## 我蓋了什麼

mempalace 是我自建的本地 vector DB memory：

- **後端**：ChromaDB HNSW 跑在 `~/.mempalace/`
- **CLI**：`mempalace status / search / mine / repair`
- **Hook-driven mining**：Claude Code Stop 跟 PreCompact hook 觸發，把 session JSONL 切片增量灌進 sessions-only 軟連結目錄
- **MCP server**：給 Claude 直接 query 用

設計動機很單純：我每天跟 Claude Code 累積大量 session，想要一個 retrieval 介面把過去的決策、踩坑、結論撈回來。Vector search 是 LLM 圈過去兩年的 default 答案，跟著做。

啟用後共佔磁碟 271 MB（mempalace tool 245 MB + index 26 MB），hook 配 4 個。

## 跑出來的 dark system

跑了一個半月後我去看 telemetry：

| 指標 | 數字 |
|---|---|
| Drawers（被 mine 進去的 session 片段）| 3456 |
| AUTO-SAVE checkpoint hook inject 次數 | 928 |
| 真實 `mempalace search` query 次數 | **3** |
| Read:Write 比 | **0.09%** |

寫了 928 次、讀了 3 次。

我本來以為自己會用，結果根本沒打開過——hook 自己跑得很勤，retrieval 介面我從沒主動觸發。Claude 也沒主動 query，因為它有更直接的方式拿 context（直接 grep MEMORY.md）。

## 6/6 sanity test

退役前我做最後一次 verify，挑 6 個我這陣子真的會問的 query，分別丟給 mempalace MCP 跟直接 grep MEMORY.md：

| Query | mempalace MCP | grep MEMORY.md |
|---|---|---|
| ccstatusline cold start benchmark | 0/3（負相似度） | ✅ |
| extra credits 爆 | 0/3（同名詞跨 domain 撈到無關段） | ✅ |
| 過去一週 project | 0/5（無關 source） | ✅ |
| 為什麼換工具 | 反向命中（撈到不換的紀錄） | ✅ |
| 新 project 命名 | 跨 scope 失準 | ✅ |
| memory 系統演進 | 沾邊但沒結論 | ✅ |

**Vector 0/6，grep 6/6**。

不是「vector 命中率比較低」，是「vector 沒一個答對」。

## Root cause：corpus 性質，不是 algorithm

冷靜分析後，問題不在 HNSW、也不在 embedding model，而在 **corpus 本身**：

- **mempalace drawers** = raw session 對話片段，沒 curation，命中也只是一段沒結論的對話 context
- **MEMORY.md entries** = 我手寫的「結論濃縮」，自帶答案

File-based hand-curated memory 同時贏兩層：

1. **Retrieval 層**：dev workflow 的 query 多含 entity name（套件名 / 工具名 / 專案名），keyword grep 對精確 token 比 vector 強
2. **Content 層**：每條 entry 是手動 distill 過的 summary，不是 raw transcript

當時我也想過換 hybrid retrieval（Mem0、Memori 那類）。但 hybrid 只解 retrieval 那一半問題——corpus 是 raw session 這件事改不掉。**除非 mining pipeline 改成「LLM 抽取 → 寫精華 chunk」，但那就是我現在 hand-curated memory 本身在做的事**，vector DB 變成多餘一層。

## 拔的方式

採 Path 3：保留 forcing function、換掉實作。

- 加 `~/.claude/hooks/checkpoint-judge.sh`：Stop 跟 PreCompact 時 inject prompt 問「告一段落了嗎？是 → 寫 memory；否 → skip」
- 移除 mempalace MCP + Stop / PreCompact 三個 mempalace hook
- 刪 `~/.local/share/uv/tools/mempalace/`（245 MB）+ `~/.mempalace/`（26 MB）
- 共回收 271 MB 磁碟 + 4 個 hook config

「強迫我寫 memory」這件事保留了，但寫到 hand-curated MEMORY.md 結構（後來演化成 cluster 兩層 index），而不是 vector store。

## 業界一個月後的對照

退役 6 週後（2026-05 中）我重看 memory consolidation 圈的動向：

- **Claude Code binary 已內藏 `/dream` skill**（ccVersion 2.1.98+，被 kill-switch / KAIROS 擋住未 ship）
- **Anthropic Dreams API**（Managed Agents Research Preview）——設計原則「input store 不修改 / output 另存 separate store / optional sessions input mining」
- **OpenClaw Dreaming**（v2026.4.5+）——cron + Light / REM / Deep 三階段 + Dream Diary
- **`grandamenium/dream-skill`**（社群 55★）——Stop hook + 24hr 條件

主流方向**從 vector retrieval 改走 cron-based consolidation**。

也就是說，業界沒有在優化「怎麼讓 vector 撈得更準」，而是在優化「怎麼定期把 raw session 蒸餾成 curated chunk」——剛好是我退役 mempalace 後得到的同一個結論：**curation > retrieval algorithm**。

我自己的 `social-info/scripts/local-analysis/` 走 launchd cron + `claude -p` daily 跑 audit，方向跟 Anthropic 內部設計、OpenClaw 主流一致。

## Takeaway

不是 vector DB 不好。

是「**把 raw session 當 corpus 餵給 vector DB**」這件事，在個人 dev workflow 上不適配：

- 大部分查詢是「找具體實證 / 結論」——grep 領域
- 跨 session 時間軸聚合——vector 死角
- 因果 / 為什麼——embedding 對 reason vs fact 沒分別
- 環境事實 / entity 查找——grep 領域

Vector 適合的「概念連接」「語意模糊比對」在我的 query pattern 裡只佔少數。

把 mining pipeline 改成「LLM 抽取 → curated chunk」就是直接寫 hand-curated memory，vector index 是多餘一層。

如果你也想自建個人 memory 系統，**先確認你的 corpus 是不是 raw session、你的 query 是不是含 entity name**。是的話，省下蓋 vector store 的兩個下午，先把 MEMORY.md 用 cluster index 結構寫好。一個半月後再回頭看你需不需要 vector。

我這邊的答案是不需要。
