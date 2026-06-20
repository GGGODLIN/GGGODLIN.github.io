---
title: 量 revealed adoption：嘴上想要 vs 手上真的用
description: 評估一個 agent 工具或 artifact 該不該升級、做漂亮、graft 增強之前，先去 session log 量它當下的自發採用率。連我自己親口跟 CC 說想要的東西，都被我的 agent 六週零採用否決——附三條實證主線與量法本身的技術陷阱。
voice: pure-ai-baseline
status: 純 AI 校稿版（Phase 1.5，從 MATERIAL 寫，無 voice）
source: posts/measure-revealed-adoption-MATERIAL.md
---

要評估一個 agent 工具、artifact 或 subagent 值不值得引入、升級、改造，依據應該是 **revealed preference（行為偏好）**——也就是 session log 裡 CC 自發呼叫、自發採用它的次數——而不是 **stated preference（口頭意願）**，更不是工具自稱的能力。

這聽起來像常識，但實際做評估時很容易滑掉。我們會被工具的明星數量吸引，會被自己「我覺得我會用」的直覺帶著走，也會被一句「把它做漂亮、做成互動版就會有人用」的提案說服。這篇講的是一個比這些都硬的判準：**revealed preference 優先於 stated preference**。行為數據優先於口頭意願，也優先於廣告詞。

由此推出一條操作原則：在投資把某個東西變漂亮、互動化、graft 增強、升級之前，先去 session log 量它當下的 **organic（自發）採用率**。

而這條原則裡藏著一個關鍵的不對稱：**零自發採用 = 需求面已死**。把一個沒人自發採用的東西包成互動介面、graft 增強、做漂亮，不會無中生有出需求——問題出在需求側（demand side），不在呈現側（presentation side）。

最後還有一層：要把採用率量準，本身有一套技術紀律。量錯了會給出假數字，把假設誤當事實。這篇後半會專門講這層。

## 這篇寫給誰

主要寫給用 agent 工具（Claude Code 等）開發、而且會評估「要不要引入、升級、改造某個工具或 artifact」的工程師。如果你對「工具評估方法論」本身有興趣、想要一套可複用的判準而不是某個單一工具的評測，這篇的目標就是給你那套判準。

這是「工具評估系列」的方法層個案。系列的脈絡（只當背景，不展開）大致是這樣：總綱談「為什麼熱門工具對個人幾乎都負分」——因為你現有的 stack 往往已經是它的超集；結構面談「封裝工具接不進 Bash 管線，可觸及面被使用率封頂」；而這篇是**方法層**：怎麼把採用率量出來。

它跟系列第六篇 [code-search-adoption](https://gggodlin.github.io/blog/code-search-adoption/)（〈裝了一堆 codebase 搜尋工具，agent 幾乎都不用〉）是姊妹篇，但不同軸：第六篇是**行為面**，講「為什麼採用率才是工具的真跑分」這個結論；這篇是**方法層**，講「實際怎麼把採用率量出來、量準」這個操作。兩篇不重複內容。

下面用四條主線把方法走一遍，每一條都帶同一種結構：**以為 X、差點給出 Y → 量了行為數據 → 修正**。失敗本身就是內容。

## Beat 0 · 前傳：graphify 從「取代」改回「補強」

在量任何行為數據之前，先講一段 [graphify](https://github.com/safishamsi/graphify) 的故事，因為它是後面整條弧線的開頭。

graphify 是一個用純 AST 建結構圖的工具（AST + tree-sitter + Leiden + god-node 偵測那一類）。某次 CC 過度樂觀地主張：graphify 的純 AST 結構圖可以**取代** Explore subagent。

被要求去 verify 這個主張後，發現 Explore subagent 真正在做的四件事，純 AST 全做不到：

1. HTTP route 辨識
2. settings 欄位追蹤
3. 業務語意理解
4. scope 過濾

結論於是從「取代」改回「補強」。

這是 graphify「科別錯」第一次顯現：它是結構圖工具，碰得到語法結構，碰不到業務語意、不變量、為什麼存在。它的 business logic 上限大概只能去爬程式碼裡 `# WHY:` 這種註解，抽不出 domain rule。

這段的作用是鋪墊。它先把「同一個工具被證據擋下」這條弧線的第一段立起來——一次靠 verify 戳破。接著主線一會用行為數據再擋它一次。兩輪串成「同一個工具、兩次被擋下」的完整弧線。

## Beat 1 · 主線一：互動圖被行為數據擋下（量 artifact 採用）

graphify 還有最後一個有競爭意義的軸：它的 callflow-html renderer 值得借鑑——把 codemap 這種預先整理好（pre-curated）的文件包成互動圖。這一軸，用行為數據收斂掉。

這裡先講一段差點翻車的判斷。看到使用者的 memory 裡寫著想要互動 wiki，評估一度要翻向「這個借鑑是真實的、是被痛點驅動的」——既然人都說想要了，把文件做成互動圖應該有需求。

於是去量了行為數據。在主力工作 repo 裡，codemap 被 Read 工具呼叫的次數是 **8 次 / 全部 1298 次 ≈ 0.62%**。

再往下拆這 8 次落在哪：只有 4 個 session 真的讀了 codemap。其中 1 個是生成 codemap 本身那次（同 session 有 Write/Edit）；另外 3 個，是使用者在訊息裡明確點名要 CC 去讀——每一個 user 訊息都點名了 CODEMAPS（分別點了 2、3、2 次）。

把生成那次排除、把使用者點名那 3 次排除之後，CC **自發（organic）採用 = 0**。

作為對照，另一個同樣是預先整理好的檔（aliases）也才大概 9 行——量級上根本不是被頻繁倚賴的資產。

**這裡要把 scope 講清楚**：0.62% 這個數字，是這個**特定主力工作 repo** 的數據，這個 repo 跨了 45 個活躍 session、211 個 commit。它不是全 CC 的普世通則，請不要把它讀成「codemap 在任何情境下都只有 0.62% 採用率」。它是「在這個被密集使用、樣本夠大的 repo 裡，自發採用是零」。

到這裡，這篇最強的一刀出現了，而且它指向我自己。

**2026-05-02，我親口跟 CC 說**：只生純 md 對人類不是很友善，我想要 DeepWiki 風格的互動 wiki。這是 stated preference——我嘴上想要的。

**六週後，行為數據是**：我的 agent 在這個主力 repo 裡，對 codemap 的自發採用是 0。這是 revealed preference——我的 agent 手上真的做的。

換句話說，**連我自己親口表達的意願，都被我自己的 agent 用行為否決了**。stated 的主體是「我」（我的心智、我的意願）；revealed 的主體是「我的 agent / CC」（它實際的行為）。我說想要，我的 agent 不去用。

這正是這篇的核心戲劇，也是這條判準力道的來源：如果連我自己的口頭意願都不可信、都會被行為數據推翻，那一個工具自稱的能力、一句「做成互動版就會有人用」的提案，憑什麼更可信？

所以把 codemap 包成互動圖救不了它。問題在需求側，不在呈現側。需求面已經死了，呈現層怎麼投資都生不出需求。

## Beat 2 · 主線二：graft 放哪靠 spawn 數決定（量 agent 採用）

主線一量的是 artifact。同一套判準可以推廣到 agent / skill。

場景是這樣：[brooks-lint](https://github.com/hyhmrright/brooks-lint) 有一組「程式碼衰退風險詞彙」（decay-risk 分類學），要把它 graft 進某個 reviewer agent。問題是 graft 進哪一個？

直覺的答案是「graft 進概念最對口的那個」。但這篇的判準說：依據是各 agent 的真實被派次數（revealed adoption），不是概念對口程度。

於是量了一次 spawn 數（**以下是 2026-06-09 那個時間點的快照，不是恆定值**）：

| reviewer agent | 被派次數 | 備註 |
|---|---|---|
| code-reviewer | 88 | 真正活的路徑 |
| typescript-reviewer | 41 | 真正活的路徑 |
| architecture-critic | 2 | 且這 2 次都在 review 設計文件、不碰 code |
| tdd-guide | 0 | 死碼 |

反直覺的地方就在這裡：**概念最對口的 architecture-critic，只被派了 2 次，而且都不碰 code**。如果照直覺把這組詞彙 graft 進 architecture-critic，等於把增強放進冷藏庫。tdd-guide 0 次，更是直接 graft 進死碼。

所以差點犯的錯是：把增強放進概念最該放的那個 agent。量了 spawn 數才看清——它幾乎沒人派、另一個根本是死碼。

修正後的決策：增強落在 code-reviewer + typescript-reviewer 這兩條真正活的路徑上，打到全部活路徑。

可複用的判準是：把一個 0 spawn 的 agent 標成「成熟」，是「存在 ≠ 使用」的錯。放置增強，要落在真正活的路徑，不放在概念對口但沒人派的 agent。

## Beat 3 · 主線三：parse 陷阱與雙重驗證（量法的技術執行層）

上面兩條主線的數字怎麼量出來、怎麼量準？量法本身有一層技術紀律，量錯了會給出假數字。這一段是全篇可信度的承重段——它示範「量法本身也會出錯」。

### 工具名陷阱（Agent 不是 Task）

從 session log（jsonl）數某個 subagent 被 spawn 幾次時，要去 filter spawn 用的工具名。問題是：在這台機器、這個 CC 版本上，spawn 的工具名是 `Agent`，**不是 `Task`**。

第一次 filter 用了 `Task`——結果全部回 0，是假陰性。

差點就把這個 0 當成「真的沒人派」報出去了。觸發發現的點是：連主力的 general-purpose 都回 0。general-purpose 不可能 0，這明顯是邏輯壞了。把真實的 jsonl 結構 dump 出來看，才看到欄位裡寫的是 `"name": "Agent"`，改對工具名之後數字才正常。

這就是「差點給出假數字、修正過的點」的典型樣貌——量法在最底層就可能踩雷。

### 雙重驗證紀律

為了不再被這種事坑，量的時候用兩道驗證：

**第一道：grep 字串命中 vs strict parse 真工具呼叫的對照。** 先 grep 工具名字串（快，但會含污染），再 strict parse 真正的 tool_use。兩者差很多，代表有「對話裡只是提到這個字串」的污染（例如某個 session 把 agent 檔、memory、或別的 prompt `cat` 進了 context）；兩者一致，代表沒污染、數字可信。這個案子裡 grep 數到 88、strict parse 也是 88，確認無污染。

**第二道：對照組 sanity check。** strict parse 一定要對主力 general-purpose 跑一次驗證——它被派了 875 次。如果這個對照組回 0，那一定是 parse 邏輯壞了，不是真的沒派。前面工具名陷阱的發現點，就是這個對照組回 0 給的。

### 用 description 拆層級

光知道 code-reviewer 被派 88 次還不夠細。抽 `input.description` 欄位，可以把這 88 次拆成不同 review 層級：

- plan-task review：70 次
- pr-review 驗證：14 次
- 其他：4 次

（70 + 14 + 4 = 88，自洽。）這讓「被派 88 次」從一個總數變成可以看出用途分佈的結構。

### 孿生 case：量試用工具，grep 會大幅高估

還有一個跟上面對稱的陷阱，但方向相反——量一個 active-trial（試用中）工具被用了幾次時，grep 工具名字串會**高估**，而不是回 0。

具體數字：plannotator 這個工具，grep 命中了 **127 個 session**，但 strict parse 真實使用 = **0**。

污染源有三個，而且都是試用工具特有的：

1. trial-review hook 在每個 session 的第一輪都會注入該工具名的提醒。
2. trial 清單檔被 Read 進 context，連帶把工具名帶進去。
3. review 當下、自己下的那條 grep 該工具名的指令，也被記進了當前 session（一種自我回音）。

這三個來源都不是「工具真的被呼叫」，但都會被 grep 命中。

正解：用 binary 的 atime（access time）當 ground truth（如果這個 trial 工具是個 binary，這是最快的判法），再加上 strict parse 真實的 Bash 命令呼叫。

### 這段在整篇的作用

把方法論從「該量行為數據」收尾到「怎麼量準行為數據」。如果讀者拿到方法卻量出假數字，反而更糟。工具名陷阱、雙重驗證、對照組 sanity check、孿生 case 高估——四個一起，是讓前面三條主線數字站得住的地基。

## Beat 4 · 可複用判準

把前面四段抽成可以直接拿去用的判準：

1. **投資前先量自發採用率。** 任何「把 X 變漂亮、互動、做成 UI、graft 增強它就會被採用」的提案——不論是 AI 自己提的、某工具的借鑑價值押在呈現層、還是使用者口頭說「我想要 X 的互動版」——投資之前，先去 session log 量 X 當下的 organic 採用率。

2. **零自發採用 = 需求面死，呈現層投資擋掉。** 不接受 stated「我想要」當觸發條件，要 revealed preference（行為）證據。沒人走的路貼上互動皮，需求不會憑空生出來。

3. **升級 / graft / 保留某個 agent、skill、工具之前，先量 revealed adoption。** 把一個 0 spawn 的 agent 標成「成熟」，是「存在 ≠ 使用」的錯。放置增強要落在真正活的路徑，不要放在概念對口但沒人派的 agent。

4. **量法的技術紀律有四條：**
   - **工具名陷阱**——spawn 的工具名是 `Agent` 不是 `Task`，filter 錯會全回 0。
   - **雙重驗證**——grep 字串 vs strict parse 對照，差很多代表有污染，一致才可信。
   - **對照組 sanity check**——對主力 general-purpose 跑一次驗證，回 0 就是 parse 壞了。
   - **用 description 欄位拆層級**；試用工具則用 binary 的 atime 當 ground truth，再配 strict Bash parse。

最後回到最開頭那一刀：連我自己親口說想要的東西，都被我自己的 agent 用六週零自發採用否決掉。如果我的口頭意願都不可信，那工具廣告詞、明星數量、以及「做漂亮就有人用」的直覺，更沒有理由不先量過行為數據再說。

---

> 附帶一提工具現況（live 核日期 2026-06-20）：[graphify](https://github.com/safishamsi/graphify) 當前近 7 萬星、仍在快速成長；[brooks-lint](https://github.com/hyhmrright/brooks-lint) 1,118 星。它們都很紅。但這篇的全部論點，靠的不是星數，正好相反——它們很紅、我的 agent 卻不採用，這個反差本身才是重點。至於文中提到的自評工具 [check-my-stack](https://github.com/GGGODLIN/check-my-stack) 是使用者自己開源的（0 星）。
