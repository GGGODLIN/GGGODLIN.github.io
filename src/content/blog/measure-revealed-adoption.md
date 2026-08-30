---
title: "嘴上說想要，但 agent 根本沒在用"
description: "量 revealed adoption 的方法：為什麼口頭意願不能當投資依據，怎麼從 session log 數出真實的自發採用率，還有量法本身踩過的坑。"
pubDate: "2026-06-20"
tags: ["claude-code", "tool-adoption", "subagent", "methodology", "revealed-preference"]
---

# 嘴上說想要，但 agent 根本沒在用

前幾個月，我在一份 memory 裡白紙黑字寫過：「只生純 md 對人類不是很友善，想要 DeepWiki 風格的互動 wiki。」2026-05-02，這是我本人的口頭意願。

然後我去量了一下我的 agent 在主力工作 repo 六週內自發讀 codemap 幾次。

數字出來是 0。

---

這是這篇要說的核心：要判斷某個 artifact / agent / 工具值不值得投資改造，依據是 **revealed preference（行為偏好）**，不是 **stated preference（口頭偏好）**，更不是工具自己廣告的能力。連我自己的口頭意願都被我的 agent 的行為否決了，何況工具宣稱「我可以做 X」。

---

## 從「取代」改口成「補強」

事情要從 [graphify](https://github.com/safishamsi/graphify) 說起。它是近 7 萬星的 AST 結構圖工具（live 核 2026-06-20），可以把整個 codebase 解析成互動 callflow 圖。

我的 CC 一開始很樂觀，主張 graphify 的 AST 結構可以取代 Explore subagent。聽起來合理，視覺化 codebase 結構嘛。

然後我要求 verify。

結果 Explore subagent 真正做的四件事，純 AST 全做不到：HTTP route 辨識、settings 欄位追蹤、業務語意理解、scope 過濾。graphify 的上限只能爬 `# WHY:` 這種手寫註解，抽不出 domain rule，更別說業務不變量。科別就錯了，它是結構圖工具，碰不到語意層。

結論從「取代」改成「補強」，後來那個互動圖借鑑的方向也就剩一個軸：把 pre-curated 的 codemap 文件包成互動版，讓人讀起來更友善。

這條路看起來有道理，尤其我記憶裡真的寫過「想要 DeepWiki 風格」。

---

## codemap 被讀了 8 次，自發採用是 0

在認真評估「要不要把 codemap 包成互動圖」之前，先去量行為數據。

主力工作 repo，45 個活躍 session，211 個 commit，讀取 codemap 的次數：8 次，佔全部 Read 工具呼叫 1298 次的 0.62%。

看起來不高，但先別下結論，先看這 8 次是怎麼來的。

4 個 session 有讀 codemap：
- 1 個是生成 codemap 本身（有 Write/Edit，不算採用）
- 3 個是我在對話裡明確點名要 CC 讀（每個 user 訊息都點名 CODEMAPS，2 次、3 次、2 次）

排掉生成 session，再排掉我主動要求的 session：CC **自發採用 codemap = 0**。

這是 0.62% 被挖開之後的真實樣貌。我本人 2026-05-02 說想要互動版，我的 agent 在此後六週一次都沒自發讀過。

把 codemap 包成互動圖救不了這個問題，因為問題不在呈現層，在需求側：agent 根本沒有走到那條路。貼再漂亮的互動皮，沒人走的路還是沒人走。

這是「量 artifact 採用率」的標準操作：數 session log 裡 CC 自發讀取的次數，不數我叫它讀的次數。

---

## 要把增強放哪，靠 spawn 數說話

同一個方法，用在 [brooks-lint](https://github.com/hyhmrright/brooks-lint) 上（當前 1,118 星，live 核 2026-06-20）。

brooks-lint 是一套「程式碼衰退風險詞彙」分類學，能偵測 TODO 炸彈、例外吞噬、magic number 等模式。我要決定把這個增強 graft 進哪個 reviewer agent。

直覺上最對口的是 architecture-critic，畢竟衰退模式聽起來是架構問題。

然後去量各 agent 的 spawn 數（快照時間點：2026-06-09）：

| agent | 被派次數 |
|---|---|
| code-reviewer | 88 |
| typescript-reviewer | 41 |
| architecture-critic | 2 |
| tdd-guide | 0 |

architecture-critic 被派 2 次，而且那 2 次都在 review 設計文件，根本沒碰 code。tdd-guide 0 次，死碼。

graft 進 architecture-critic = 等於把這個增強冷藏。概念對口沒有用，要看路徑是不是活的。

決定落在 code-reviewer 和 typescript-reviewer，這兩條路徑加起來 129 次，才是真正有在跑的通道。

---

## 差點數出全是 0 的假數字

好，方法論確立了，但這個方法本身也會出錯。

我在量 subagent spawn 數的時候，第一版 filter 用的工具名是 `Task`。session log 裡每一行都回 0。

問題是，連主力的 general-purpose agent 也回 0，它明明被派了 875 次。這顯然不對。

數 `Task` 全回 0，不是真的沒派，是 filter 的工具名就錯了。在這台機器、這個 CC 版本，spawn 的工具名是 `Agent`，不是 `Task`。

差點把這個假數字當成真結果給出去：「你的 agent 沒有被人派過」。

修正之後，general-purpose 875、code-reviewer 88，數字才正常。

教訓是：量行為數據之前，先對最主力的那個 agent 驗一次。它若回 0 就是你的 parse 邏輯壞了，不是真的沒派。這是 sanity check 的基準。

---

## 量法紀律

總結下來，想把採用率量準，有幾條需要注意：

**工具名陷阱**：spawn 的工具名取決於你的 CC 版本和環境，filter 錯了全回 0，是假陰性不是真沒派。

**雙重驗證**：先 grep 字串（快），再 strict parse 真實工具呼叫。兩者差很多代表有污染（可能是對話內容提到那個名字、memory 被讀進來等）。本次 grep 88 == strict 88，確認無污染。

**對照組 sanity check**：永遠對主力 agent 驗一次，回 0 就是 parse 壞了。

**拆層級看 description**：code-reviewer 88 次拆開來是 plan-task review 70 次 / pr-review 14 次 / 其他 4 次，可以看出 agent 真正在做什麼。

**試用工具另算**：量試用工具的真實使用時，grep 工具名字串幾乎一定高估。以 plannotator 為例，grep 命中 127 個 session，strict parse 真實使用是 0。污染源很多：trial-review hook 每個 session 注入工具名提醒、清單檔被讀進 context、量測指令本身也含那個名字。試用工具的 ground truth 用 binary 的 atime + strict parse Bash 命令呼叫。

---

## 可複用的判準

把 codemap、brooks-lint、plannotator 這三個量測案例抽象出來，判準很簡單：

投資把某個東西變漂亮 / 互動 / graft 增強之前，先去 session log 量它的自發採用率。自發採用 = 0，就是需求側死了，不是呈現側的問題。口頭說「我想要 X 的互動版」不算需求證據，行為數據才算。

agent / skill 的增強要落在真正活的路徑，不放概念最對口但沒人派的那個。把 0 spawn 的 agent 標成「成熟、隨時備用」是「存在 ≠ 使用」的錯。

這篇只處理一件事：怎麼量。系列裡另一篇[〈裝了一堆 codebase 搜尋工具，agent 幾乎都不用〉](https://gggodlin.github.io/blog/code-search-adoption/)談「為什麼採用率才是真跑分」，總綱 [check-my-stack](https://github.com/GGGODLIN/check-my-stack) 談為什麼熱門工具對一個已有深度 stack 的使用者幾乎都負分。

也算是老問題了：工具推薦的時候看的是工具能做什麼，實際上要看的是 agent 有沒有在用它。
