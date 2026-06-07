---
title: 下架不等於從你電腦消失
description: 用一次真實命中的故事，說明為什麼 bumblebee 這種掃磁碟的工具值得列進常規。
voice: v3-threads-line-cc-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: posts/delisted-extension-still-on-disk-MATERIAL.md
---

今天例行跑本機分析，[bumblebee](https://github.com/perplexityai/bumblebee) 跳出兩個 critical 命中，同一顆 extension、VS Code 跟 Cursor 各一路徑。

命中的是 sissel.shopify-liquid 這個 Shopify Liquid 語法的 VS Code extension，我平常在寫 Shopify 主題模板時會用到。一查才知道，這是 [GlassWorm](https://www.koi.ai/blog/glassworm-first-self-propagating-worm-using-invisible-code-hits-openvsx-marketplace) 首波受害的七個 extension 之一，2025 年 10 月就被點名，算起來在我硬碟上大概躺了八個月左右。

沒想到一個「我以為上次掃沒問題」的 extension，在今天的 catalog 更新後直接跳 critical。

---

先稍微說一下 GlassWorm 是什麼。它是 VS Code 生態第一個會自我傳播的蠕蟲，Koi Security 2025 年 10 月命名。攻擊邏輯不複雜，但藏得很深：惡意碼藏在人眼看起來像空行的不可見 Unicode 字元裡，JavaScript 解譯器執行、靜態分析看不到。extension 裝進去之後，它會偷 NPM、GitHub、Git 的認證憑證，加上四十幾種加密貨幣錢包 extension 的資料，然後用偷來的憑證去感染這個開發者發佈的其他 extension，一個傳一個地擴散。

規模到最後是首波七個 extension、累計約三萬五千次下載，之後又有第二波、第三波繼續演化。

說這些是為了說明一件事：這不是普通的套件漏洞，它不是靠更新就能堵的型別。

---

然後這裡就有三個反直覺的地方。

第一，marketplace 把惡意 extension 下架，只是讓新人裝不了。已經裝在你電腦上的那顆，不會因為下架而被移除。VS Code 跟 Cursor 沒有「下架自動清除本機副本」這個機制。

第二，VS Code 的自動更新只往版號更高的方向走，不會自動降版。sissel.shopify-liquid 的情況是，本機這顆 4.0.1 被多個公開來源列為惡意版本，而它的版號又高於 registry 目前現存的最高合法版。編輯器看到版號「已是最新」，就不動了。孤兒版就這樣凍在硬碟上。

第三，常見的掃描型工具，像 npm audit、Snyk、OSV、Dependabot 這類，它們掃的是依賴清單比對 CVE 資料庫。一顆已安裝、但資料庫還沒收進惡意版本紀錄的 extension，對它們來說是透明的。加上不可見 Unicode 讓靜態分析也視為空白。結果就是，市集端防禦和傳統掃描工具一起失效，惡意 extension 靜置在硬碟上幾個月都沒有訊號。

這三個洞疊在一起，才說得清楚為什麼磁碟掃描這條路特別重要。

---

bumblebee 在做的事，正好是補上這個盲區。

它不是掃依賴清單、不是行為偵測、也不是網路流量監控。它的機制是：掃本機磁碟實際裝了哪些東西，然後跟威脅情報 catalog 做精確比對，比對單位是「生態 + 名稱 + 版本」，三個同時中才算命中。

所以即使 marketplace 已經下架、即使編輯器認為「已是最新」、即使靜態分析看不到，只要 catalog 收了這顆版本的惡意紀錄，掃一次就會抓出來。

可以跨的生態不只 VS Code extension，npm、PyPI、Go、RubyGems、Packagist 都掃，也支援 MCP 跟瀏覽器 extension。目前的 catalog 有 931 條威脅情報，涵蓋 npm 蠕蟲、偽造套件名（typosquat）、認證憑證竊取、加密貨幣竊取、RubyGems 與 Packagist 惡意套件、editor extension 蠕蟲，GlassWorm 一家就貢獻了兩百多條。

重點是它掃的是磁碟實際狀態，跟「你的 package.json 寫了什麼」是兩件事。

---

我是在五月底把 bumblebee 接進每日本機分析，當成第六個偵測頻道。

三次掃描的數字放出來比較直觀：五月二十四日啟動那天，catalog 626 條，掃過約六萬七千個套件，0 findings。五月三十一日，catalog 654 條，掃過約六萬七千個套件，還是 0 findings。六月七日今天，catalog 931 條，掃過約六萬六千個套件，跑了四秒，2 findings，全部 critical。

catalog 是兩週內從 626 條長到 931 條，不是一夕暴增。今天的命中，是因為今天的 catalog 更新才把 GlassWorm 的 signature 收進來。

---

這邊要自問自答一下：那「之前掃都沒問題」是真的沒問題嗎？

其實之前兩次 0 findings，是假陰性。GlassWorm 首波 2025 年 10 月就曝光，這顆惡意版本早就在，只是 catalog 沒收。catalog 今天才加進 GlassWorm 的紀錄，今天才抓到，不代表今天才有問題。

這個性質也定義了 bumblebee 的能力邊界：它能精確抓到 catalog 已收錄的已知惡意版本，零時差攻擊它管不到。工具的實際價值完全取決於 catalog 更新有多及時，知道這一點，用起來才準。

---

命中當下的處置：用編輯器指令把 extension 標為要移除，再手動物理刪掉兩個路徑下的目錄，因為 CLI 的 uninstall 只標記 .obsolete，編輯器不跑的話不會真的清掉。之後掃 LaunchAgents、Daemons、監聽 port、hosts 檔、認證憑證、C2 連線紀錄，全部乾淨。

但乾淨不等於完全沒風險。GlassWorm 的 C2 基礎設施在 2026 年 5 月 26 日由 CrowdStrike、Google、Shadowserver 聯合查抄，推斷原 C2 已失聯。就算當時有任何認證憑證在 extension 執行期間外傳，現在沒有活躍後門的跡象，也不能直接說明歷史上沒有洩漏過。所以比較誠實的做法是預防性輪換 token，當保險，而不是「掃乾淨了就好」。

---

試用期到今天正好拍板 KEEP，留在每日例行裡繼續跑。

這個工具在我評估過的一堆「裝了沒用、最後否決」的工具裡頭，是少數在試用期內真的命中、而且正好打中我日常工作場景（Shopify Liquid 開發）的。工具的價值在有真實命中的那天，才知道它在做什麼。

marketplace 清乾淨不等於你的電腦也清乾淨，這是兩件事。如果你也長期裝著一堆 VS Code extension，起碼跑一次磁碟掃描，確認一下。
