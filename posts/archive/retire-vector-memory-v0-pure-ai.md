---
title: 我退役了本地向量記憶——928 次寫入、3 次搜尋、6 個測試全輸給一行 grep
description: 在個人開發工作流中實測 mempalace 三週的量化紀錄：工具沒問題，語料性質不對盤。
voice: pure-ai-baseline
status: 純 AI 校稿版（第一篇 refresh，從 MATERIAL 寫，無 voice）
source: posts/retire-vector-memory-MATERIAL.md
---

## 背景：為什麼個人開發者開始用向量記憶

Cursor 在 2023 年爆紅時，核心敘事是「AI 首次真正讀懂整個 repo」。背後的說法（部分有據可查，技術細節屬於動機背景而非第一手驗證）是 vector embedding 讓語義搜尋成為可能。這個敘事吸引了一批開發者，開始把 RAG 與本地向量資料庫帶進個人工作流，目的是複製「AI 懂我的工作脈絡」這種體感。

Claude Code 的 MEMORY.md 系統本來就有跨 session 記憶的設計，但容量上限固定，遇到複雜專案確實會不夠用。於是「本地向量 DB 延伸記憶」的組合方案順理成章地浮現。

## 安裝 mempalace：動機與過程

2026 年 4 月 7 日，mempalace 由 Milla Jovovich 與 Ben Sigman 開源上線。這個工具的話題性不只是技術本身——好萊塢演員跨界投身 AI 開源讓它迅速獲得關注。mempalace 宣稱在 LongMemEval 基準上達到 96.6% R@5 準確率（單一來源，未獨立驗證），走本機端跑、原文照存、不送外部 API 的設計，底層使用 ChromaDB HNSW 與 all-MiniLM-L6 ONNX embedding 模型。幾週內星數衝到 5 萬（確切時間曲線無精確記錄）。

我安裝了，並且認真做了整合。具體來說：

- 配了 Stop 與 PreCompact 兩個 hook，讓每次 session 結束或壓縮前自動把對話存進向量資料庫
- 發現 mining 範圍未限定，整個 `~/.claude` 目錄（含非 session 檔案）都被掃入，儲存量暴增到 84GB；寫了 `update-symlinks.sh`，把 mining 來源限縮到主 session jsonl，才解決膨脹問題
- 跑了 2 到 3 週

這不是輕描淡寫的「試了一下」——是配工具、排故障、解 84GB 危機的認真投入。

## 三週後的量化紀錄

2026 年 4 月 28 日，我執行退役前先看了一下數字。

Stop 與 PreCompact hook 在這段時間共寫入 928 次（memory reference 記錄為 925 次，差異來自統計時間點不同，趨勢一致）。累積了 3429 個 drawers。

我自己主動對 mempalace 發出的真實搜尋查詢：3 次。

搜尋次數除以 drawer 數量，比率是 0.09%（3 ÷ 3429）。這個比率是「我實際用向量搜尋的次數」除以「向量資料庫裡有多少條目」，反映的是工具的實際使用密度，而不是讀寫次數的對比。

磁碟佔用：245 MB uv 虛擬環境加上約 26 MB 向量資料，合計約 271 MB。

hook 的空轉狀況：204 個 sessions 全部掃完後，後續每次觸發都是 `Files processed: 0 / Drawers filed: 0`，但 hook 仍然每次跑。hook.log 累積了 22890 行。

數字說的是：這套工具每次 session 都在運轉，我幾乎從來不用它。

## 退役前的對照測試：6 對 6

退役之前，我做了一輪明確的對照實驗。選 6 個真實工作查詢，同時送給 mempalace MCP 和直接 grep MEMORY.md。

| 查詢主題 | mempalace 結果 | grep 結果 |
|---|---|---|
| ccstatusline 冷啟動基準 | 0 命中（相似度 -0.439，負值）| 命中 |
| extra credits 爆量 | 0 命中（同名詞跨領域干擾）| 命中 |
| 過去一週的專案 | 0 命中（返回無關來源）| 命中 |
| 為什麼換工具 | 反向命中（撈到「不換」的紀錄）| 命中 |
| 新專案命名 | 跨範圍失準 | 命中 |
| memory 系統演進 | 沾邊但無結論 | 命中 |

向量：6 題全錯。grep：6 題全對。

這個結果讓退役決策從「考慮中」變成「確定」。

## 根本原因：語料性質不對盤

mempalace 的向量引擎本身沒有問題。失敗的原因是語料性質。

drawers 的內容是原始 session 對話片段——3429 條未整理的上下文。向量搜尋在語意相近時命中，但命中的是一段對話，不是一個結論。你問「為什麼換工具」，它撈到「討論換不換工具」的片段，卻可能是反方觀點的那段。

MEMORY.md 的條目是手工整理的結論濃縮，每條自帶答案。grep 找到的不只是「這個 token 出現過」，而是「這件事的結論是什麼」。

所以檔案型記憶系統同時在兩個層面贏過向量：

1. **召回層**：對於精確 token（工具名、函式名、版本、專案名），關鍵字比向量準
2. **內容層**：手工整理的摘要本身就是答案，未整理的對話片段不是

有人可能會說：換成 Mem0 或 Memori 等混合搜尋方案如何？這只解決召回那一半。語料是原始 session 這件事不變。除非把 mining 流程改成「LLM 抽取精華片段再存」，但那就是我現在用 Claude 手工寫 reference 檔案在做的事——向量索引在這條路上是多餘的一層。

從查詢類型來看，在個人開發工作流中，大部分查詢落在向量不擅長的區域：

- 找具體實證或結論：精確 token，grep 領域
- 跨 session 時間軸聚合：向量死角
- 因果與原因：向量對「原因」與「事實」無區分能力
- 環境事實與實體查找：精確 token，grep 領域
- 反向痛點（「我遇過什麼坑」）：向量難以捕捉

向量有限度發揮作用的查詢類型（純概念連接）在個人開發流程中是少數派。

## 評估替代方案

退役前也評估了其他路徑。

Mem0 和 Memori 走混合搜尋，改善了召回引擎，但語料問題沒解。

阿里的 ReMe（AgentScope 子專案，github.com/agentscope-ai/ReMe，2026 年 4 月 24 日最後更新，2824 顆星）走檔案系統路徑：Light 模式直接寫長期記憶到本地檔案，六欄位結構（Goal / Constraints / Progress / Key Decisions / Next Steps / Critical Context）。ReMe Compactor 宣稱壓縮率 99.5%（223,838 tokens 壓成 1,105 tokens）。

讀完 ReMe 的設計，發現我的 MEMORY.md 手工系統已經在跑同一套架構——只是人工執行版。這不是說 ReMe 沒用，而是替代方案只解決了撈取引擎那一半，不解決語料整理問題。

## 退役執行

2026 年 4 月 28 日 17:52，執行退役。

做了幾件事：寫了 `checkpoint-judge.sh` 接管 Stop 與 PreCompact hook，邏輯改成「Claude 判斷這段工作是否告一段落，是的話才寫 MEMORY.md，否則略過」；移除了 mempalace MCP 與 3 個相關 hook 設定；刪除向量資料庫與本地儲存。

回收了約 271 MB 磁碟空間，移除了 4 組 hook 設定。

退役後，MEMORY.md 的結構逐漸演化成兩層索引：頂層 MEMORY.md 加上 `_index_<topic>.md` 的分群二層結構。原本這個分層是為了繞過 25KB 的官方上限，後來發現分層後查詢反而比平鋪更快定位。

## 退役後三週：業界方向的驗證

退役後約 19 天（文章日期 2026 年 5 月 17 日），觀察到業界有幾個 memory 整合方向同期浮現：

1. Claude Code 執行檔從 ccVersion 2.1.98 開始內藏 `/dream` skill（由 Piebald-AI 的 claude-code-system-prompts，10,100 顆星，從編譯後 npm bundle 驗證提取），但被 kill-switch 擋住未正式發布；claude --help 在 v2.1.139 未列出此指令
2. Anthropic 的 Dreams API 進入 Managed Agents Research Preview，平台文件位於 `platform.claude.com/docs/en/managed-agents/dreams`，beta header 為 `managed-agents-2026-04-01,dreaming-2026-04-21`
3. OpenClaw Dreaming（v2026.4.5 起），走 cron 排程加上 Light / REM / Deep 三階段蒸餾
4. 社群方案 grandamenium/dream-skill（55 顆星），走 Stop hook 加上 24 小時條件觸發

共同方向是：從向量撈取，轉向排程式蒸餾整合——定期把原始 session 提煉成整理過的片段。

我自己在退役後採用的方式是 macOS launchd cron 加上 `claude -p` 每日跑檢查，方向與業界同期設計一致。這不代表退役決策有先見之明，只是事後看，語料整理優先於搜尋演算法這個判斷方向沒有走偏。

## 向量記憶適用的條件

這篇的結論不是「向量資料庫沒用」，而是「適用條件比想像中窄」。

語料性質決定工具選擇。如果你的記憶語料是高度整理過的精華片段，或者查詢主要是純概念連接（「這個概念跟那個概念有什麼關係」），向量有發揮空間。

個人開發工作流的大部分查詢不在這裡。

一個判斷路徑：先把 MEMORY.md 用分群索引結構寫好，跑一個月，再回來問自己是否真的缺向量搜尋。如果你發現自己每天都在用向量搜尋，那就值得配；如果使用次數接近 0.09%，整理品質的優先序遠高於搜尋演算法的選擇。

---

*退役日期：2026 年 4 月 28 日。文章日期：2026 年 5 月 17 日。*
