---
title: AI 的 WebSearch 排序對「找官方文件」不可信
description: 2026-05-10 實測：同一個查詢，AI 內建搜尋給我 10 條 link，一條都不是官方文件專頁；瀏覽器走真實 Google，第一條就是。
voice: v3-threads-line-cc-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: posts/websearch-misses-official-docs-MATERIAL.md
---

# AI 的 WebSearch 排序對「找官方文件」不可信

前陣子在問 Claude Code 有沒有支援 computer use，AI 回答得很篤定，還特別說引用了「Anthropic 官方來源」佐證。

我原本以為「有官方來源」就等於「看到官方文件了」，後來才發現這個直覺大錯特錯。

---

AI 的答覆基礎是 WebSearch 那批搜尋結果。一開始我沒追問，它說引用的是 Anthropic 官方 X 貼文加上 Simon Willison 的直播文字稿，語氣還蠻有把握的。我起疑，要它回頭細看那 10 條連結到底是什麼。

它認了：「你抓到了我打混。校正：那 10 條裡沒有 `code.claude.com/docs/en/computer-use` 這條。給的官方域名連結是 `/docs/en/desktop`（Desktop app 說明頁，不是你問的那個功能專頁）加上 `support.claude.com release-notes`（說明中心的版本摘要）。」

X 貼文、說明中心、直播文字稿，都不等於官方文件——它把這幾種來源混稱為「官方源」，在根本沒看到功能專頁的情況下就給了結論。

---

同一個查詢，我另外跑了瀏覽器那條路徑：用 claude-in-chrome 導到 Google，然後抽 SERP 結果區塊，只取標題、網址、摘要三欄成結構化資料。第一條就是 `code.claude.com/docs/en/computer-use`，完整的官方功能專頁。

兩條路徑，結果差這麼遠。

順帶說個細節：claude-in-chrome 走的是我本人登入的 Chrome，不是無痕或 headless，所以 Google 有拿到帳號和地理資訊，排序有個人化。這對可重現性有影響——但也代表那個結果其實比「一般搜尋」更貼近我的日常使用情境。

---

為什麼 WebSearch 會把官方文件排在二手文章後面？這邊要誠實說：我不知道，也沒有找到可信的解釋。去查了 Anthropic 的官方 web search tool 文件，詳細寫了 API 用法、計價、參數版本（`web_search_20250305`、`web_search_20260209`），全篇完全沒提後端搜尋來源是哪家，沒有 Brave、Bing、Google、Exa 任何字樣。

使用者無從得知它在搜哪個索引，「官方文件記載缺席」這件事本身，就是必須獨立驗證而不是信任 WebSearch 排序的結構性理由。

---

這個現場讓我整理出一個判別規則，以後查官方文件時可以用：

X 貼文（就算是官方帳號）、說明中心的版本摘要、部落格 / 教學 / 直播文字稿，這些都 ≠ 官方文件。唯一算「引用官方文件」的是官方域名的功能專頁。

這是負向判別，不是什麼「由低到高的權威排序」，就是簡單的「這些不算，只有那個算」而已。

---

解法也不複雜。WebSearch 還是跑，快、省配額，但拿來做快速 URL 清單用。要確認有沒有看到官方文件，要另一條路：瀏覽器導到 Google 後抽 SERP 結構化結果。比截圖可靠，比抓整頁純文字省 token。

直接用 WebFetch 或 mcp__fetch 白嫖 Google SERP 是死路——WebFetch 對 `google.com/search` 會 60 秒逾時沒有回應，mcp__fetch 則被 `robots.txt` 的 `Disallow: /search` 擋回來。

所以是：WebSearch 快速清單 + 瀏覽器 SERP 交叉比對，不是拿任一條單幹。

---

這個觀察後來被固化成強制機制——PreToolUse hook 跑 WebSearch 時強制要求同步跑瀏覽器 SERP 對照，還有對應的指令和 skill 段落。變成系統層的硬約束，說明這不是偶發邊緣個案。

時效標記：2026-05-10 實測，WebSearch 排序未來可能不同。但「搜尋結果含官方域名連結 ≠ AI 看到官方文件」這個判準，跟工具版本沒有關係，應該是長效的🤔

供大家參考。
