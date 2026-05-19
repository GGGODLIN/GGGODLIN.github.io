---
title: "個人 wiki 搭建——跟著 Karpathy 的 LLM-wiki 慣例做之後的取捨：他的 wiki 範例不夠，蒸餾才是真正的關鍵"
description: "從 Karpathy LLM-wiki gist 出發，不到一個月的密集迭代後發現：決定個人知識管理系統是否有效的關鍵，不是向量資料庫或架構層數，而是有沒有把原始對話材料整理成濃縮可用的結論。"
voice: pure-ai-baseline
status: 純 AI 校稿版（Phase 1.5，從 MATERIAL 寫，無 voice）
source: posts/personal-wiki-distill-MATERIAL.md
---

## 起點：Karpathy 的 LLM-wiki gist

2026 年 4 月 4 日，Andrej Karpathy 發布了一份 LLM-wiki gist（`https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f`），描述一種把個人知識整理成 wiki entity、供 LLM 在 context 中存取的管理方式。gist 公布後一個月內，社群冒出超過 20 個衍生實作（截至 2026-04-23）。

Karpathy 自己的 raw 語料規模約 100 篇文章、40 萬字。我個人累積的原始對話記錄在 2026-04-23 啟動時已達 141 個 JSONL 檔、上百萬字——規模差異意味著直接照搬原典，架構設計的壓力不同。

採用時建立了四層架構：`原始語料 → MemPalace（向量層）→ wiki → CLAUDE.md`。

---

## 向量層：大量寫入，幾乎不讀取

向量層（MemPalace）以 ChromaDB HNSW 加 knowledge graph SQLite 實作，並設置了 AUTO-SAVE checkpoint hook，讓每次對話結束時自動把對話片段存進去。

試用期為 2026-04-23 到 2026-04-28，共五天。

這段期間的數字：
- hook 自動寫入：928 次
- drawers 累積：從 2775 增長到 3456
- 真實主動查詢：**3 次**（查詢主題分別是 cmux、TanStack Start、session 備份 github）
- 搜尋／drawer 比：3 ÷ 3429 = **0.09%**

系統每天持續運轉，資料也確實在累積，但幾乎沒有被實際查詢的機會。

---

## 決定性實驗：向量搜尋 0/6，手工 grep 6/6

2026-04-28，啟用 MCP 接口後進行了一組 6 題對照驗證：

| 查詢 | 向量結果 | grep MEMORY.md 結果 |
|---|---|---|
| ccstatusline cold start benchmark | 負相似度 | 直接命中 |
| extra credits 爆 | 0/3 同名詞跨 domain 失準 | 直接命中 |
| 過去一週 project | 0/5 無關 source | 直接命中 |
| 為什麼換工具 | 反向命中 | 直接命中 |
| 新 project 命名 | 跨 scope 失準 | 直接命中 |
| memory 系統演進 | 沾邊沒結論 | 直接命中 |

結果：向量 0/6，grep 6/6。

這段向量退役的完整論證見另一篇，本文只標時點：2026-04-28 執行退役，回收 245 MB 工具 + 26 MB 資料 = 271 MB 磁碟空間，並移除 4 個 hook config。

---

## 失敗的根本原因：整理的有無，不是演算法的好壞

事後分析：向量搜尋失敗的原因不是 ChromaDB 引擎的問題。

Drawers 裡存的是**原始對話片段**——當下話語的逐字記錄，沒有整理、沒有歸納。MEMORY.md 裡的條目是**手工濃縮的結論**——已經過人工提取出關鍵資訊、用可直接引用的格式寫下來。

從 8 大查詢類型來看，7/8 的情況下向量搜尋都不如手工 grep：具體結論查找、跨 session 時間軸、因果推理、反向痛點、偏好風格、知識點細節、環境事實，這些場景都是 grep 勝出。唯一沾邊的是概念連接類查詢。

評估過引入 Mem0、Memori 等混合搜尋方案，但結論是：混合搜尋只解決了「檢索演算法」那一半問題。語料本身是原始 session 對話這件事改不掉，除非改成用 LLM 抽取後寫精華——但那等於直接在做手工記憶的工作，向量資料庫只是變成多餘的一層。

---

## forcing function：退役後保留的概念

向量層退役，但「強迫機制（forcing function）」的概念保留下來，改由 `checkpoint-judge.sh` 實現：在每次對話的 Stop 或 PreCompact 事件時，注入 prompt 讓 Claude 判斷「這段對話告一段落了嗎？是→寫記憶；否→略過」。

關於業界趨勢，截至 2026-05-13 的社群觀察：Claude Code binary 內藏 `/dream` skill（ccVersion 2.1.98+）、Anthropic Dreams API、OpenClaw Dreaming，以及各種以 cron 定期執行蒸餾的做法，方向都是「定期蒸餾原始 session」而非「優化向量搜尋的準確率」。這與從實作中得出的「整理優先於演算法」結論同向。以上為社群觀察，未外部驗證。

---

## 採用 wiki pattern：四個社群實作的取捨

向量層退役後，依 Karpathy 原典建立 wiki 層。建立前對照了社群四個主要實作（以下資料截至 2026-04-23）：

- **ussumant/llm-wiki-compiler**：純手動，以 coverage tag 標記覆蓋狀況
- **cablate/llm-atomic-wiki**：加了 atom layer，來源標注嚴謹
- **aaronfulkerson.com**：有 2 個月 production 使用經驗，強調 index 與 log 的必要性，並設計了 graduation 機制
- **Pratiyush/llm-wiki**：目前最完整，有 lifecycle 狀態機與 11 條 lint 規則

最終採用的組合：ussumant 的純手動哲學 + aaronfulkerson 的 index/log 結構 + Pratiyush 的 lifecycle schema。

更新觸發策略選擇：
- Trigger A：使用者主動觸發
- Trigger C：agent 主動提議升級

不採用 Trigger B（hook 每輪自動觸發），判斷是觸發頻率過高，會產生大量低品質更新。

wiki entity 晉升到 CLAUDE.md rule 的條件：`confidence:high` + `lifecycle:verified` + 跨 session 引用 ≥ 3 次 + 內容穩定 1 個月 + 具有跨專案通用性。

截至 2026-05-17，wiki entity 數量為 43 個（扣除 metadata 條目後的內容 entity 數）。wiki 的設計選擇與取捨在此章節有具體記錄，但實際使用體感（Trigger C 是否真的被觸發、使用頻率如何）在撰文時仍屬觀察期、未驗，本文不做成效宣稱。

---

## 25 KB 上限：被外部工具逼出的蒸餾行為

2026-05-07，記憶管理系統在注入時收到警告：

> MEMORY.md is 25.8KB (limit: 24.4KB) — index entries are too long. Only part of it was loaded.

實際狀況：34.7 KB、118 個條目，超出上限 42%。

執行大規模重組：
1. 刪除 7 筆已過時條目
2. 重寫 28 條過長描述
3. L4 群集重組：建立 10 個群集索引 + 第二層向下鑽取結構

重組結果：
- 34.7 KB → 17.7 KB（縮減 49%）
- 118 → 69 個條目
- buffer 剩餘：7.3 KB / 117 行

重組過程中歸納出 5 條設計規則，固化為 feedback memory 條目。

這次重組有幾個特徵值得注意：觸發它的是工具的硬上限警告，不是使用者主動察覺需要整理；沒有這個外部壓力點，原本的結構可能會繼續維持到更臃腫。這是 forcing function 在記憶管理上的具體案例——外部工具的限制條件，比個人主動維護的意志更可靠地觸發了蒸餾行為。

---

## 雙系統定位收斂

經過這輪重組，wiki 與 memory 的職責分界清楚了：

| 維度 | Memory | Wiki |
|---|---|---|
| 更新頻率 | 高頻 | 低頻 |
| 觸發方式 | 自動觸發 | 使用者或 agent 觸發 |
| 內容性質 | 含原始脈絡（私） | 整理後（公開友好）|

資料流動路徑：session 對話 → 自動觸發 → memory 群集 → 使用者觸發（`/wiki-promote`）→ wiki entity。

`/wiki-promote` 工具建立於 2026-05-07，定義了從 memory 條目晉升為 wiki entity 的規範化路徑。

---

## 統合結論：蒸餾決定有效性

這不到一個月的密集迭代（2026-04-23 啟動 → 2026-05-19 撰文，約 26 天）走過了架設、使用、否決、重建的循環。從中可以觀察到三個分別發生的事件指向同一個原因：

1. **向量搜尋 0/6**：drawers 是原始對話，沒有整理；grep 6/6 的 MEMORY.md 是手工濃縮的結論
2. **25 KB 硬上限觸發重組**：沒有外部壓力時，臃腫的記憶結構會繼續堆積；硬上限逼出了蒸餾行為
3. **hybrid 搜尋不解決問題**：語料沒有整理，換更好的檢索演算法只是換一把更快的工具翻垃圾桶

共同原因：**有沒有做蒸餾**——把原始對話材料整理成濃縮可用的結論。

Karpathy LLM-wiki pattern 提供的框架本身是合理的，但框架不保證系統能運作。套用框架、累積資料，不等於建立了一個能在需要時提供答案的知識系統。

決定有效性的不是架構層數、不是向量引擎的版本，而是在語料進入系統之前，有沒有人——或被工具逼著——把它整理過。

系統的演化不是一次設計到位的結果，而是在真實使用的壓力下被迫調整。這段迭代過程更接近「否決、重建、再否決」的循環，而非線性的功能累加。
