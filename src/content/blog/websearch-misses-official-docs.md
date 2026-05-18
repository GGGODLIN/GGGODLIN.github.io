---
title: "AI 說它查過官方文件，但它沒有"
description: "2026-05-10 實測：同一個查詢，WebSearch 回傳 10 條連結，沒有一條是官方文件專頁。瀏覽器走真實 Google 第一條就是。"
pubDate: 2026-05-18
tags: ["claude-code", "websearch", "fact-check", "retrospective"]
---

# AI 說它查過官方文件，但它沒有

2026-05-10，我問 Claude Code 一件事：「現在 computer use 有沒有支援？怎麼用？」

AI 答得很篤定，引用了 Anthropic 官方 X 貼文和 Simon Willison 的直播文字稿，稱之為「官方來源」。我看了一下，覺得怪怪的，追問：「這些是官方文件嗎？你 WebSearch 拿到哪些連結？」

AI 回頭細看那 10 條連結，然後說了一句話，大意是：「你抓到了我打混。校正：那 10 條裡面沒有 `code.claude.com/docs/en/computer-use` 這條。給的官方域名連結是 `/docs/en/desktop`（Desktop app 說明頁，錯頁）和 `support.claude.com release-notes`（說明中心版本摘要）。」

X 貼文加直播文字稿，混稱「引用官方來源」。我本來以為只是偶爾失手，後來認定這是「找官方文件」場景的結構性盲點——嚴重到值得固化處理，不是排序順不順的小事。

---

## WebSearch 不給的，瀏覽器第一條就是

同一個查詢，我讓 AI 用瀏覽器導到 Google，再用 javascript 抽搜尋結果區塊的結構化資料——只取標題、網址、摘要三欄，前十幾條。第一條回來就是 `code.claude.com/docs/en/computer-use`。

WebSearch：10 條，無官方文件專頁。
瀏覽器走真實 Google：第一條就是。

這個差距，在「AI 需要看官方文件才能給正確答案」的場景裡，代表的是完全錯誤 vs. 正確的差別，不是排序第幾的差別。

補充一個前提：瀏覽器走的是我自己登入的 Chrome，不是無痕也不是 headless。Google 拿到我的帳號和地理資訊，排序含個人化——比開無痕還貼近日常結果，不是什麼乾淨受控的實驗環境。這個前提要說清楚。

（順帶一提，想直接抓 Google SERP 有兩條旁道是死路：WebFetch google.com/search 直接 60 秒逾時無回；mcp__fetch 被 Google robots.txt 的 `Disallow: /search` 擋掉。所以一定要走瀏覽器。）

---

## X 貼文不等於官方文件

被那個逆轉現場觸發之後，我想清楚了一件事：「結果清單裡有官方域名的連結」，不等於「AI 引用了官方文件」。

實際上不算官方文件的來源有哪些：

- X/Twitter 貼文（就算是官方帳號發的）
- 說明中心的版本摘要（`support.claude.com`、`release-notes` 這類）
- 部落格文章、教學、直播文字稿（就算是 Simon Willison 寫的）

唯一算「AI 引用了官方文件」的：官方域名下的功能專頁，就是 `code.claude.com/docs/en/computer-use` 那種。

這不是在排這四類的權威高低，而是在說：**前三類都不算**。沒看到官方功能專頁，就是沒看到官方文件，不管拿了多少其他官方相關連結來。

---

## 為什麼 WebSearch 排序會這樣

老實說，我不知道。

我去翻 Anthropic 的官方工具文件（`platform.claude.com`），詳列了 web search tool 的版本（`web_search_20250305`、`web_search_20260209`）、計價、參數，全篇找不到後端搜尋來源是哪家——沒有 Brave、Bing、Google、Exa 這些字。

使用者根本不知道它在搜什麼索引。這正是沒辦法靠信任它來省略獨立驗證的結構性原因。

這個「官方文件明明詳列一切卻不提後端搜尋來源」的缺席，本身就是一個可以觀察的事實。

---

## 驗證 AI 有沒有真的看到官方文件

這件事的耐久結論不是「WebSearch 現在很爛」，因為排序會變。耐久的是方法：

**要確認 AI 是否看到官方文件，需要獨立的工具路徑**——瀏覽器走真實 Google SERP + 抽結構化結果，不是信任 WebSearch 給的清單。

一輪可靠的查核大概長這樣：WebSearch 快速拿 URL 清單（快但排序不可信），瀏覽器 SERP 驗證官方功能專頁確實在前幾名，兩條交叉。靠單一工具，不管哪條，都有遺漏的可能。

這件事後來被我固化成強制機制了——一個 PreToolUse hook，觸發 WebSearch 時同步跑瀏覽器 SERP，後面還做了一個指令和一個 skill 段落來管這件事。固化的原因就是它不是偶發，是高頻失效點，一不注意就過。

如果你在用 Claude Code 或同類工具查官方文件，最保險的方法是要求 AI 給你確認它搜到的那條 URL 是官方域名的功能專頁，不是 X 貼文、不是說明中心的更新摘要、不是部落格。AI 搜到「某個官方域名的連結」這件事本身，不構成「它看過官方文件」的證明。🤔

---

也算是老問題了，只是第一次被我逮到現行的打混過程。
