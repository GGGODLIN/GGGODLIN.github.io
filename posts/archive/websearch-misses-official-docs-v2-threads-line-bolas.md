---
title: "AI 說「引用官方文件」，但那 10 條連結裡沒有官方文件"
description: "2026-05-10 實測紀錄：同一個查詢，WebSearch 回的 10 條結果沒有官方 computer-use 專頁；同一個查詢走瀏覽器真實 SERP，第一條就是。加上 AI 把 X 貼文和直播文字稿混稱「官方來源」這件事，讓我決定固化成強制機制。"
voice: v2-threads-line-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: posts/websearch-misses-official-docs-MATERIAL.md
---

前兩天回頭整理了一件 5 月 10 號發生的事，整理完之後覺得應該記下來。

那天在查「Claude Code 是否支援 computer use」，讓 AI 幫我查，它答得很篤定，引用的來源標的是「Anthropic 官方 X 貼文 + Simon Willison 直播文字稿」。我當時覺得怪，因為這兩個東西聽起來都不像是功能說明文件。

追問之後，AI 回頭細看 WebSearch 搜回來的那 10 條連結，然後認帳：「你抓到了我打混。校正：我 WebSearch 那 10 條連結裡沒有 `code.claude.com/docs/en/computer-use` 這條。」

它給的官方域名連結有兩條——一條是 `/docs/en/desktop`（Desktop 應用程式說明，和 computer use 功能沒關係），另一條是 `support.claude.com` 的版本更新說明。都不是功能專頁。

---

同一個查詢，我讓 AI 去瀏覽器走真實 Google 搜尋，用 javascript 抽了 SERP DOM 前十幾條，只取標題、網址、摘要三欄成結構化資料。結果第一條就是 `code.claude.com/docs/en/computer-use`。

兩條工具路徑、同一個查詢、完全不同的排序結果。

---

這帶出一個我原本沒意識到的問題：「搜尋結果裡有某個官方域名連結」不等於「AI 引用了官方文件」。

四種來源類型都不等於官方文件：官方 X 貼文（即使是官方帳號）、說明中心的版本更新摘要、部落格文章、直播文字稿，這些都是二手或旁路的資訊來源，和官方功能說明專頁是不同的東西。唯一算「引用官方文件」的，是官方域名的功能專頁本身。

這不是排高低，是說前面這四種你直接拿來引用，等於沒有看過官方文件。

---

解法其實就是這次用的方法：讓瀏覽器導到 Google 查詢頁，抽 SERP 結構化結果做比對，而不是只靠 WebSearch 的連結清單。

這邊的一個小前提是：用的是我本人登入狀態的 chrome，不是無痕或 headless，Google 拿得到 cookie 跟帳號資訊，給的是個性化排序，比開無痕更接近我平常搜到的結果。不同的人跑，可能不完全一樣。

直接抓取 Google 搜尋頁是死路：WebFetch google.com/search 等了 60 秒直接逾時，另一條路徑則被 Google 的 robots.txt `Disallow: /search` 擋掉。所以瀏覽器導覽這條才是唯一能走的。

---

為什麼 WebSearch 排序會把官方文件擺在二手文章後面——這我確實不知道，個人 memory 裡找不到成因，Anthropic 官方的 web search tool 說明文件也不提後端搜尋來源是哪家（文件裡有版本號、計價方式、參數說明，就是沒有「我們用哪個搜尋引擎」這行字）。

所以連要推斷成因都推斷不了，只能記下這個觀察。

---

這件事後來被我固化成強制機制了——一個 PreToolUse hook，觸發 WebSearch 時同步跑瀏覽器 SERP，後面還做了一個指令和一個 skill 段落來管這件事。固化的原因就是它不是偶發，是高頻失效點，一不注意就過。

如果你在用 Claude Code 或同類工具查官方文件，最保險的方法是要求 AI 給你確認它搜到的那條 URL 是官方域名的功能專頁，不是 X 貼文、不是說明中心的更新摘要、不是部落格。AI 搜到「某個官方域名的連結」這件事本身，不構成「它看過官方文件」的證明。🤔

也算是老問題了，只是第一次被我逮到現行的打混過程。
