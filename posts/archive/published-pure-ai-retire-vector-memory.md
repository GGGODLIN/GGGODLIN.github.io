---
title: "我把向量資料庫記憶系統退役了——用數據說話"
description: "裝了三週 mempalace 向量記憶工具後，928 次自動寫入、3 次實際讀取，這個數字讓我決定退役它。"
pubDate: 2026-05-18
tags: ["claude-code", "memory", "vector-db", "retrospective"]
---

# 我把向量資料庫記憶系統退役了——用數據說話

Cursor 在 2023 年爆紅的時候，有一個核心敘事讓很多開發者眼睛一亮：「AI 第一次真懂整個 repo」。這個體驗的背後是 vector embedding，把整個 codebase 向量化，讓 AI 在回答問題時能 retrieve 相關 context。這個設計如此成功，以至於後來一批人開始思考：如果 AI 能懂整個 repo，那能不能也「懂我這個人」？能不能有個 system 記住我跨 session 的偏好、決策、工作習慣？

於是 RAG + 向量資料庫進入了個人工作流的討論圈。我也是這波浪潮的一份子。

## 為什麼裝 mempalace

2026 年 4 月 7 日，mempalace 由 Milla Jovovich 和 Ben Sigman 開源上線。這個 repo 的噱頭不小：好萊塢演員跨界做 AI 開源工具，本地跑、零 API token、底層走 ChromaDB HNSW，LongMemEval benchmark 上宣稱達到 96.6% R@5（單一來源，未獨立驗證）。幾週內 star 數衝到 5 萬。

我當時對 Claude Code 的 memory 機制有「不夠用」的感受——MEMORY.md 有 25KB / 200 行的上限，跨 session 的東西很容易就塞不下。mempalace 看起來是個可以無限擴張的解法。

我作為早期使用者裝了進來，透過 Stop 和 PreCompact hook 讓它在每次 session 結束時自動把對話內容 mining 成 drawers 存進向量資料庫，同時整合 MCP 讓 Claude Code 能查詢。過程中也踩了坑：初期因為 mining 範圍沒限定，它掃到了整個 `~/.claude` 目錄（包含大量非 session 檔案），儲存量一路膨脹到 84GB。我後來寫了一個 `update-symlinks.sh` script，只讓它指向主要的 session jsonl 檔案才解決這個問題。

## 數字說話：928 次寫入，3 次讀取

跑了將近三週之後，我開始看數字。

Stop 和 PreCompact hook 總共自動寫入了 **928 次**，累積了 **3,429 個 drawers**。向量資料庫加上 Python venv 環境共佔了 **271 MB** 磁碟空間（245 MB 是 uv venv，26 MB 是向量資料本身）。hook.log 有 22,890 行記錄。到退役前，系統已經 mine 完 204 個 session，後續全部都是空轉——跑完顯示 `Files processed: 0 / Drawers filed: 0`，但還是每次觸發。

而在這三週裡，我主動用 mempalace MCP 搜尋了幾次？**3 次**。查詢主題是 cmux、TanStack Start、還有 session 備份 GitHub 的事。

讀寫比：0.09%。

這個數字讓我決定做一個正式的對照測試，再決定要不要退役。

## 退役前的對照測試：6/6

我挑了 6 個真實工作中會問的查詢，分別送給 mempalace MCP 和直接 grep MEMORY.md，看哪個找得到我要的答案。

| 查詢 | mempalace | grep MEMORY.md |
|---|---|---|
| ccstatusline cold start benchmark | 0/3（負相似度 -0.439） | 命中 |
| extra credits 爆 | 0/3（同名詞跨領域混淆） | 命中 |
| 過去一週 project | 0/5（撈到無關來源） | 命中 |
| 為什麼換工具 | 反向命中（撈到不換的紀錄） | 命中 |
| 新 project 命名 | 跨範圍失準 | 命中 |
| memory 系統演進 | 沾邊但沒找到結論 | 命中 |

結果：向量 6 題全錯，grep 6 題全對。

這個實驗讓我停止繼續猶豫。

## 失敗的根本原因

在退役之前，我花了一些時間想清楚為什麼會這樣。問題不在 HNSW 算法，也不在 ChromaDB 的實作——問題在於語料的性質根本不適合向量搜尋。

mempalace 存的 drawers 是**原始 session 對話片段**，3,429 條，未經整理。就算向量搜尋成功命中了，你拿到的只是某段對話的 context snippet，裡面沒有結論。

而我的 MEMORY.md 裡存的是什麼？**手工整理過的結論濃縮**。每一條 entry 都是「決策是什麼、為什麼這樣決定、結果如何」的精華。這種 entry 用關鍵字 grep 就能精確找到，因為關鍵字 token 完全符合。

所以 file-based memory 同時贏了兩層：

1. **召回層**：對精確 token 查詢，關鍵字 grep 比語義向量準
2. **內容層**：手工整理的結論優於原始對話片段

有人會說，換個 hybrid search 方案（Mem0、Memori 之類）不就解決了嗎？這只解了召回那一半，語料是原始 session 片段這件事不會變。除非你把 mining pipeline 改成「用 LLM 先把 session 對話抽取成精華 chunk 再存」——但那就是我現在手動寫 MEMORY.md entry 在做的事，向量索引等於多餘的一層。

## 我評估過哪些替代方案

退役前我也評估了其他選項。Mem0 和 Memori 是 hybrid search 方向，前面說了，只解一半。

比較有趣的是阿里的 [ReMe](https://github.com/agentscope-ai/ReMe)（AgentScope 子專案，2,824★）。它的 Light 模式直接走檔案系統，長期記憶檔案叫做——MEMORY.md。六欄位結構：Goal / Constraints / Progress / Key Decisions / Next Steps / Critical Context。

看完 ReMe 的設計，我意識到我自己的 memory 系統已經是 ReMe 路徑的人工版本。這讓替代方案的評估變得相對直接：那些工具解決的問題，我的手工系統已經在解，只是沒有自動化。

## 退役執行

2026 年 4 月 28 日，我執行了退役。

具體做了幾件事：寫了 `checkpoint-judge.sh` 接管原本的 Stop/PreCompact hook——邏輯是「告一段落了嗎？是的話就寫 MEMORY.md，否則 skip」；移除了 mempalace MCP 和 3 個相關 hook；刪掉向量資料庫和本地儲存。總共回收了 271 MB 磁碟空間和 4 個 hook 設定。幾分鐘的事。

退役之後，memory 結構進一步演化成兩層 index：MEMORY.md 作為頂層，加上 `_index_<topic>.md` 作為 cluster 二層。原本是為了繞過 25KB 的上限，意外發現分層之後反而比平鋪更好查。

## 業界在同一時間走向哪裡

退役後大約 19 天（2026 年 5 月 17 日），我回頭看了一下業界的動向，發現幾個有趣的事情同步在發生。

這段時間浮現了好幾個 memory 蒸餾整合方案：

- **Claude Code 執行檔內藏 `/dream` skill**（ccVersion 2.1.98+），已被 Piebald-AI 從 compiled npm bundle 驗證提取（10,100★ repo），但被 kill-switch / KAIROS 機制擋住，`claude --help` v2.1.139 未對外暴露
- **Anthropic Dreams API**，進入 Managed Agents Research Preview，beta header 是 `managed-agents-2026-04-01,dreaming-2026-04-21`
- **OpenClaw Dreaming**（v2026.4.5+），走 cron + Light/REM/Deep 三階段蒸餾
- **社群的 `grandamenium/dream-skill`**（55★），走 Stop hook + 24 小時條件觸發

這幾個方案的共同方向：從向量撈取轉向**排程式蒸餾整合**——定期把原始 session 蒸成整理過的片段。而我在退役後的做法（macOS launchd cron + `claude -p` 每日跑檢查）和 Anthropic 內部的設計方向是一致的。

## 什麼時候才需要向量搜尋

把這段經驗整理成一個判斷框架：

個人開發工作流中最常見的查詢類別，大多數都屬於 grep 的強項：

- **找具體實證 / 結論**：grep 領域，向量不需要
- **環境事實、工具名、設定值**：精確 token 查詢，grep 更準
- **跨 session 時間軸聚合**：向量的死角，向量也解決不了
- **因果 / 為什麼**：向量無法區分 reason 和 fact，不佔優勢
- **反向痛點（找過去踩過的坑）**：向量很難抓

向量真正有優勢的場景——純概念連接、語義模糊查詢——在個人開發工作流中是少數。

判斷的關鍵變數不是「要不要用向量工具」，而是**你的語料長什麼樣**。如果你的 memory 系統存的是手工整理的結論，grep 已經夠用。如果你的語料是原始對話片段，換向量工具也救不了，因為找到的還是未整理的片段。

整理品質（curation）比撈取算法（retrieval algorithm）更決定結果。

---

如果你正在考慮要不要導入個人向量記憶系統，建議先做一件事：把你的 MEMORY.md 用 cluster index 結構認真寫好，用一個月。之後再回頭問自己是否還需要向量——我猜答案通常是不需要。
