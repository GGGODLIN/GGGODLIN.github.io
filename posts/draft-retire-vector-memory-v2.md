---
title: 跑一個半月的 vector DB memory 我拔了——grep 在我 corpus 上 6/6 完勝
slug: retire-vector-memory
date: 2026-05-17
status: draft (v2 — voice-dna calibrated)
type: thought-leadership / perspective-piece
target_length: 1200
tags: [memory, vector-db, claude-code, retrospective]
voice_dna: ../context/voice-dna.json
sources:
  - ~/.claude/wiki/mempalace.md
  - ~/.claude/projects/-Users-linhancheng-Desktop-projects/memory/_index_auto_memory.md
  - ~/.claude/projects/-Users-linhancheng-Desktop-projects/memory/reference_dream_ecosystem_2026_05_12.md
v1_compared_to: ./draft-retire-vector-memory.md
---

最近把跑了一個半月的 vector DB memory 系統 mempalace 拔了。

省流：6 個 sanity query，vector 0/6，grep 6/6。HNSW 不是壞，是 **curation 比 algorithm 重要**這件事，在我自己的 corpus 上被狠狠驗證了一次。

## 我蓋了什麼

mempalace 是我去年底自建的本地 vector memory：

- **後端**：ChromaDB HNSW 跑在 `~/.mempalace/`
- **CLI**：`mempalace status / search / mine / repair`
- **Hook-driven mining**：Claude Code 的 Stop 跟 PreCompact hook 每次 fire 就增量灌 session JSONL 切片進 sessions-only 軟連結目錄
- **MCP server**：給 Claude 直接 query 用

動機很單純：我每天跟 Claude Code 累積大量 session，想要一個 retrieval 介面把過去的決策、踩坑、結論撈回來。Vector search 是 LLM 圈過去兩年的 default 答案，蕭規曹隨。

啟用後共佔 271 MB（mempalace tool 245 + index 26）+ 4 個 hook config。

## 跑出來是個 dark system

跑了一個半月後我去看 telemetry：

| 指標 | 數字 |
|---|---|
| Drawers（mine 進去的 session 片段） | 3456 |
| AUTO-SAVE checkpoint hook inject 次數 | 928 |
| 真實 `mempalace search` query 次數 | **3** |
| Read:Write 比 | **0.09%** |

寫 928 次、讀 3 次。

我以為自己會用，結果根本沒打開過——hook 自己跑得很勤，retrieval 介面我從沒主動觸發。Claude 也沒主動 query，因為它有更直接的方式拿 context（grep MEMORY.md）。

## 6 個 sanity query：vector 0、grep 6

退役前我做最後一次 verify，挑 6 個我這陣子真的會問的 query，分別丟給 mempalace MCP 跟 grep MEMORY.md：

| Query | mempalace MCP | grep MEMORY.md |
|---|---|---|
| ccstatusline cold start benchmark | 0/3（負相似度） | ✅ |
| extra credits 爆 | 0/3（同名詞跨 domain 撈到無關段） | ✅ |
| 過去一週 project | 0/5（無關 source） | ✅ |
| 為什麼換工具 | 反向命中（撈到不換的紀錄） | ✅ |
| 新 project 命名 | 跨 scope 失準 | ✅ |
| memory 系統演進 | 沾邊但沒結論 | ✅ |

不是「vector 命中率比較低」——是 **vector 沒一個答對**。

## Curation 比 algorithm 重要

冷靜分析，問題不在 HNSW、也不在 embedding model，**而在 corpus 本身**：

- **mempalace drawers** = raw session 對話片段，沒 curation，命中也只是一段沒結論的 context snippet
- **MEMORY.md entries** = 我手寫的「結論濃縮」，自帶答案

File-based hand-curated memory 同時贏兩層：

1. **Retrieval 層**：dev workflow 的 query 多含 entity name（套件名 / 工具名 / 專案名），keyword grep 對精確 token 比 vector 強
2. **Content 層**：每條 entry 是手動 distill 過的 summary，不是 raw transcript

我也想過換 hybrid retrieval（Mem0、Memori 那類）。但 hybrid 只解 retrieval 那一半問題——**corpus 是 raw session 這件事改不掉**。除非 mining pipeline 改成「LLM 抽取 → 寫精華 chunk」，但那就是我現在 hand-curated memory 本身在做的事，vector DB 變成多餘一層。

## 拔的方式：保留 forcing function 換實作

採 Path 3：「強迫我寫 memory」這件事保留，但寫到 hand-curated 結構而不是 vector store。

- 加 `~/.claude/hooks/checkpoint-judge.sh`：Stop 跟 PreCompact 時 inject prompt 問「告一段落了嗎？是 → 寫 memory；否 → skip」
- 移除 mempalace MCP + 3 個 mempalace hook
- 刪 `~/.local/share/uv/tools/mempalace/` (245 MB) + `~/.mempalace/` (26 MB)

共回收 271 MB 磁碟 + 4 個 hook config。Forcing function 演化成兩層 index 結構（MEMORY.md + `_index_<topic>.md` cluster），不是 vector store。

## 業界 6 週後印證同方向

退役 6 週後（2026-05 中）我重看 memory consolidation 圈動向：

| 方案 | 觸發 | 走向 |
|---|---|---|
| Claude Code 內藏 `/dream` skill（ccVersion 2.1.98+） | cron-based（被 kill-switch 擋住未 ship） | consolidation |
| Anthropic Dreams API（Managed Agents Research Preview） | cron | consolidation |
| OpenClaw Dreaming（v2026.4.5+） | cron + Light/REM/Deep 三階段 | consolidation |
| `grandamenium/dream-skill`（社群 55★） | Stop hook + 24hr | consolidation |

主流**從 vector retrieval 改走 cron-based consolidation**。

意思是業界沒在優化「怎麼讓 vector 撈得更準」，而是優化「怎麼定期把 raw session 蒸餾成 curated chunk」——剛好是我退役 mempalace 後得到的同一個結論：**curation > retrieval algorithm**。

我自己的 `social-info/scripts/local-analysis/` 走 launchd cron + `claude -p` daily 跑 audit，方向跟 Anthropic 內部設計、OpenClaw 主流一致。也算是老問題了。

## 你的 corpus 適不適合 vector？

不是 vector DB 不好，是「**把 raw session 當 corpus 餵給 vector DB**」這件事，在個人 dev workflow 上不適配。

| Query 類型 | grep 強還是 vector 強 |
|---|---|
| 找具體實證 / 結論 | grep |
| 跨 session 時間軸聚合 | vector 死角 |
| 因果 / 為什麼 | embedding 對 reason vs fact 沒分別 |
| 環境事實 / entity 查找 | grep |
| 概念連接 | vector 有部分價值 |

Vector 適合的「語意模糊比對」「概念連接」在我 query pattern 裡只佔少數。

把 mining pipeline 改成「LLM 抽取 → curated chunk」就是直接寫 hand-curated memory，vector index 是多餘一層。

如果你也想自建個人 memory，**先確認 corpus 是不是 raw session、query 是不是含 entity name**。是的話，省下蓋 vector store 的兩個下午，先把 MEMORY.md 用 cluster index 結構寫好。一個半月後再回頭看你需不需要 vector。

我這邊的答案是不需要，選自己喜歡的就好🤣
