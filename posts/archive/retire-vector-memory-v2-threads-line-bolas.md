---
title: 我把自己裝的 vector memory 砍掉了，928 次寫入換來 3 次搜尋
description: 以為向量資料庫能讓 AI 更懂我，裝了三週、配了 hook、寫了 symlink script，結果搜尋/drawer 使用率 0.09%，6 個查詢全輸給一行 grep。
voice: v2-threads-line-bolas
status: 實驗 draft（第一篇 refresh，從 MATERIAL 重寫，非已發布版）
source: posts/retire-vector-memory-MATERIAL.md
---

# 我把自己裝的 vector memory 砍掉了，928 次寫入換來 3 次搜尋

前兩天終於把 mempalace 移除，刪向量資料庫、拔掉 4 個 hook，收回 271 MB 磁碟空間。手速很快，不到 15 分鐘。

花最多時間的是說服自己。

---

裝的動機不難理解。Cursor 2023 年爆紅的核心賣點是「AI 第一次真懂整個 repo」，底層被說是 vector embedding——這個說法到底準不準我沒有第一手驗證，但「向量＝AI 懂我」這個敘事已經進大腦了。於是一批開發者開始把同樣的邏輯帶進個人工作流，想讓 AI 跨 session 也懂自己。我也是其中一個。

mempalace 是 2026-04-07 上線的，Milla Jovovich + Ben Sigman 聯手開源，話題性夠強。LongMemEval R@5 96.6%（mempalace 宣稱）、本地跑、原文照存、沒有 API token 費用，星數幾週衝到五萬。我在早期就裝了，順便配上 Stop / PreCompact hook 讓它自動在每個 session 結束時抽取記憶存入向量索引。

還寫了 `update-symlinks.sh`。

因為 mining 範圍沒限定好，整個 `~/.claude` 目錄都被掃進去，磁碟膨脹到 84GB。symlink script 只把路徑指向主 session jsonl 才解掉這個問題。

這種程度的投入，我應該會認真用它。

---

hook 從 2026-04-07 跑到 2026-04-28 退役。三週內，Stop + PreCompact 自動寫入 928 次，累積了 3429 個 drawers，向量資料 + uv venv 合計 271 MB。

我主動搜尋 mempalace 幾次？

3 次。

搜尋/drawer 使用率：0.09%（3 ÷ 3429）。

204 個 sessions 全部 mined 完之後，hook 繼續觸發，但全是 `Files processed: 0 / Drawers filed: 0`，空跑。hook.log 累積到 22890 行。

看到這個數字的時候，我知道不對勁，但還是想再給它一次機會。

---

退役之前做了對照測試。挑了 6 個真實工作查詢，分別送 mempalace MCP 和直接 grep 我的 MEMORY.md。

結果：mempalace 6 題全輸，grep 6 題全對。

輸法各自不同。問「ccstatusline cold start benchmark」，向量撈回負相似度 -0.439 的結果。問「為什麼換工具」，反向命中，撈到的是不換的紀錄。問「過去一週 project 狀況」，5 個結果都是無關來源。問「extra credits 爆」，同名詞跨領域，分不清哪個「credits」。

grep MEMORY.md 全對。一行指令，0.1 秒。

---

為什麼？我原本以為 vector 輸是因為語料量不夠，後來才發現根本原因更早——語料性質就不對盤。

3429 個 drawers 是原始 session 對話片段，未整理。就算向量召回命中了，你拿到的是一段 context snippet，裡頭沒有結論。

MEMORY.md 的每條記錄是我手工整理過的結論濃縮，直接帶答案。

vector 輸了兩層：召回層（關鍵字 grep 對精確 token 比向量強），加上內容層（手工摘要比原始對話更有用）。

換 hybrid search、換別的引擎，只解召回那一半。語料是原始 session 這件事不變。除非 mining pipeline 改成「LLM 抽精華片段」——但那就是我現在手工在做的事，向量索引就多餘了。

評估過 Mem0、Memori 和阿里的 ReMe。ReMe 的 Light 模式直接走檔案系統，長期記憶檔名叫 MEMORY.md——跟我自己的系統一樣。看完 ReMe 設計，我才意識到我手工跑的架構就是 ReMe 的人工版。替代方案也只解撈取那一半，語料整理的問題它們不處理。

---

退役執行很乾脆。寫了 `checkpoint-judge.sh` 接管 Stop / PreCompact，改讓 AI 判斷「告一段落了嗎」，是才寫 MEMORY.md，否就跳過。移除 mempalace MCP、刪向量資料庫。

回收完之後，意外發現 memory 結構變更好了。原本為了繞 MEMORY.md 的 25KB 上限，我把它拆成兩層——MEMORY.md 作頂層索引，`_index_<topic>.md` 做第二層 cluster。本來是折衷，拆完發現比平鋪好查太多了。

退役後大概 19 天，業界幾個 memory 方案同期浮現：Claude Code binary 裡有個 `/dream` skill（2.1.98+ 出現，被 kill-switch 擋住未公開），Anthropic 的 Dreams API 進了 Managed Agents Research Preview，OpenClaw 出了排程蒸餾（cron + Light/REM/Deep 三階段），社群有 `grandamenium/dream-skill` 走 Stop hook + 24 小時條件。

全部都是排程式蒸餾整合，從向量撈取轉向「怎麼定期把原始 session 抽成整理過的片段」。這個方向跟我用 launchd cron + `claude -p` 每日跑的做法是同一條路。🤔

---

所以向量 memory 什麼時候才有意義？

語料性質決定工具選擇。大部分開發工作查詢是「找某個結論」「查某個決策是什麼」「這個工具當時的設定」——這是 grep 的領域。向量適合的「純概念連接」查詢，在個人開發流裡是少數派。

要不要個人向量 memory，先問自己這兩件事：整理品質夠嗎？查詢性質是概念連接還是找結論？

如果兩題都不確定，先把 MEMORY.md 用 cluster index 結構寫好，不到一個月後再問自己要不要向量。

我跑了三週、寫了 928 次、推到 3429 個 drawers，答案是不要。

大道至簡，效果都不如讓 claude 自己 grep。☺️
