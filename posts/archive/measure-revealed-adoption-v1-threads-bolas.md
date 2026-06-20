---
title: 嘴上說想要，agent 一次沒選過
description: 量行為數據才是真的。為什麼 0 次自發採用讓我砍掉「把 codemap 做成互動圖」這個計畫，以及怎麼量準才不會拿到假數字。
voice: v1-threads-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: posts/measure-revealed-adoption-MATERIAL.md
---

前兩天在翻 session log 量 codemap 被讀了幾次，差點因為 filter 寫錯工具名，給出一份全是 0 的假報告。就算量對了，數字本身已經很殘忍了。

這篇接著[第六篇〈裝了一堆 codebase 搜尋工具，agent 幾乎都不用〉](https://gggodlin.github.io/blog/code-search-adoption/)繼續往下走。那篇是「採用率才是真跑分」的結論，這篇是「怎麼把採用率量出來、量準」的操作。

---

## graphify 先被我 AST 的浪漫害死一次

在量 codemap 之前，[graphify](https://github.com/safishamsi/graphify) 已經讓我打臉過一輪。

graphify 近 7 萬星（live 核 2026-06-20，仍持續漲），主打純 AST 結構圖。我的 CC 當時提案說可以用它取代 Explore subagent，概念上成立，兩個都在「讀 codebase 結構」。

然後我要求它去 verify。

驗完之後發現 Explore subagent 真正做的四件事，純 AST 全做不到：HTTP route 辨識、settings 欄位追蹤、業務語意理解、scope 過濾。把那四件事列出來之後，「取代」兩個字就沒辦法說出口了，最多只能說「補強」。

這是 graphify 第一次被行為驗證擋下來。問題不是工具不好，是科別根本不一樣。結構圖工具的上限就是 AST + 爬 `# WHY:` 註解，業務邏輯進不去。

---

## 6 週，agent 自己選 codemap 0 次

「取代」收斂成「補強」之後，graphify 還剩最後一個有意思的軸：它的 callflow-html renderer 可以把 codemap 這種純文字 pre-curated 文件包成互動圖，借鑑這個呈現方式。

我 2026-05-02 跟 CC 說過「只生純 md 對人類不是很友善」，我想要 DeepWiki 風格的互動 wiki。

但投資之前我先去量了 codemap 當下的採用率。

主力工作 repo（45 個活躍 session、211 個 commit）裡，Read 工具總共被呼叫 1298 次。codemap 被讀到 8 次，0.62%。

然後我去看那 4 個有讀到的 session 的脈絡：

- 1 個是生成 codemap 本身（那個 session 有 Write / Edit）
- 剩下 3 個的 user 訊息都明確點名要 CC 讀 CODEMAPS，分別點名 2 / 3 / 2 次

排掉生成 session、排掉使用者明確要求的 session 之後，CC **自發選擇讀 codemap 的次數 = 0**。

我口頭說我想要互動 wiki。我的 agent 6 週一次都沒有主動走過去那份文件。

連我自己的口頭意願都被我的 agent 用行為否決了，何況工具自稱的能力。

把 codemap 包成互動圖不會解決這件事，問題不在呈現層，在 agent 根本不覺得要去讀它。

---

## brooks-lint 要 graft 進哪個 reviewer，看 spawn 數不看感覺

[brooks-lint](https://github.com/hyhmrright/brooks-lint) 1,118 星（live 核 2026-06-20），這是一組程式碼衰退風險詞彙的分類學。我要把它 graft 進 reviewer agent。

第一直覺是放進 architecture-critic，概念最對口，lint 架構衰退嘛。

然後我去量了 2026-06-09 那個時間點，各 reviewer 被派的次數（快照，不是恆定值）：

| agent | spawn 次數 |
|---|---|
| general-purpose | 875 |
| code-reviewer | 88 |
| typescript-reviewer | 41 |
| architecture-critic | 2 |
| tdd-guide | 0 |

architecture-critic 2 次，而且去看那 2 次的 description，都是在 review 設計文件，不碰 code。tdd-guide 0 次，死碼。

把衰退風險偵測放進一個幾乎沒人派的 agent，等於冷凍它。

增強最後落在 code-reviewer 和 typescript-reviewer，打到全部活路徑。概念對口但沒人走的那條路，不是放東西的好地方。

---

## filter 寫錯工具名，差點全回 0

這些數字怎麼量出來的，這段也要交代清楚，因為量法本身也會出錯。

一開始我 filter 的工具名是 `Task`，從 session log jsonl 裡數某個 subagent 被 spawn 幾次。結果全部回 0。

先以為是 agent 真的沒被派過，後來對照組出賣了我。general-purpose 也回 0，這不可能。

dump 真實的 jsonl 結構看，spawn 的工具名在這台機器的 CC 版本是 `Agent`，不是 `Task`。filter 條件寫錯，假陰性全開。

改過之後數字才正常。

這件事讓我固定了一個雙重驗證的流程：

1. **grep 字串 + strict parse 對照**：先用 grep 數工具名字串（快，但會吃到對話裡提到該字串的污染），再 strict parse 真實 tool_use。兩個數字差很多 = 有污染；一致 = 可信。code-reviewer 那個案例 grep 88 == strict 88，確認無污染。
2. **對照組 sanity check**：一定要對主力 general-purpose 驗。它回 0 就是 parse 邏輯壞了，不是真的沒被派。

還有一個孿生陷阱值得提：量試用工具的真實使用次數時，grep 工具名字串會嚴重高估。plannotator 那個案例，grep 命中 127 個 session，strict parse 真實使用 = 0。

高估來源有三個：trial-review hook 每次 session 開始會注入那個工具名提醒、試用清單檔被讀進 context、review 當下自己 grep 該工具名的指令也進了當前 session。

試用工具是 binary 的（有沒有真的呼叫），最快的 ground truth 是 binary atime + strict 解析真實 Bash 命令呼叫，不是 grep 字串計數。

---

## 可複用的判準就四條

整理一下：

**投資「把 X 變漂亮 / 互動 / graft 增強」之前，先量 X 當下的自發採用率。** 不接受口頭的「我想要」，不接受工具自稱的能力，只看行為數據。

0 次自發採用 = 需求面已死。貼上互動皮、做成漂亮 UI、graft 新功能，問題不在呈現層，在 agent 根本不走那條路。

要判斷某個 agent / skill 要不要升級 / 保留，量它的 spawn 數。把 0 spawn 標成「成熟」是「存在 ≠ 使用」的錯。增強要落在真正活的路徑。

量的時候四條技術紀律：工具名別猜（`Agent` 不是 `Task`）；grep 字串跟 strict parse 要對照；對照組 sanity check 不能省；試用工具用 atime 而不是字串 grep。

這套流程在 [check-my-stack](https://github.com/GGGODLIN/check-my-stack) 裡也有用到，量 agent 的 revealed adoption（行為偏好） 其實就是那個框架裡「量真實使用而不是能力清單」的操作層。

只要量的東西是行為，不是意願，結論通常比你預想的殘忍。但至少是真的。
