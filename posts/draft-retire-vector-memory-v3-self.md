---
title: 自建 vector memory 跑一個半月我拔了 — 6/6 grep 完勝 0/6 vector
slug: retire-vector-memory-self
date: 2026-05-17
status: draft (v3 — self flow)
flow: self (voice-profile.md v1 + 自由發揮)
inputs:
  - voice-profile.md v1（我手蒸的）
  - 不用 voice-dna.json
  - 不用 thought-leadership SKILL.md 結構
  - 不用 az9713 output format
---

# 自建 vector memory 跑一個半月我拔了 — 6/6 grep 完勝 0/6 vector

省流：去年底自己蓋了一套 ChromaDB HNSW 本地 vector memory 叫 mempalace，跑了一個半月去看 telemetry——我自己只搜過 3 次、hook 自動寫了 928 次。讀寫比 0.09%。

當場傻眼。

退役前我做最後一次 sanity check，挑 6 個我這陣子真的會問的 query，分別丟給 mempalace MCP 跟直接 grep MEMORY.md，看哪邊撈得到。

| Query | mempalace | grep |
|---|---|---|
| ccstatusline cold start benchmark | 0/3（負相似度） | ✅ |
| extra credits 爆 | 0/3（同名詞跨 domain 撈到無關段） | ✅ |
| 過去一週 project | 0/5（無關 source） | ✅ |
| 為什麼換工具 | 反向命中（撈到不換的紀錄） | ✅ |
| 新 project 命名 | 跨 scope 失準 | ✅ |
| memory 系統演進 | 沾邊但沒結論 | ✅ |

vector 6 個 query 全錯，grep 全對。

不是 HNSW 爛、也不是 ChromaDB 雷——是 corpus 性質本身就 mismatch。

mempalace 灌進去的是 raw session JSONL 切片，沒 distill 過。命中也只是一段對話 context，自帶幻覺，根本沒結論。**反觀**我手寫的 MEMORY.md，每條 entry 都是事後 distill 完的結論濃縮，自帶答案。

dev workflow 的 query 多半含 entity name（套件名 / 工具名 / 專案名）。這種 query 你 keyword grep 一定贏 vector 的語意 embedding——entity 對精確 token 是 grep 天下，**vector 在這場景上找不到就業機會**。

也想過換 hybrid retrieval（Mem0、Memori 那類）但這只解一半。corpus 是 raw session 這件事不會因為 retrieval engine 換而變。要解就得 mining pipeline 改成「LLM 抽取 → 寫精華 chunk」——但那就是 hand-curated memory 本身啊，vector DB 整套變成多餘一層。

curation > retrieval algorithm。

---

拔的方式很乾脆。「強迫我寫 memory」這個 forcing function 保留，但寫進 hand-curated MEMORY.md 結構不是 vector store：

- 加 `~/.claude/hooks/checkpoint-judge.sh` 接管 Stop / PreCompact：「告一段落了嗎？是 → 寫 memory；否 → skip」
- 移除 mempalace MCP + 3 個 mempalace hook
- 刪 `~/.local/share/uv/tools/mempalace/`（245 MB）+ `~/.mempalace/`（26 MB）
- 共回收 271 MB + 4 個 hook config

最近 forcing function 又演化成兩層 index 結構：MEMORY.md（top index）+ `_index_<topic>.md`（cluster sub-index）。cluster 化是為了繞 MEMORY.md 25 KB hard cap，但意外發現比平鋪好 retrieve——entry 多了還是好查。

---

退役 6 週後（5 月中）回頭看業界一輪 memory consolidation 工具浮出來：

- Claude Code binary 內藏 `/dream` skill（ccVersion 2.1.98+，被 kill-switch / KAIROS 擋住未 ship）
- Anthropic Dreams API 進 Managed Agents Research Preview
- OpenClaw Dreaming（v2026.4.5+）走 cron + Light / REM / Deep 三階段
- 社群 `grandamenium/dream-skill` 55★ 走 Stop hook + 24hr

**沒想到**全部主流都從 vector retrieval 改走 cron-based consolidation。

業界沒在優化「怎麼讓 vector 撈更準」——是在優化「怎麼定期把 raw session 蒸餾成 curated chunk」。剛好是我退役 mempalace 後想通的同一件事。

我自己 `social-info/scripts/local-analysis/` 走 launchd cron + `claude -p` daily audit，方向跟 Anthropic 內部設計同向。也算是老問題了。

---

要不要自建個人 vector memory，**先看你 corpus 性質**：

- 找具體實證 / 結論 → grep 領域
- 跨 session 時間軸聚合 → vector 死角
- 因果 / 為什麼 → embedding 對 reason vs fact 沒分別、常**跑偏**
- 環境事實 / entity 查找 → grep 領域
- 純概念連接（少數）→ vector 有點價值

vector 適合的場景在個人 dev workflow 是少數派。把 mining pipeline 改成 LLM 抽精華 chunk = hand-curated memory，vector index 多餘。

省下蓋 vector store 那兩個下午，先把 MEMORY.md 用 cluster index 結構寫好。**一個半月後再回頭問自己需不需要 vector。**

我這邊答案是不需要🤣
