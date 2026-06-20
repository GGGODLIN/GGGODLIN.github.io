---
title: 量採用率之前，先確定你量的是行為不是嘴
description: codemap 在主力工作 repo 六週的自發採用次數是 0。我 2026-05-02 親口說想要互動式 wiki，我的 agent 用行為否決了我自己。這篇記量法：怎麼量、怎麼量準、怎麼避免量出假數字。
voice: v3-threads-line-cc-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: posts/measure-revealed-adoption-MATERIAL.md
---

前兩天在想 [graphify](https://github.com/safishamsi/graphify) 的互動圖有沒有借鑑空間，查到它近 7 萬星（live 核 2026-06-20），查得出來為什麼這工具紅。但在決定要不要投資之前，我被要求先去量一個數字：codemap 在主力工作 repo 的自發採用率。

結果是 0.62%，自發採用是 0。

我原本以為「口頭說想要」加上「工具看起來很有競爭力」已經足夠。後來才發現那兩個都不算，唯一算的是 agent 真實跑起來的行為數據。

---

## graphify 在我這找不到就業機會

graphify 最初的評估是「取代 Explore subagent」。它能用純 AST 出結構圖，近 7 萬星、仍在快速成長，光看這個表面上很有說服力。

被要求去 verify 之後，結論反轉了。Explore subagent 真正在做的四件事：HTTP route 辨識、settings 欄位追蹤、業務語意理解、scope 過濾。這四件事 graphify 的 AST 全做不到。它本質上是結構圖工具，business logic 的上限是爬 `# WHY:` 這類行內注解，domain rule 抽不出來。

所以結論從「取代」改回「補強」，不是它不強，是科別就錯了。

這個修正是後面整串的起點。

---

## codemap 0.62%，自發採用 0

graphify 修正完，剩最後一個有競爭意義的借鑑軸：把 callflow-html renderer 拿來、把 codemap 這種 pre-curated 文件包成互動圖，讓 agent 查 codebase 時用起來更順。

收斂這個軸用的方法是量行為數據。

主力工作 repo（45 個活躍 session / 211 個 commit）的 session log 裡，codemap 的 Read 呼叫是 8 次 / 全部 1298 次，0.62%。細看那 8 次：4 個 session 有讀到，其中 1 個是生成 codemap 本身（有 Write/Edit），另外 3 個是我在訊息裡明確點名要 CC 讀，2/3/2 次點名，每次都是我主動叫它讀。

排掉生成的那次、排掉我點名的三次，CC 自發採用 codemap 的次數：0。

這 0 有個 stated preference（口頭意願）做對比。2026-05-02，我親口跟 CC 說「只生純 md 對人類不是很友善」、想要 DeepWiki 風格的互動 wiki。意願確實有、說得很明確，然後我的 agent 六週沒有自發用過一次這份文件。

連我自己的口頭意願都被我的 agent 用行為否決，何況工具廣告的能力。

這就是 stated preference（口頭意願）跟 revealed preference（行為偏好）的差距。把 codemap 包成互動圖救不了這個 0，因為問題不在呈現層，問題在需求面：agent 走它自己的路徑、不走 codemap 這條。

---

## brooks-lint 要 graft 進哪個 agent，看 spawn 數

類似的邏輯在 [brooks-lint](https://github.com/hyhmrright/brooks-lint)（1,118 星，live 核 2026-06-20）的場景裡又出現一次。

brooks-lint 是一組程式碼衰退風險詞彙的分類學，要把它 graft 進 reviewer agent 裡。直覺是找「概念最對口的」，第一個念頭是 architecture-critic，名字就對、概念也配。

量了 agent 的真實被派次數之後，直覺錯了（以下是 2026-06-09 的快照）：

- code-reviewer：88 次
- typescript-reviewer：41 次
- architecture-critic：2 次（兩次都在 review 設計文件、沒碰 code）
- tdd-guide：0 次

architecture-critic 2 次且不碰 code，graft 進去等於冷藏。tdd-guide 0 次，直接是死碼。

增強落在 code-reviewer 加 typescript-reviewer，真正活的兩條路徑，打到全部流量。

這裡同一個判準：存在不等於使用。把一個 0 spawn 的 agent 標成「成熟配置」，是自己騙自己。

---

## 差點給出假數字

前面兩個案例的數字是怎麼量出來的？量的過程本身踩了一個陷阱，差點給出全錯的結果，值得講一下。

從 session log（jsonl）數 subagent 被 spawn 幾次，第一直覺是 filter `Task` 工具名。跑完全回 0，code-reviewer 0、typescript-reviewer 0、general-purpose 也 0。

general-purpose 回 0 是不可能的，這才觸發警覺：不是真的沒人派，是 parse 邏輯壞了。dump 真實 jsonl 結構一看，spawn 工具名在這台機器的這個 CC 版本是 `Agent` 不是 `Task`。filter 錯工具名，全部假陰性。

修對工具名之後才有正常數字。**這類陷阱的解法是對照組 sanity check**：parse 完必須對主力 general-purpose 驗一次。它若回 0，不是真的沒派，是量法本身壞了。

拿到 spawn 數之後還有第二道驗證：grep 字串命中 vs strict parse 真工具呼叫對照。grep 快，但有污染。如果有人 cat 了 agent 定義檔、memory 檔，或 prompt 裡提到這個 agent 名字，都會被 grep 算進去。strict parse 才是真的。兩者比對：code-reviewer 的 grep 88 == strict 88，無污染，數字可信。

這個雙重驗證還有一個孿生案例。量試用工具 plannotator 被真實使用幾次，grep 命中 127 個 session、strict 真實使用 0。污染源有三：trial-review hook 每個 session 開頭會注入工具名提醒、trial 清單檔本身被 Read 進 context、review 當下自己 grep 該工具名的指令也進了當前 session（自我回音）。

三種污染疊在一起，grep 數字比真實值高出 127 倍。試用工具要量真實使用，要用 binary 的 atime 當 ground truth，加上 strict 解析真實 Bash 指令呼叫。

另外 spawn 數有 description 可以拆層級。code-reviewer 88 次拆開：plan-task review 70、pr-review 驗證 14、其他 4。同一個 agent 在不同呼叫脈絡的重量差很多，這層可以按需要再細分。

---

## 投資前先量一次

這篇的邏輯可以整理成四條判準，下次評估工具或 agent 配置時直接套：

第一條，任何「把 X 做成互動版 / 包成漂亮 UI / graft 增強它就會被採用」的提案，不管是誰提的、還是自己口頭說「我想要 X」，投資前先去 session log 量 X 當下的自發（organic）採用率。0 organic 就是需求面死，呈現層的投資擋掉。

第二條，要判斷某個 agent 或工具該不該升級或保留，先量 revealed adoption（行為偏好）。0 spawn 就是 0 spawn，存在不等於使用，放置增強要落在真正活的路徑上。

第三條，量的時候：工具名陷阱（是 `Agent` 不是 `Task`）先踩一次會很有印象；grep 字串 vs strict parse 雙重驗證；對照組 sanity check 對主力 general-purpose 跑一次；試用工具用 atime ground truth 而非 grep。

第四條，spawn 數可以用 description 欄位拆層級，看清楚每條路徑的真實重量。

這套流程不是新工具，是讀 session log 的紀律。[check-my-stack](https://github.com/GGGODLIN/check-my-stack) 的核心邏輯也跑同一套：先看使用者的 stack 有什麼、再看新工具補的是哪一段、行為數據說不，就是說不。

跟這篇是姊妹篇的第六篇〈[裝了一堆 codebase 搜尋工具，agent 幾乎都不用](https://gggodlin.github.io/blog/code-search-adoption/)〉講的是「為什麼採用率才是真跑分」。這篇講的是怎麼量準這個採用率。供大家參考。
